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

// Add the /api/update-profile endpoint
app.put('/api/update-profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const {
    fullName,
    email,
    gender,
    age,
    height,
    weight,
    bloodType,
    allergies,
    chronicConditions,
    medicalHistory,
    emergencyContact,
  } = req.body;

  if (!fullName || !email || !gender || !age || !height || !weight || !bloodType || !emergencyContact) {
    return res.status(400).json('Please provide all required fields');
  }

  mockConnection.query(
    'UPDATE users SET full_name = ?, email = ?, gender = ?, age = ?, height = ?, weight = ?, blood_type = ?, allergies = ?, chronic_conditions = ?, medical_history = ?, emergency_contact = ? WHERE id = ?',
    [
      fullName,
      email,
      gender,
      age,
      height,
      weight,
      bloodType,
      allergies || null,
      chronicConditions || null,
      medicalHistory || null,
      emergencyContact,
      userId,
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json('Email already exists');
        }
        return res.status(500).json('Database error');
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'Profile updated successfully' });
    }
  );
});

describe('PUT /api/update-profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should update user profile successfully', async () => {
    const token = jwt.sign({ id: 1 }, 'your_jwt_secret', { expiresIn: '1h' });

    mockConnection.query.mockImplementation((query, params, callback) => {
      callback(null, { affectedRows: 1 });
    });

    const response = await request(app)
      .put('/api/update-profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
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

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Profile updated successfully');
  });

  test('should return 400 if required fields are missing', async () => {
    const token = jwt.sign({ id: 1 }, 'your_jwt_secret', { expiresIn: '1h' });

    const response = await request(app)
      .put('/api/update-profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        // Missing other required fields
      });

    expect(response.status).toBe(400);
    expect(response.body).toBe('Please provide all required fields');
  });

  test('should return 404 if user is not found', async () => {
    const token = jwt.sign({ id: 1 }, 'your_jwt_secret', { expiresIn: '1h' });

    mockConnection.query.mockImplementation((query, params, callback) => {
      callback(null, { affectedRows: 0 });
    });

    const response = await request(app)
      .put('/api/update-profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
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

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  test('should return 400 if email already exists', async () => {
    const token = jwt.sign({ id: 1 }, 'your_jwt_secret', { expiresIn: '1h' });

    mockConnection.query.mockImplementation((query, params, callback) => {
      callback({ code: 'ER_DUP_ENTRY' }, null);
    });

    const response = await request(app)
      .put('/api/update-profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
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

    expect(response.status).toBe(400);
    expect(response.body).toBe('Email already exists');
  });
});