import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './AppointmentBooking.css';

function BookAppointment() {
  const { state } = useLocation();
  const { doctor } = state || {};
  const [selectedDate, setSelectedDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!doctor) {
    return <p>No doctor selected.</p>;
  }

  const availability = doctor.availability; // No need for JSON.parse
  const availableDates = Object.keys(availability);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const appointmentData = {
      doctor: doctor.full_name,
      date: selectedDate,
      time: appointmentTime,
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User is not authenticated. Please log in.');
      }

      const response = await axios.post('http://localhost:3001/book-appointment', appointmentData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(response.data.message);
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Booking failed', error);
      setMessage('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="appointment-booking">
      <h2>Book an Appointment with {doctor.full_name}</h2>
      <p>Specialty: {doctor.specialty}</p>
      <p>Contact: {doctor.contact_number}</p>
      <p>Address: {doctor.address}</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="date">Select Date:</label>
          <select
            id="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setAppointmentTime('');
            }}
            required
          >
            <option value="">Choose a date</option>
            {availableDates.map((date) => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>

        {selectedDate && (
          <div className="form-group">
            <label htmlFor="time">Select Time:</label>
            <select
              id="time"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              required
            >
              <option value="">Choose a time</option>
              {availability[selectedDate].map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Booking...' : 'Book Now'}
        </button>
        {message && <p className="message">{message}</p>}
      </form>
    </section>
  );
}

export default BookAppointment;