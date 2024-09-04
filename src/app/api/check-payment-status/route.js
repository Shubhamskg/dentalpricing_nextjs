import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import Stripe from 'stripe';

const MONGODB_URI = process.env.MONGODB_URI;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

const stripe = new Stripe(STRIPE_SECRET_KEY);
let client;

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get('bookingId');

  if (!bookingId) {
    return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('dentalpricing');
    const appointmentsCollection = db.collection('appointments');

    const booking = await appointmentsCollection.findOne({ _id: new ObjectId(bookingId) });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (!booking.paymentIntentId) {
      return NextResponse.json({ paymentStatus: 'failed', paymentError: 'No payment intent found' });
    }

    // Always check with Stripe for the most up-to-date status
    const paymentIntent = await stripe.paymentIntents.retrieve(booking.paymentIntentId);

    let updatedPaymentStatus;
    let paymentError = null;

    if (paymentIntent.status === 'succeeded') {
      updatedPaymentStatus = 'succeeded';
    } else if (paymentIntent.status === 'requires_payment_method' || paymentIntent.status === 'canceled') {
      updatedPaymentStatus = 'failed';
      paymentError = paymentIntent.last_payment_error?.message || 'Payment failed';
    } else {
      updatedPaymentStatus = 'pending';
    }

    // Update the database with the latest status from Stripe
    await appointmentsCollection.updateOne(
      { _id: new ObjectId(bookingId) },
      { $set: { paymentStatus: updatedPaymentStatus } }
    );

    // Fetch the updated booking details
    const updatedBooking = await appointmentsCollection.findOne({ _id: new ObjectId(bookingId) });

    if (updatedPaymentStatus === 'succeeded') {
      return NextResponse.json({ paymentStatus: 'succeeded', appointmentDetails: updatedBooking });
    } else if (updatedPaymentStatus === 'failed') {
      return NextResponse.json({ paymentStatus: 'failed', paymentError });
    } else {
      return NextResponse.json({ paymentStatus: 'pending' });
    }

  } catch (error) {
    console.error("Error checking payment status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}