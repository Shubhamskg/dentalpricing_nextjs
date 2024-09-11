'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, parse, isAfter } from 'date-fns';
import { enGB } from 'date-fns/locale';
import styles from './page.module.scss';
import Loading from '../components/Loading';

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
    return <Loading />;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!appointmentDetails) {
    return <div className={styles.error}>No appointment details found.</div>;
  }

  const formatDateAndTime = (date, timeSlot) => {
    const formattedDate = format(new Date(date), 'EEEE, d MMMM yyyy', { locale: enGB });
    return `${formattedDate}, ${TIME_SLOTS[timeSlot]}`;
  };

  const preferredDateTime = formatDateAndTime(appointmentDetails.date1, appointmentDetails.timeSlot1);
  const alternativeDateTime = formatDateAndTime(appointmentDetails.date2, appointmentDetails.timeSlot2);

  const isAlternativeLater = isAfter(
    parse(`${appointmentDetails.date2} ${appointmentDetails.timeSlot2.split('-')[0]}`, 'yyyy-MM-dd HH', new Date()),
    parse(`${appointmentDetails.date1} ${appointmentDetails.timeSlot1.split('-')[0]}`, 'yyyy-MM-dd HH', new Date())
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {appointmentDetails.paymentStatus === 'succeeded' ? 'Appointment Confirmed' : 'Appointment Status'}
      </h1>
      <div className={styles.details}>
        <p>Your appointment details:</p>
        <p className={styles.datetime}>Preferred: {preferredDateTime}</p>
        <p className={styles.datetime}>Alternative: {alternativeDateTime}</p>
        {!isAlternativeLater && (
          <p className={styles.warning}>
            Note: The alternative date/time is not after the preferred date/time. This may affect scheduling.
          </p>
        )}
        <p>Clinic: {appointmentDetails.clinic}</p>
        <p>Treatment: {appointmentDetails.treatment}</p>
        <p>Deposit amount: £{appointmentDetails.depositAmount}</p>
        <p>Payment status: {appointmentDetails.paymentStatus}</p>
        <p>Booking ID: {appointmentDetails._id}</p>
      </div>
      <p className={styles.reminder}>
        {appointmentDetails.paymentStatus === 'succeeded'
          ? 'Please arrive 10 minutes before your appointment time.'
          : 'If you have any questions about your appointment or payment, please contact our support team.'}
      </p>
    </div>
  );
}

export default function AppointmentPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AppointmentContent />
    </Suspense>
  );
}

function AppointmentContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  if (!bookingId) {
    return <div className={styles.error}>No booking ID provided.</div>;
  }

  return <AppointmentDetails bookingId={bookingId} />;
}