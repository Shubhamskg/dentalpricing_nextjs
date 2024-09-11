'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import styles from './page.module.scss';
import Loading from '../components/Loading';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function PaymentForm({ clientSecret, bookingId }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('initial');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (result.error) {
      setError(result.error.message);
      setPaymentStatus('failed');
      setProcessing(false);
    } else {
      // Payment successful, update database
      await updatePaymentStatus(bookingId, 'succeeded', result.paymentIntent.id);
      setPaymentStatus('succeeded');
    }
  };

  const updatePaymentStatus = async (bookingId, status, paymentIntentId) => {
    try {
      const response = await fetch('/api/update-payment-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          paymentStatus: status,
          paymentIntentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      // Redirect to appointment page
      router.push(`/appointment?bookingId=${bookingId}`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      setError('An error occurred while processing your payment. Please try again.');
      setPaymentStatus('failed');
    }
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.paymentForm}>
      <PaymentElement />
      {error && <div className={styles.error}>{error}</div>}
      {paymentStatus === 'initial' && (
        <button type="submit" disabled={!stripe || processing} className={styles.payButton}>
          {processing ? 'Processing...' : 'Pay Deposit'}
        </button>
      )}
      {paymentStatus === 'succeeded' && <div className={styles.success}>Payment successful! Redirecting...</div>}
      {paymentStatus === 'failed' && <div className={styles.error}>Payment failed. Please try again.</div>}
    </form>
  );
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      const bookingId = searchParams.get('bookingId');
      if (bookingId) {
        const response = await fetch(`/api/booking?id=${bookingId}`);
        const data = await response.json();
        setBookingDetails(data);

        // Create a PaymentIntent
        const paymentResponse = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId: bookingId,
            amount: Math.round(data.price * 0.1 * 100) / 100, // 10% deposit
          }),
        });
        const { clientSecret } = await paymentResponse.json();
        setClientSecret(clientSecret);
      }
    };
    fetchBookingDetails();
  }, [searchParams]);

  if (!bookingDetails || !clientSecret) {
    return <Loading/>;
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Payment</h1>
      <p>Deposit amount: £{(bookingDetails.price * 0.1).toFixed(2)}</p>
      <Elements stripe={stripePromise} options={options}>
        <PaymentForm clientSecret={clientSecret} bookingId={searchParams.get('bookingId')} />
      </Elements>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<Loading/>}>
      <PaymentContent />
    </Suspense>
  );
}
// conform