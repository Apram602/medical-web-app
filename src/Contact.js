import React from 'react';
import './Contact.css';

function Contact() {
  return (
    <section className="contact">
      <div className="contact-content">
        <h2>Get in Touch</h2>
        <p>Have questions? Need assistance with symptoms, reports, or travel? Contact us today!</p>
        <p>Email: info@docongo.com | Phone: +1-800-123-4567 | Address: 123 Healthcare Lane, Toronto, ON, Canada</p>
        <div className="social-media">Follow us on <a href="#">Twitter</a>, <a href="#">Facebook</a>, <a href="#">Instagram</a></div>
        <form className="contact-form">
          <input type="text" placeholder="Your Name" />
          <input type="email" placeholder="Your Email" />
          <input type="text" placeholder="Subject" />
          <textarea placeholder="Your Message"></textarea>
          <button type="submit">Send Message</button>
        </form>
      </div>
    </section>
  );
}

export default Contact;