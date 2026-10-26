import React from 'react';
import './About.css';

function About() {
  return (
    <section className="about">
      <div className="about-content">
        <h1 className="about-title">The Future Of Healthcare Is Now.</h1>
        <p className="about-subtitle">Revolutionizing care with innovation and expertise.</p>
        <div className="about-text">
          <p>At Doc On Go, we’re transforming healthcare accessibility for international students and patients worldwide. Founded in [Year or Placeholder], our mission is to deliver fast, reliable, and affordable medical solutions through AI technology and global partnerships.</p>
          <p>Our vision is to bridge the gap between patients and quality healthcare, ensuring you get the care you need at your doorstep or abroad. Our team includes healthcare experts, AI specialists, and travel coordinators dedicated to your well-being.</p>
        </div>
        <img src="/team.png" alt="Our Dedicated Team" className="about-image" />
      </div>
    </section>
  );
}

export default About;