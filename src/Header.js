import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import './Header.css';
import logo from './DOC ON GO.png';

function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3001/api/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    if (isLoggedIn) {
      fetchUser();
    }
  }, [isLoggedIn]);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/login';
  };

  return (
    <header>
      <div className="logo-container">
        <img src={logo} alt="Doc On Go Logo" className="logo" />
        <h1>Doc On Go</h1>
      </div>
      <nav>
        <NavLink to="/" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>Home</NavLink>
        <NavLink to="/about" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>About</NavLink>
        <NavLink to="/contact" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>Contact</NavLink>
        {isLoggedIn ? (
          <div className="profile-dropdown">
            <div
              className="profile-icon"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span
                className="circle"
                style={{ backgroundColor: user ? generateBackgroundColor(user.fullName) : '#4A90E2' }}
              >
                {user ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </span>
              <span className="dropdown-arrow">▼</span>
              <span className="profile-text">Your profile</span>
            </div>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <NavLink to="/profile" onClick={() => setIsDropdownOpen(false)}>View Profile</NavLink>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <NavLink to="/login" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>Login</NavLink>
        )}
      </nav>   
    </header>
  );
}

export default Header;