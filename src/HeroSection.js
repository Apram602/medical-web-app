import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HeroSection.css';

function HeroSection({ setSymptoms }) {
  const [localSymptoms, setLocalSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (token && userId) {
        try {
          const response = await axios.get(`http://localhost:3001/api/user/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserData(response.data);
        } catch (err) {
          setError('Failed to fetch user data');
        }
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (event) => {
    setLocalSymptoms(event.target.value);
  };

  const handleSearchClick = async () => {
    if (!localSymptoms) {
      setError('Please enter symptoms');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3001/diagnose', {
        symptoms: localSymptoms,
      });
      setDiagnosis(response.data.diagnosis);
      setSymptoms(localSymptoms);
    } catch (error) {
      console.error('Failed to fetch diagnosis', error);
      setError('Failed to fetch diagnoses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="hero">
      <div className="hero-content">
        {userData && (
          <div className="user-profile">
            <h3>Welcome, {userData.fullName}!</h3>
          </div>
        )}
        <h2>Welcome to Your Healthcare Solution</h2>
        <p>Your Problem Solution At Your Doorstep</p>
        <input
          type="text"
          value={localSymptoms}
          onChange={handleInputChange}
          placeholder="Enter symptoms (e.g., cough, fever)"
          aria-label="Enter symptoms for diagnosis"
        />
        <button onClick={handleSearchClick} disabled={loading}>
          {loading ? 'Searching...' : 'Search Now'}
        </button>
        {error && <div className="error-message">{error}</div>}
        {diagnosis && (
          <div className="diagnoses-results">
            <h3>Potential Diagnosis:</h3>
            <p>{diagnosis}</p>
            <p className="disclaimer">
              *This is a preliminary analysis. Upload a medical document for more details or consult a doctor.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default HeroSection;