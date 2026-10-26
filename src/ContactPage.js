import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ContactPage.css';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    contactNo: '',
    email: '',
    subject: '',
    message: '',
  });
  const [messageStatus, setMessageStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessageStatus('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User is not authenticated. Please log in.');
      }

      const response = await axios.post(
        'http://localhost:3001/api/contact',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setMessageStatus(response.data.message);
      setFormData({ name: '', contactNo: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Failed to send message', error);
      setMessageStatus('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact-page">
      <div className="contact-wrapper">
        <div className="contact-container">
          {/* Image Side */}
          <div className="image-section">
            <img src={require('./images/Mission 2.jpeg')} alt="Contact Background" />
            <div className="image-text">
              <h2>Connect with Care</h2>
              <p>Your health journey matters to us. Reach out for support and guidance.</p>
            </div>
          </div>

          {/* Form Side */}
          <div className="form-section">
            <h1>Contact Us</h1>
            <p>We're here to assist you. Fill out the form below!</p>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Name"
                  required
                />
                <input
                  type="tel"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleChange}
                  placeholder="Contact No."
                  required
                />
              </div>
              <div className="form-row">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                />
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                  required
                />
              </div>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Message"
                required
              ></textarea>
              <button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Submit'}
              </button>
              {messageStatus && (
                <p className="message-status">{messageStatus}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactPage;