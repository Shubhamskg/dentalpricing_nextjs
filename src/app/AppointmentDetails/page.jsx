"use client"
import React, { useState, useEffect } from 'react';
import { format, parse, isAfter, isValid } from 'date-fns';
import { enGB } from 'date-fns/locale';
import styles from './page.module.scss'
import { Calendar, Clock, User, Mail, Phone, FileText, MapPin, Stethoscope, PoundSterling } from 'lucide-react';

const TIME_SLOTS = {
  '9-11': '9:00 AM - 11:00 AM',
  '11-13': '11:00 AM - 1:00 PM',
  '13-15': '1:00 PM - 3:00 PM',
  '15-17': '3:00 PM - 5:00 PM',
};

function AppointmentDetails({ bookingId }) {
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (bookingId) {
        try {
          const response = await fetch(`/api/booking?id=${bookingId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch appointment details');
          }
          const data = await response.json();
          console.log("appointment", data);
          setAppointmentDetails(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAppointmentDetails();
  }, [bookingId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!appointmentDetails) {
    return <div className={styles.error}>No appointment details found.</div>;
  }

  const formatDateAndTime = (date, timeSlot) => {
    if (!date || !timeSlot) {
      return 'Date and time not set';
    }
    
    const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
    
    if (!isValid(parsedDate)) {
      return 'Invalid date';
    }
    
    const formattedDate = format(parsedDate, 'yyyy-MM-dd', { locale: enGB });
    return `${formattedDate} ${timeSlot}`;
  };

  const preferredDateTime = appointmentDetails ? formatDateAndTime(appointmentDetails.preferredDate, appointmentDetails.preferredTimeSlot) : 'Loading...';
  const alternativeDateTime = appointmentDetails ? formatDateAndTime(appointmentDetails.alternativeDate, appointmentDetails.alternativeTimeSlot) : 'Loading...';

  const isAlternativeLater = appointmentDetails && isAfter(
    parse(`${appointmentDetails.alternativeDate || ''} ${(appointmentDetails.alternativeTimeSlot || '').split('-')[0]}`, 'yyyy-MM-dd HH', new Date()),
    parse(`${appointmentDetails.preferredDate || ''} ${(appointmentDetails.preferredTimeSlot || '').split('-')[0]}`, 'yyyy-MM-dd HH', new Date())
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {appointmentDetails.paymentStatus === 'succeeded' ? 'Appointment Confirmed' : 'Appointment Status'}
      </h1>
      <div className={styles.details}>
        <div className={styles.detailItem}>
          <User size={20} />
          <span>{appointmentDetails.name}</span>
        </div>
        <div className={styles.detailItem}>
          <Mail size={20} />
          <span>{appointmentDetails.email}</span>
        </div>
        <div className={styles.detailItem}>
          <Phone size={20} />
          <span>{appointmentDetails.phone}</span>
        </div>
        <div className={styles.detailItem}>
          <Calendar size={20} />
          <span>Preferred: {preferredDateTime}</span>
        </div>
        <div className={styles.detailItem}>
          <Clock size={20} />
          <span>Alternative: {alternativeDateTime}</span>
        </div>
        {!isAlternativeLater && (
          <p className={styles.warning}>
            Note: The alternative date/time is not after the preferred date/time. This may affect scheduling.
          </p>
        )}
        <div className={styles.detailItem}>
          <MapPin size={20} />
          <span>Clinic: {appointmentDetails.clinic}</span>
        </div>
        <div className={styles.detailItem}>
          <Stethoscope size={20} />
          <span>Treatment: {appointmentDetails.treatment}</span>
        </div>
        <div className={styles.detailItem}>
          <PoundSterling size={20} />
          <span>Deposit amount: £{appointmentDetails.depositAmount}</span>
        </div>
        <div className={styles.detailItem}>
          <FileText size={20} />
          <span>Payment status: {appointmentDetails.paymentStatus}</span>
        </div>
        <p>Booking ID: {appointmentDetails._id}</p>
      </div>
      <div className={styles.issueNotes}>
        <h3>Issue/Notes:</h3>
        <p>{appointmentDetails.issue || 'No additional notes provided.'}</p>
      </div>
      <p className={styles.reminder}>
        {appointmentDetails.paymentStatus === 'succeeded'
          ? 'Please arrive 10 minutes before your appointment time.'
          : 'If you have any questions about your appointment or payment, please contact our support team.'}
      </p>
    </div>
  );
}

export default AppointmentDetails;