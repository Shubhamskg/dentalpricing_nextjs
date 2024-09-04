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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('dentalpricing');
    const appointmentsCollection = db.collection('appointments');

    let booking;
    try {
      booking = await appointmentsCollection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      console.error("Error converting ID to ObjectId:", error);
      return NextResponse.json({ error: 'Invalid booking ID format' }, { status: 400 });
    }

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Convert _id to string for consistent handling in frontend
    booking._id = booking._id.toString();

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}