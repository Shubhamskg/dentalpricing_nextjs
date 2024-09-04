import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
let client;

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client;
}

export async function POST(request) {
  const { bookingId, paymentStatus, paymentIntentId } = await request.json();

  if (!bookingId || !paymentStatus) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('dentalpricing');
    const appointmentsCollection = db.collection('appointments');

    const result = await appointmentsCollection.updateOne(
      { _id: new ObjectId(bookingId) },
      { 
        $set: { 
          paymentStatus: paymentStatus,
          paymentIntentId: paymentIntentId,
          updatedAt: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Booking not found or not updated' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Payment status updated successfully' });
  } catch (error) {
    console.error("Error updating payment status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}