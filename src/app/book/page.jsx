"use client"
import React, { useState, useEffect } from 'react';
import styles from './page.module.scss';

export default function BookAppointment() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    issue: '',
  });
  const [bookingDetails, setBookingDetails] = useState({
    clinic: '',
    treatment: '',
    price: '',
    postcode:'',
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setBookingDetails({
      clinic: urlParams.get('clinic') || '',
      treatment: urlParams.get('treatment') || '',
      price: urlParams.get('price') || '',
      postcode: urlParams.get('postcode') || '',
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ...bookingDetails,
        }),
      });

      if (response.ok) {
        alert('Appointment booked successfully!');
        window.location.href = '/price';
      } else {
        throw new Error('Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Book Appointment</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="clinic">Clinic:</label>
          <input type="text" id="clinic" value={bookingDetails.clinic} readOnly />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="treatment">Treatment:</label>
          <input type="text" id="treatment" value={bookingDetails.treatment} readOnly />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="price">Price:</label>
          <input type="text" id="price" value={`£${bookingDetails.price}`} readOnly />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="postcode">Postal Code:</label>
          <input type="text" id="postcode" value={`${bookingDetails.postcode}`} readOnly />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone:</label>
          <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="date">Date:</label>
          <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="time">Time:</label>
          <input type="time" id="time" name="time" value={formData.time} onChange={handleInputChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="issue">Issue/Notes:</label>
          <textarea id="issue" name="issue" value={formData.issue} onChange={handleInputChange}></textarea>
        </div>
        <button type="submit" className={styles.submitButton}>Confirm Appointment</button>
      </form>
    </div>
  );
}