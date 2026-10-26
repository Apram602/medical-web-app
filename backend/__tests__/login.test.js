const request = require('supertest');
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
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

// Add the /api/auth/login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json('Please provide email and password');
  }

  const [rows] = await mockConnection.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];

  if (!user) {
    return res.status(401).json('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json('Invalid email or password');
  }

  const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
  res.json({ message: 'Login successful', token, userId: user.id });
});

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should login successfully with valid credentials', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    mockConnection.query.mockResolvedValueOnce([[{ id: 1, email: 'john.doe@example.com', password: hashedPassword }]]);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.token).toBeDefined();
    expect(response.body.userId).toBe(1);
  });

  test('should return 400 if email or password is missing', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john.doe@example.com',
        // Missing password
      });

    expect(response.status).toBe(400);
    expect(response.body).toBe('Please provide email and password');
  });

  test('should return 401 if credentials are invalid', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    mockConnection.query.mockResolvedValueOnce([[{ id: 1, email: 'john.doe@example.com', password: hashedPassword }]]);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'wrongpassword',
      });

    expect(response.status).toBe(401);
    expect(response.body).toBe('Invalid email or password');
  });

  test('should return 401 if user is not found', async () => {
    mockConnection.query.mockResolvedValueOnce([[]]); // No user found

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(401);
    expect(response.body).toBe('Invalid email or password');
  });
});