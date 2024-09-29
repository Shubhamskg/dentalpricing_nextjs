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

    const newAppointment = {
      name: appointmentData.name,
      email: appointmentData.email,
      phone: appointmentData.phone,
      preferredDate: appointmentData.date1,
      preferredTimeSlot: appointmentData.timeSlot1,
      alternativeDate: appointmentData.date2,
      alternativeTimeSlot: appointmentData.timeSlot2,
      issue: appointmentData.issue,
      clinic: appointmentData.clinic,
      treatment: appointmentData.treatment,
      price: appointmentData.price,
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