import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const url = isLogin
      ? 'http://localhost:3001/api/auth/login'
      : 'http://localhost:3001/api/auth/signup';
    const data = isLogin
      ? { email, password }
      : {
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
        };

    console.log('Sending request to:', url);
    console.log('Request data:', data);

    try {
      const response = await axios.post(url, data);
      console.log('Response:', response.data);
      setMessage(response.data.message);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      navigate('/');
    } catch (error) {
      console.error('Error:', error);
      if (error.response) {
        setMessage(error.response.data.message || error.response.data || 'Server error');
      } else if (error.request) {
        setMessage('Cannot connect to the backend server. Please ensure the server is running on port 3001.');
      } else {
        setMessage('An unexpected error occurred: ' + error.message);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Height (cm)"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Weight (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                required
              >
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              <input
                type="text"
                placeholder="Allergies (e.g., Peanuts, Penicillin)"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
              <input
                type="text"
                placeholder="Chronic Conditions (e.g., Diabetes, Asthma)"
                value={chronicConditions}
                onChange={(e) => setChronicConditions(e.target.value)}
              />
              <textarea
                placeholder="Medical History (e.g., Past surgeries, major illnesses)"
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                style={{ width: '100%', height: '100px', margin: '0.5rem 0' }}
              />
              <input
                type="tel"
                placeholder="Emergency Contact Number"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                required
              />
            </>
          )}
          <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
          <p onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
          </p>
        </form>
        {message && (
          <p className={message.includes('successful') ? 'success' : 'error'}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;