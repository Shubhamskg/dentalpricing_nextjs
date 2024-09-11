"use client"
import React, { useState } from 'react';
import styles from './page.module.scss';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form after submission
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className={styles.contactPage}>
      <h1>Contact Us</h1>
      <p>We're here to help with any questions about dental pricing in the UK.</p>

      <div className={styles.contactContent}>
        <div className={styles.contactInfo}>
          <h2>Get in Touch</h2>
          <ul>
            <li><FaEnvelope /> Email: info@dentalpricing.co.uk</li>
            <li><FaPhone /> Phone: +44 20 1234 5678</li>
            <li><FaMapMarkerAlt /> Address: 123 Dental Street, London, UK</li>
          </ul>
          <p>Office Hours: Monday to Friday, 9:00 AM - 5:00 PM</p>
        </div>

        <form className={styles.contactForm} onSubmit={handleSubmit}>
          <h2>Send Us a Message</h2>
          <div className={styles.formGroup}>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <button type="submit" className={styles.submitButton}>Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;