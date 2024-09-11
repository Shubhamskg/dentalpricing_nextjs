'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, addWeeks, isWeekend, setHours, setMinutes, isAfter, isBefore } from 'date-fns';
import { enGB } from 'date-fns/locale';
import styles from './page.module.scss';

function BookingForm({ clinic, treatment, price }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    issue: '',
  });

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
          clinic,
          treatment,
          price,
        }),
      });

      if (response.ok) {
        const { bookingId } = await response.json();
        router.push(`/payment?bookingId=${bookingId}`);
      } else {
        throw new Error('Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  const minDate = addWeeks(new Date(), 2.5);
  const maxDate = addWeeks(new Date(), 8); // Allowing bookings up to 8 weeks in advance

  const isDateDisabled = (date) => {
    return isWeekend(date) || isBefore(date, minDate) || isAfter(date, maxDate);
  };

  const isTimeDisabled = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const date = setMinutes(setHours(new Date(), hours), minutes);
    return isBefore(date, setHours(new Date(), 9)) || isAfter(date, setHours(new Date(), 17));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Book Appointment</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="clinic">Clinic:</label>
          <input type="text" id="clinic" value={clinic} readOnly />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="treatment">Treatment:</label>
          <input type="text" id="treatment" value={treatment} readOnly />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="price">Price:</label>
          <input type="text" id="price" value={`£${price}`} readOnly />
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
          <input 
            type="date" 
            id="date" 
            name="date" 
            value={formData.date} 
            onChange={handleInputChange} 
            min={format(minDate, 'yyyy-MM-dd')}
            max={format(maxDate, 'yyyy-MM-dd')}
            onKeyDown={(e) => e.preventDefault()}
            required 
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="time">Time:</label>
          <input 
            type="time" 
            id="time" 
            name="time" 
            value={formData.time} 
            onChange={handleInputChange} 
            min="09:00" 
            max="17:00" 
            step="1800"
            required 
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="issue">Issue/Notes:</label>
          <textarea id="issue" name="issue" value={formData.issue} onChange={handleInputChange}></textarea>
        </div>
        <button type="submit" className={styles.submitButton}>Proceed to Payment</button>
      </form>
    </div>
  );
}

function BookingContent() {
  const searchParams = useSearchParams();
  const [bookingDetails, setBookingDetails] = useState({
    clinic: '',
    treatment: '',
    price: '',
  });

  useEffect(() => {
    setBookingDetails({
      clinic: searchParams.get('clinic') || '',
      treatment: searchParams.get('treatment') || '',
      price: searchParams.get('price') || '',
    });
  }, [searchParams]);

  return <BookingForm {...bookingDetails} />;
}

export default function BookingPage() {
  return (
    <Suspense fallback={<Loading/>}>
      <BookingContent />
    </Suspense>
  );
}