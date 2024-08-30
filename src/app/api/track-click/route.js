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
  const { url, userEmail } = await request.json();
  
  try {
    const client = await connectToDatabase();
    const db = client.db('dentalpricing');
    const clickEventCollection = db.collection('clickEvents');

    const result = await clickEventCollection.updateOne(
      { url: url },
      {
        $inc: { clickCount: 1 },
        $addToSet: { users: userEmail }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Click tracking error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}