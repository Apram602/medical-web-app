require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { OpenAI } = require('openai');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const port = 3001;

// Enable CORS for requests from localhost:3000
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

// Serve the uploads directory statically
app.use('/uploads', express.static('uploads'));

// MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'docongo_users',
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected');
});

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Configure multer for file uploads
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/jpg',
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file type. Please upload a PDF, Word document (.docx), or image (JPEG/PNG).'));
        }
    },
});

// JWT Middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Configure Nodemailer for email sending
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Gmail address used to send mail
      pass: process.env.EMAIL_APP_PASSWORD, // Gmail App Password (never commit this)
    },
  });

// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json('Please provide email and password');
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json('Database error');
        }

        if (results.length === 0) {
            return res.status(401).json('Invalid email or password');
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json('Invalid email or password');
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ message: 'Login successful', token, userId: user.id });
    });
});

// Signup Endpoint
app.post('/api/auth/signup', async (req, res) => {
    const {
        email,
        password,
        fullName,
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

    if (!email || !password || !fullName || !gender || !age || !height || !weight || !bloodType || !emergencyContact) {
        return res.status(400).json('Please provide all required fields');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        'INSERT INTO users (email, password, full_name, gender, age, height, weight, blood_type, allergies, chronic_conditions, medical_history, emergency_contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
            email,
            hashedPassword,
            fullName,
            gender,
            age,
            height,
            weight,
            bloodType,
            allergies || null,
            chronicConditions || null,
            medicalHistory || null,
            emergencyContact,
        ],
        (err, result) => {
            if (err) {
                console.error(err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json('Email already exists');
                }
                return res.status(500).json('Database error');
            }

            const userId = result.insertId;
            const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
            res.json({ message: 'Signup successful', token, userId });
        }
    );
});

// Update Profile Endpoint
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

    db.query(
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

// Get User Data
app.get('/api/user/:id', authenticateToken, (req, res) => {
    const userId = req.params.id;

    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
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

// Get User Documents
app.get('/api/user-documents/:userId', authenticateToken, (req, res) => {
    const userId = req.params.userId;

    db.query('SELECT * FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC', [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }

        res.json(results);
    });
});

// Symptom Diagnosis Endpoint
app.post('/diagnose', async (req, res) => {
    try {
        const { symptoms } = req.body;
        if (!symptoms) {
            return res.status(400).json({ error: 'Symptoms are required' });
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'You are a medical assistant. Provide a preliminary diagnosis based on the symptoms provided. Do not provide a definitive diagnosis; recommend consulting a doctor.' },
                { role: 'user', content: `Symptoms: ${symptoms}` },
            ],
        });

        res.json({ diagnosis: response.choices[0].message.content });
    } catch (error) {
        console.error('Error diagnosing symptoms:', error);
        res.status(500).json({ error: 'Failed to diagnose symptoms' });
    }
});

// Document Upload and Diagnosis Endpoint
app.post('/upload-document', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const userId = req.user.id;
        const filePath = req.file.path;
        const fileName = req.file.originalname;
        const symptoms = req.body.symptoms || '';
        let textContent = '';

        if (req.file.mimetype === 'application/pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            textContent = data.text;
        } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ path: filePath });
            textContent = result.value;
        } else if (req.file.mimetype.startsWith('image/')) {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: 'Extract and analyze any medical text or describe the content of this image for a health report.' },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:${req.file.mimetype};base64,${fs.readFileSync(filePath).toString('base64')}`,
                                },
                            },
                        ],
                    },
                ],
            });
            textContent = response.choices[0].message.content;
        } else {
            return res.status(400).json({ error: 'Unsupported file type' });
        }

        const diagnosisResponse = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'You are a medical assistant. Provide a preliminary diagnosis or report based on the following text and symptoms (if provided). Recommend consulting a doctor.' },
                { role: 'user', content: `Symptoms: ${symptoms}\nDocument Content: ${textContent}` },
            ],
        });

        const diagnosis = diagnosisResponse.choices[0].message.content;

        // Save the document to the database
        db.query(
            'INSERT INTO documents (user_id, file_name, file_path, symptoms, diagnosis) VALUES (?, ?, ?, ?, ?)',
            [userId, fileName, filePath, symptoms, diagnosis],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Database error' });
                }

                res.json({ diagnosis, filePath, fileName });
            }
        );
    } catch (error) {
        console.error('Error processing document:', error);
        res.status(500).json({ error: 'Failed to process document' });
    }
});

// Book Appointment Endpoint
app.post('/book-appointment', (req, res) => {
    const { doctor, date, time } = req.body;
    console.log('Booking:', { doctor, date, time });
    res.json({ success: true, message: 'Appointment booked successfully!' });
});

// Add this mapping of conditions to specialties (you can expand this)
const conditionToSpecialtyMap = {
    'heart': 'Cardiology',
    'cardiac': 'Cardiology',
    'skin': 'Dermatology',
    'dermatitis': 'Dermatology',
    'fever': 'Family Medicine',
    'cough': 'Family Medicine',
    'child': 'Pediatrics',
    'pediatric': 'Pediatrics',
    // Add more mappings as needed
};

// Get Doctors by Condition
app.get('/api/doctors', async (req, res) => {
    const { condition } = req.query;

    if (!condition) {
        return res.status(400).json({ message: 'Condition is required' });
    }

    // Find the specialty based on the condition
    const conditionLower = condition.toLowerCase();
    const specialty = Object.keys(conditionToSpecialtyMap).find(key => conditionLower.includes(key))
        ? conditionToSpecialtyMap[Object.keys(conditionToSpecialtyMap).find(key => conditionLower.includes(key))]
        : 'Family Medicine'; // Default to Family Medicine if no match

    // Fetch doctors with the matching specialty
    db.query(
        'SELECT * FROM doctors WHERE specialty = ?',
        [specialty],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Database error' });
            }

            // Sort doctors by earliest availability
            const sortedDoctors = results.sort((a, b) => {
                const aAvailability = a.availability; // Already a JavaScript object
                const bAvailability = b.availability; // Already a JavaScript object

                const aEarliest = Object.keys(aAvailability).sort()[0];
                const bEarliest = Object.keys(bAvailability).sort()[0];

                if (!aEarliest) return 1;
                if (!bEarliest) return -1;
                return aEarliest.localeCompare(bEarliest);
            });

            res.json(sortedDoctors);
        }
    );
});

// Contact Form Endpoint
app.post('/api/contact', authenticateToken, async (req, res) => {
    const { name, contactNo, email, subject, message } = req.body;
  
    if (!name || !contactNo || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      const userId = req.user.id;
  
      // Fetch the user's email from the users table
      db.query('SELECT email FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Database error' });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
  
        const userEmail = results[0].email;
  
        // Save to database
        db.query(
          'INSERT INTO contact_messages (user_id, name, contact_no, email, subject, message) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, name, contactNo, email, subject, message],
          (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: 'Failed to save message' });
            }
          }
        );
  
        // Send email
        const mailOptions = {
          from: 'docongo101@gmail.com', // Sender email
          to: 'docongo001@gmail.com', // Receiver email (same as sender in this case)
          replyTo: userEmail, // User's email for replying
          subject: `New Contact Form Submission: ${subject}`,
          text: `
            Name: ${name}
            Contact No: ${contactNo}
            User Email: ${email}
            Subject: ${subject}
            Message: ${message}
          `,
        };
  
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ message: 'Failed to send email' });
          }
          console.log('Email sent: ' + info.response);
          res.json({ message: 'Message sent successfully!' });
        });
      });
    } catch (error) {
      console.error('Error processing contact form:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});