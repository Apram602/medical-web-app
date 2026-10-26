import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    gender: '',
    age: '',
    height: '',
    weight: '',
    bloodType: '',
    allergies: '',
    chronicConditions: '',
    medicalHistory: '',
    emergencyContact: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        setError('Please log in to view your profile.');
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3001/api/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
        setFormData({
          fullName: response.data.fullName,
          email: response.data.email,
          gender: response.data.gender,
          age: response.data.age,
          height: response.data.height,
          weight: response.data.weight,
          bloodType: response.data.bloodType,
          allergies: response.data.allergies || '',
          chronicConditions: response.data.chronicConditions || '',
          medicalHistory: response.data.medicalHistory || '',
          emergencyContact: response.data.emergencyContact,
        });

        // Fetch user documents
        const docsResponse = await axios.get(`http://localhost:3001/api/user-documents/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDocuments(docsResponse.data);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to fetch user data.');
      }
    };

    fetchUser();
  }, [navigate]);

  // Function to generate a unique background color based on the user's name
  const generateBackgroundColor = (name) => {
    if (!name) return '#4A90E2'; // Default color if name is empty

    // Simple hash function to generate a number from the name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert the hash to a color (HSL format for better variety)
    const hue = hash % 360; // Hue between 0 and 360
    return `hsl(${hue}, 70%, 50%)`; // Saturation 70%, Lightness 50%
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:3001/api/update-profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update the user state with the new data
      setUser({ ...user, ...formData });
      setIsEditing(false);
      setError('');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <div className="profile-container">
      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <h1>Patient profile</h1>
          <div className="header-actions">
            <button className="print-btn">PRINT</button>
            <button
              className="edit-btn"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'EDIT'}
            </button>
            <div className="user-menu">
              <button onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>

        {error && <p className="error">{error}</p>}
        {user ? (
          <div className="profile-content">
            {/* Profile Header */}
            <div className="profile-header">
              <div
                className="profile-initial"
                style={{ backgroundColor: generateBackgroundColor(user.fullName) }}
              >
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="profile-info">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      style={{ marginBottom: '10px', width: '100%' }}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      style={{ marginBottom: '10px', width: '100%' }}
                    />
                    <input
                      type="text"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      style={{ marginBottom: '10px', width: '100%' }}
                    />
                    <button
                      onClick={handleSave}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#4A90E2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <h2>{user.fullName}</h2>
                    <p>{user.email}</p>
                    <p>{user.emergencyContact}</p>
                  </>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
              <span className="tab active">General information</span>
            </div>

            {/* General Information */}
            <div className="section">
              <h3>General information</h3>
              {isEditing ? (
                <div className="info-grid">
                  <div>
                    <p>
                      <strong>Date of birth:</strong>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        style={{ marginLeft: '10px' }}
                      />
                    </p>
                    <p>
                      <strong>Gender:</strong>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        style={{ marginLeft: '10px' }}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </p>
                    <p>
                      <strong>Height:</strong>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        style={{ marginLeft: '10px' }}
                      /> cm
                    </p>
                    <p>
                      <strong>Weight:</strong>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        style={{ marginLeft: '10px' }}
                      /> kg
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Blood Type:</strong>
                      <select
                        name="bloodType"
                        value={formData.bloodType}
                        onChange={handleInputChange}
                        style={{ marginLeft: '10px' }}
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </p>
                    <p>
                      <strong>Emergency Contact:</strong>
                      <input
                        type="tel"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        style={{ marginLeft: '10px' }}
                      />
                    </p>
                  </div>
                </div>
              ) : (
                <div className="info-grid">
                  <div>
                    <p><strong>Date of birth:</strong> {user.age} years old</p>
                    <p><strong>Gender:</strong> {user.gender}</p>
                    <p><strong>Height:</strong> {user.height} cm</p>
                    <p><strong>Weight:</strong> {user.weight} kg</p>
                  </div>
                  <div>
                    <p><strong>Blood Type:</strong> {user.bloodType}</p>
                    <p><strong>Emergency Contact:</strong> {user.emergencyContact}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Anamnesis */}
            <div className="section">
              <h3>Anamnesis</h3>
              {isEditing ? (
                <div className="info-grid">
                  <div>
                    <p>
                      <strong>Allergies:</strong>
                      <input
                        type="text"
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleInputChange}
                        style={{ marginLeft: '10px', width: '100%' }}
                      />
                    </p>
                    <p>
                      <strong>Chronic Diseases:</strong>
                      <input
                        type="text"
                        name="chronicConditions"
                        value={formData.chronicConditions}
                        onChange={handleInputChange}
                        style={{ marginLeft: '10px', width: '100%' }}
                      />
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Medical History:</strong>
                      <textarea
                        name="medicalHistory"
                        value={formData.medicalHistory}
                        onChange={handleInputChange}
                        style={{ marginLeft: '10px', width: '100%', height: '100px' }}
                      />
                    </p>
                  </div>
                </div>
              ) : (
                <div className="info-grid">
                  <div>
                    <p><strong>Allergies:</strong> {user.allergies || 'None'}</p>
                    <p><strong>Chronic Diseases:</strong> {user.chronicConditions || 'None'}</p>
                  </div>
                  <div>
                    <p><strong>Medical History:</strong> {user.medicalHistory || 'None'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Files */}
            <div className="section files-notes">
              <div className="files">
                <h3>Files</h3>
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <div key={doc.id} className="file-item">
                      <span>{doc.file_name}</span>
                      <a
                        href={`http://localhost:3001/${doc.file_path}`}
                        download={doc.file_name}
                        className="download-btn"
                      >
                        DOWNLOAD
                      </a>
                    </div>
                  ))
                ) : (
                  <p>No documents uploaded yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p>Loading profile...</p>
        )}
      </div>
    </div>
  );
}

export default Profile;