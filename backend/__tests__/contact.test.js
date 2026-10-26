const request = require('supertest');
const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Mock nodemailer
jest.mock('nodemailer');
const mockSendMail = jest.fn();
nodemailer.createTransport.mockReturnValue({ sendMail: mockSendMail });

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

// Add the /api/contact endpoint
app.post('/api/contact', authenticateToken, async (req, res) => {
  const { name, contactNo, email, subject, message } = req.body;

  if (!name || !contactNo || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const userId = req.user.id;

    // Mock fetching the user's email from the users table
    const [userRows] = await mockConnection.query('SELECT email FROM users WHERE id = ?', [userId]);
    const userEmail = userRows[0].email;

    // Mock saving to database
    await mockConnection.query(
      'INSERT INTO contact_messages (user_id, name, contact_no, email, subject, message) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, name, contactNo, email, subject, message]
    );

    // Mock sending email
    const mailOptions = {
      from: 'docongo101@gmail.com', // Updated to match server.js
      to: 'docongo001@gmail.com', // Updated to match server.js
      replyTo: userEmail,
      subject: `New Contact Form Submission: ${subject}`,
      text: `
        Name: ${name}
        Contact No: ${contactNo}
        User Email: ${email}
        Subject: ${subject}
        Message: ${message}
      `,
    };

    await mockSendMail(mailOptions);
    res.json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

describe('POST /api/contact', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should submit contact form successfully', async () => {
    const token = jwt.sign({ id: 1 }, 'your_jwt_secret', { expiresIn: '1h' });

    // Mock the database queries
    mockConnection.query
      .mockResolvedValueOnce([[ { email: 'user@example.com' } ]]) // Mock user email fetch
      .mockResolvedValueOnce(); // Mock saving to database

    const response = await request(app)
      .post('/api/contact')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'John Doe',
        contactNo: '1234567890',
        email: 'john.doe@example.com',
        subject: 'Test Subject',
        message: 'This is a test message.',
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Message sent successfully!');
    expect(mockConnection.query).toHaveBeenCalledTimes(2);
    expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'docongo001@gmail.com', // Updated to match server.js
      to: 'docongo001@gmail.com',
      replyTo: 'user@example.com',
      subject: 'New Contact Form Submission: Test Subject',
      text: expect.stringContaining('Name: John Doe'),
    }));
  });

  test('should return 400 if required fields are missing', async () => {
    const token = jwt.sign({ id: 1 }, 'your_jwt_secret', { expiresIn: '1h' });

    const response = await request(app)
      .post('/api/contact')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'John Doe',
        contactNo: '1234567890',
        email: 'john.doe@example.com',
        // Missing subject and message
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('All fields are required');
  });

  test('should return 401 if token is missing', async () => {
    const response = await request(app)
      .post('/api/contact')
      .send({
        name: 'John Doe',
        contactNo: '1234567890',
        email: 'john.doe@example.com',
        subject: 'Test Subject',
        message: 'This is a test message.',
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Access denied');
  });

  test('should return 500 if database query fails', async () => {
    const token = jwt.sign({ id: 1 }, 'your_jwt_secret', { expiresIn: '1h' });

    // Mock a database error for the user email fetch
    mockConnection.query.mockRejectedValueOnce(new Error('Database error'));

    const response = await request(app)
      .post('/api/contact')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'John Doe',
        contactNo: '1234567890',
        email: 'john.doe@example.com',
        subject: 'Test Subject',
        message: 'This is a test message.',
      });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Server error');
  });
});