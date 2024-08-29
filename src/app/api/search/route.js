import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function POST(request) {
  const { searchTerm, category, location } = await request.json();

  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db('dentalpricing');
  const collection = db.collection('pricedata');

  const query = {};

  // First, filter by category if provided
  if (category) {
    query.Category = { $regex: category, $options: 'i' };
  }

  // Then, apply the searchTerm to all fields
  if (searchTerm) {
    query.$and = [
      {
        $or: [
          { Name: { $regex: searchTerm, $options: 'i' } },
          { treatment: { $regex: searchTerm, $options: 'i' } },
          { Category: { $regex: searchTerm, $options: 'i' } },
          { Address_1: { $regex: searchTerm, $options: 'i' } },
          { Postcode: { $regex: searchTerm, $options: 'i' } },
          { Price: { $regex: searchTerm, $options: 'i' } },
          { Website: { $regex: searchTerm, $options: 'i' } },
          { Feepage: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    ];
  }

  // Finally, apply the location filter
  if (location) {
    const locationQuery = {
      $or: [
        { Address_1: { $regex: location, $options: 'i' } },
        { Postcode: { $regex: location, $options: 'i' } }
      ]
    };
    
    if (query.$and) {
      query.$and.push(locationQuery);
    } else {
      query.$and = [locationQuery];
    }
  }

  const results = await collection.find(query).toArray();

  await client.close();

  return NextResponse.json(results);
}