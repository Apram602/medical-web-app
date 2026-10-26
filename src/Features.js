import React from 'react';
import './Features.css';
import videoConsultationImage from './a.jpg';
import findDoctorsImage from './b.jpg';
import medicineImage from './c.jpg';

function Features() {
  return (
    <section className="features">
      <div>
        <img src={videoConsultationImage} alt="Instant Video Consultation" />
        <h3>Instant Video Consultation</h3>
        <p>Connect with doctors in seconds.</p>
      </div>
      <div>
        <img src={findDoctorsImage} alt="Find The Doctors" />
        <h3>Find The Doctors</h3>
        <p>Comprehensive doctor directory.</p>
      </div>
      <div>
        <img src={medicineImage} alt="24/7 Medicine" />
        <h3>24/7 Medicine</h3>
        <p>Essentials delivered to your door.</p>
      </div>
      
    </section>
  );
}

export default Features;