import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './Header';
import AboutPage from './AboutPage';
import ContactPage from './ContactPage';
import Footer from './Footer';
import Login from './Login';
import Profile from './Profile';
import BookAppointment from './BookAppointment';
import Home from './Home';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;