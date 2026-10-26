import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import HeroSection from './HeroSection';
import Features from './Features';
import DocumentUpload from './DocumentUpload';
import About from './About';

function Home() {
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDiagnosis = async (newDiagnosis) => {
    setDiagnosis(newDiagnosis);

    // Fetch doctors based on the diagnosis
    try {
      const response = await axios.get('http://localhost:3001/api/doctors', {
        params: { condition: newDiagnosis },
      });
      setDoctors(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to fetch doctor suggestions.');
    }
  };

  return (
    <>
      <HeroSection setSymptoms={setSymptoms} />
      <div className="section-wrapper">
        <Features />
      </div>
      <div className="section-wrapper">
        <DocumentUpload symptoms={symptoms} setDiagnosis={handleDiagnosis} />
      </div>
      {diagnosis && (
        <div className="section-wrapper">
          <section className="doctor-suggestions" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', color: '#007bff', marginBottom: '2rem' }}>Doctor Suggestions</h2>
            {error && <p style={{ color: '#dc3545', marginBottom: '1rem' }}>{error}</p>}
            {doctors.length > 0 ? (
              <div>
                {/* Highlight the Fastest Available Doctor */}
                <div style={{
                  padding: '20px',
                  backgroundColor: '#e6f0fa',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  textAlign: 'left',
                  maxWidth: '600px',
                  margin: '0 auto',
                }}>
                  <h3 style={{ fontSize: '1.5rem', color: '#007bff', marginBottom: '10px' }}>Fastest Available Doctor</h3>
                  <p><strong>{doctors[0].full_name}</strong> ({doctors[0].specialty})</p>
                  <p>Contact: {doctors[0].contact_number}</p>
                  <p>Address: {doctors[0].address}</p>
                  <p>Earliest Availability: {Object.keys(doctors[0].availability)[0]}</p>
                  <button
                    onClick={() => navigate('/book-appointment', { state: { doctor: doctors[0] } })}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginTop: '10px',
                    }}
                  >
                    Book Appointment
                  </button>
                </div>

                {/* List of Other Doctors */}
                <h3 style={{ fontSize: '1.5rem', color: '#007bff', marginBottom: '1rem' }}>Other Available Doctors</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                  {doctors.slice(1).map((doctor) => (
                    <div key={doctor.id} style={{
                      padding: '20px',
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      width: '300px',
                      textAlign: 'left',
                    }}>
                      <h4 style={{ fontSize: '1.2rem', color: '#2c3e50', marginBottom: '10px' }}>{doctor.full_name}</h4>
                      <p>Specialty: {doctor.specialty}</p>
                      <p>Contact: {doctor.contact_number}</p>
                      <p>Address: {doctor.address}</p>
                      <p>Earliest Availability: {Object.keys(doctor.availability)[0]}</p>
                      <button
                        onClick={() => navigate('/book-appointment', { state: { doctor } })}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginTop: '10px',
                        }}
                      >
                        Book Appointment
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>No doctors found for this condition.</p>
            )}
          </section>
        </div>
      )}
      <div className="section-wrapper">
        <About />
      </div>
    </>
  );
}

export default Home;