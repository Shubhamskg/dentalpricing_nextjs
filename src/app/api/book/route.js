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
  const appointmentData = await request.json();

  try {
    const client = await connectToDatabase();
    const db = client.db('dentalpricing');
    const appointmentsCollection = db.collection('appointments');

    const newAppointment = {
      ...appointmentData,
      createdAt: new Date(),
      paymentStatus: 'pending',
      paymentIntentId: null,
      depositAmount: null,
    };

    const result = await appointmentsCollection.insertOne(newAppointment);

    return NextResponse.json({ success: true, bookingId: result.insertedId.toString() });
  } catch (error) {
    console.error("Appointment booking error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}