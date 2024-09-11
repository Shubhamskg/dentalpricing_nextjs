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
  const { bookingId, amount } = await request.json();
  console.log("amount",amount)

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

    // Ensure the amount is at least £0.30 (30 pence) to meet Stripe's minimum requirement
    const stripeAmount = Math.max(Math.round(amount), 1);
    console.log("stripeAmount",stripeAmount)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount*100,
      currency: 'gbp',
      automatic_payment_methods: {
        enabled: true,
      },
    });
    console.log("paymentIntent",paymentIntent)
    await appointmentsCollection.updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $set: {
          paymentIntentId: paymentIntent.id,
          depositAmount: stripeAmount , // Convert back to pounds for storage
        }
      }
    );

    return NextResponse.json({ clientSecret: paymentIntent.client_secret ,depositAmount:stripeAmount});
  } catch (error) {
    console.error("Payment intent creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}