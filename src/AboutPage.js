// AboutPage.js
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './AboutPage.css';

function AboutPage() {
  const videoRef = useRef(null);

  // Fade-in effect for video section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const videoSection = videoRef.current;
      if (videoSection) {
        const rect = videoSection.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        if (rect.top <= windowHeight * 0.8) {
          videoSection.classList.add('visible');
          console.log('Video section is visible');
        } else {
          videoSection.classList.remove('visible');
          console.log('Video section is not visible');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="about-page">
      {/* Mission Section */}
      <div className="mission-section">
        <div className="mission-content">
          <h1>Our Mission</h1>
          <p>
            Our mission at Doc On Go is to empower individuals with accessible, AI-driven health insights, making healthcare simpler and more inclusive for everyone.
          </p>
          <Link to="/about" className="learn-more-btn">Learn More</Link>
        </div>
        <div className="mission-image">
          <img src={require('./images/Mission.jpeg')} alt="Mission" onError={(e) => console.log('Mission image load error:', e)} />
        </div>
      </div>

      {/* Serve Community Section */}
      <div className="serve-section">
        <h2>Serving Our Community</h2>
        <p className="serve-subtitle">
          Leveraging technology to improve healthcare accessibility and outcomes.
        </p>
        <div className="serve-grid">
          <div className="serve-card">
            <img src={require('./images/Symptom Insights.jpeg')} alt="Symptom Insights" onError={(e) => console.log('Symptom Insights image load error:', e)} />
            <h3>AI-Driven Symptom Insights</h3>
            <p>Providing instant preliminary insights to help users understand their symptoms.</p>
            <Link to="/about" className="learn-more">Learn More</Link>
          </div>
          <div className="serve-card">
            <img src={require('./images/Document Analysis.jpeg')} alt="Document Analysis" onError={(e) => console.log('Document Analysis image load error:', e)} />
            <h3>Document Analysis for All</h3>
            <p>Offering AI-assisted evaluations of medical reports to support informed decisions.</p>
            <Link to="/about" className="learn-more">Learn More</Link>
          </div>
          <div className="serve-card">
            <img src={require('./images/hospital.jpeg')} alt="Connecting to Care" onError={(e) => console.log('Connecting to Care image load error:', e)} />
            <h3>Connecting to Care</h3>
            <p>Simplifying appointment booking to ensure access to healthcare professionals.</p>
            <Link to="/about" className="learn-more">Learn More</Link>
          </div>
        </div>
      </div>

      {/* Video with Quote Section */}
      <div className="video-container" ref={videoRef}>
        <div className="video-section">
          {/* Uncomment if healthcare-bg.mp4 is added to src/videos/ */}
          <video autoPlay loop muted playsInline className="background-video">
            <source src={require('./videos/healthcare-bg.mp4')} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-overlay">
            <blockquote className="quote">
              "Healthcare should be a right, not a privilege. At Doc On Go, we’re making that a reality with technology that cares."
            </blockquote>
          </div>
        </div>
      </div>

      {/* Join Us Section */}
      <div className="join-section">
        <h2>Join Us in Changing the World</h2>
        <Link to="/login" className="join-btn">Join Now</Link>
      </div>
    </section>
  );
}

export default AboutPage;