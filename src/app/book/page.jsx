'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, addWeeks, isWeekend, isAfter, parse, addDays, differenceInCalendarDays } from 'date-fns';
import styles from './page.module.scss';
import Loading from '../components/Loading';
import { Calendar, Clock, User, Mail, Phone, FileText, MapPin, Stethoscope, PoundSterling } from 'lucide-react';

const TIME_SLOTS = [
  { value: '9-11', label: '9:00 AM - 11:00 AM' },
  { value: '11-13', label: '11:00 AM - 1:00 PM' },
  { value: '13-15', label: '1:00 PM - 3:00 PM' },
  { value: '15-17', label: '3:00 PM - 5:00 PM' },
];

function BookingForm({ clinic, treatment, price }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date1: '',
    timeSlot1: '',
    date2: '',
    timeSlot2: '',
    issue: '',
  });
  const [formError, setFormError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    setFormError('');
  };

  const validateDateTimeOrder = () => {
    if (formData.date1 && formData.timeSlot1 && formData.date2 && formData.timeSlot2) {
      const preferredDate = parse(formData.date1, 'yyyy-MM-dd', new Date());
      const alternativeDate = parse(formData.date2, 'yyyy-MM-dd', new Date());
      const preferredDateTime = parse(`${formData.date1} ${formData.timeSlot1.split('-')[0]}`, 'yyyy-MM-dd HH', new Date());
      const alternativeDateTime = parse(`${formData.date2} ${formData.timeSlot2.split('-')[0]}`, 'yyyy-MM-dd HH', new Date());
      
      const dayDifference = differenceInCalendarDays(alternativeDate, preferredDate);

      if (dayDifference < 1) {
        setFormError('There must be at least one day gap between your preferred and alternative dates.');
        return false;
      }
      
      if (!isAfter(alternativeDateTime, preferredDateTime)) {
        setFormError('The alternative date and time must be after the preferred date and time.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateDateTimeOrder()) {
      return;
    }

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
      setFormError('Failed to book appointment. Please try again.');
    }
  };

  const minDate = addWeeks(new Date(), 2.5);
  const maxDate = addWeeks(new Date(), 8);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Book Your Appointment</h1>
      <div className={styles.bookingDetails}>
        <div className={styles.detailItem}>
          <MapPin size={20} />
          <span>{clinic}</span>
        </div>
        <div className={styles.detailItem}>
          <Stethoscope size={20} />
          <span>{treatment}</span>
        </div>
        <div className={styles.detailItem}>
          <PoundSterling size={20} />
          <span>{price}</span>
        </div>
      </div>
      {formError && <div className={styles.errorMessage}>{formError}</div>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">
            <User size={20} />
            <span>Name</span>
          </label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">
            <Mail size={20} />
            <span>Email</span>
          </label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="phone">
            <Phone size={20} />
            <span>Phone</span>
          </label>
          <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
        </div>
        <div className={styles.dateTimeSection}>
          <h3>Please select two available dates and time slots</h3>
          <div className={styles.dateTimeOptions}>
            <div className={styles.dateTimeOption}>
              <div className={styles.formGroup}>
                <label htmlFor="date1">
                  <Calendar size={20} />
                  <span>Preferred Date</span>
                </label>
                <input 
                  type="date" 
                  id="date1" 
                  name="date1" 
                  value={formData.date1} 
                  onChange={handleInputChange} 
                  min={format(minDate, 'yyyy-MM-dd')}
                  max={format(maxDate, 'yyyy-MM-dd')}
                  onKeyDown={(e) => e.preventDefault()}
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="timeSlot1">
                  <Clock size={20} />
                  <span>Preferred Time Slot</span>
                </label>
                <select 
                  id="timeSlot1" 
                  name="timeSlot1" 
                  value={formData.timeSlot1} 
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a time slot</option>
                  {TIME_SLOTS.map(slot => (
                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.dateTimeOption}>
              <div className={styles.formGroup}>
                <label htmlFor="date2">
                  <Calendar size={20} />
                  <span>Alternative Date</span>
                </label>
                <input 
                  type="date" 
                  id="date2" 
                  name="date2" 
                  value={formData.date2} 
                  onChange={handleInputChange} 
                  min={formData.date1 ? format(addDays(parse(formData.date1, 'yyyy-MM-dd', new Date()), 1), 'yyyy-MM-dd') : format(minDate, 'yyyy-MM-dd')}
                  max={format(maxDate, 'yyyy-MM-dd')}
                  onKeyDown={(e) => e.preventDefault()}
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="timeSlot2">
                  <Clock size={20} />
                  <span>Alternative Time Slot</span>
                </label>
                <select 
                  id="timeSlot2" 
                  name="timeSlot2" 
                  value={formData.timeSlot2} 
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a time slot</option>
                  {TIME_SLOTS.map(slot => (
                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="issue">
            <FileText size={20} />
            <span>Issue/Notes</span>
          </label>
          <textarea id="issue" name="issue" value={formData.issue} onChange={handleInputChange}></textarea>
        </div>
        <button type="submit" className={styles.submitButton}>Proceed</button>
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