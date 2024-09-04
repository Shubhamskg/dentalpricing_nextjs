import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

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

    const result = await appointmentsCollection.insertOne({
      ...appointmentData,
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, appointmentId: result.insertedId });
  } catch (error) {
    console.error("Appointment booking error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}