const request = require('supertest');
const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

// Define mockConnection before using it in jest.mock
const mockConnection = {
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
};

// Mock MySQL connection
jest.mock('mysql2/promise', () => ({
  createConnection: jest.fn().mockResolvedValue(mockConnection),
}));

// Create a test app
const app = express();
app.use(express.json());

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Add the /api/user/:id endpoint
app.get('/api/user/:id', authenticateToken, (req, res) => {
  const userId = req.params.id;

  mockConnection.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];
    res.json({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      gender: user.gender,
      age: user.age,
      height: user.height,
      weight: user.weight,
      bloodType: user.blood_type,
      allergies: user.allergies,
      chronicConditions: user.chronic_conditions,
      medicalHistory: user.medical_history,
      emergencyContact: user.emergency_contact,
    });
  });
});

describe('GET /api/user/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should retrieve user data successfully', async () => {
    const token = jwt.sign({ id: 1 }, 'your_jwt_secret', { expiresIn: '1h' });

    mockConnection.query.mockImplementation((query, params, callback) => {
      callback(null, [{
        id: 1,
        full_name: 'John Doe',
        email: 'john.doe@example.com',
        gender: 'Male',
        age: 30,
        height: 175,
        weight: 70,
        blood_type: 'O+',
        allergies: 'None',
        chronic_conditions: 'None',
        medical_history: 'None',
        emergency_contact: '1234567890',
      }]);
    });

    const response = await request(app)
      .get('/api/user/1')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 1,
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      gender: 'Male',
      age: 30,
      height: 175,
      weight: 70,
      bloodType: 'O+',
      allergies: 'None',
      chronicConditions: 'None',
      medicalHistory: 'None',
      emergencyContact: '1234567890',
    });
  });

  test('should return 404 if user is not found', async () => {
    const token = jwt.sign({ id: 1 }, 'your_jwt_secret', { expiresIn: '1h' });

    mockConnection.query.mockImplementation((query, params, callback) => {
      callback(null, []);
    });

    const response = await request(app)
      .get('/api/user/1')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  test('should return 401 if token is missing', async () => {
    const response = await request(app)
      .get('/api/user/1');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Access denied');
  });
});