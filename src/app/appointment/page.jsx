'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, parse, isAfter } from 'date-fns';
import { enGB } from 'date-fns/locale';
import styles from './page.module.scss';
import Loading from '../components/Loading';
import AppointmentDetails from '../AppointmentDetails/page';

const TIME_SLOTS = {
  '9-11': '9:00 AM - 11:00 AM',
  '11-13': '11:00 AM - 1:00 PM',
  '13-15': '1:00 PM - 3:00 PM',
  '15-17': '3:00 PM - 5:00 PM',
};



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