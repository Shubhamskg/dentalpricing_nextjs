"use client"
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import styles from './page.module.scss';
import Loading from '../components/Loading';
import { CreditCard, Check, AlertCircle } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function PaymentForm({ clientSecret, bookingId, depositAmount }) {
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
      <div className={styles.paymentElementWrapper}>
        <PaymentElement />
      </div>
      {error && (
        <div className={styles.message + ' ' + styles.error}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
      {paymentStatus === 'initial' && (
        <button type="submit" disabled={!stripe || processing} className={styles.payButton}>
          {processing ? (
            <>
              <span className={styles.spinner}></span>
              Processing...
            </>
          ) : (
            <>
              <CreditCard size={20} />
              Confirm Payment
            </>
          )}
        </button>
      )}
      {paymentStatus === 'succeeded' && (
        <div className={styles.message + ' ' + styles.success}>
          <Check size={20} />
          <span>Payment successful! Redirecting...</span>
        </div>
      )}
      {paymentStatus === 'failed' && (
        <div className={styles.message + ' ' + styles.error}>
          <AlertCircle size={20} />
          <span>Payment failed. Please try again.</span>
        </div>
      )}
    </form>
  );
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [depositAmount, setDepositAmount] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      const bookingId = searchParams.get('bookingId');
      if (!bookingId) {
        setError('No booking ID provided');
        return;
      }

      try {
        const response = await fetch(`/api/booking?id=${bookingId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch booking details');
        }
        const data = await response.json();
        setBookingDetails(data);
        
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
        if (!paymentResponse.ok) {
          const paymentErrorData = await paymentResponse.json();
          throw new Error(paymentErrorData.error || 'Failed to create payment intent');
        }
        const pay = await paymentResponse.json();
        const { clientSecret, depositAmount } = pay;
        setClientSecret(clientSecret);
        setDepositAmount(depositAmount);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      }
    };
    fetchBookingDetails();
  }, [searchParams]);

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.message + ' ' + styles.error}>
          <AlertCircle size={20} />
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  if (!bookingDetails || !clientSecret || depositAmount === null) {
    return <Loading />;
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Confirm Your Appointment</h1>
      <p className={styles.text}>
        To secure your appointment, we require a 10% deposit. This amount will be deducted from your final payment.
      </p>
      <div className={styles.amountWrapper}>
        <span className={styles.amountLabel}>Deposit Amount:</span>
        <span className={styles.amount}>£{depositAmount ? depositAmount.toFixed(2) : '0.00'}</span>
      </div>
      <Elements stripe={stripePromise} options={options}>
        <PaymentForm clientSecret={clientSecret} bookingId={searchParams.get('bookingId')} depositAmount={depositAmount} />
      </Elements>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PaymentContent />
    </Suspense>
  );
}