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

export async function POST(request) {
  const { paymentMethodId, bookingId, amount } = await request.json();

  try {
    const client = await connectToDatabase();
    const db = client.db('dentalpricing');
    const appointmentsCollection = db.collection('appointments');

    let booking;
    try {
      booking = await appointmentsCollection.findOne({ _id: new ObjectId(bookingId) });
    } catch (error) {
      console.error("Error converting ID to ObjectId:", error);
      return NextResponse.json({ error: 'Invalid booking ID format' }, { status: 400 });
    }

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'gbp',
      payment_method: paymentMethodId,
      confirm: true,
    });

    await appointmentsCollection.updateOne(
      { _id: new ObjectId(bookingId) },
      { 
        $set: { 
          paymentStatus: 'paid',
          paymentIntentId: paymentIntent.id,
          depositAmount: amount,
        }
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}