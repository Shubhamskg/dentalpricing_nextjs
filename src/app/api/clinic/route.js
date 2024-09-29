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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const clinicName = searchParams.get('name');
  const currentCategory = searchParams.get('category');
  const currentTreatment = searchParams.get('treatment');

  if (!clinicName) {
    return NextResponse.json({ error: 'Clinic name is required' }, { status: 400 });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('dentalpricing');

    // Fetch basic clinic info
    const clinicInfo = await db.collection('treatmentPriceData').findOne({ Name: clinicName });

    if (!clinicInfo) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // Fetch all treatments for the clinic
    const allTreatments = await db.collection('treatmentPriceData')
      .find({ Name: clinicName })
      .toArray();

    // Separate current category treatments and other treatments
    const currentCategoryTreatments = allTreatments.filter(t => t.Category === currentCategory);
    const otherTreatments = allTreatments.filter(t => t.Category !== currentCategory);

    // Fetch Google rating information (assuming it's stored in a separate collection)
    const googleRatingInfo = await db.collection('googleRatings').findOne({ clinicName: clinicName });

    // Construct the response object
    const formattedClinicData = {
      Name: clinicInfo.Name,
      Address: clinicInfo['Address 1'],
      Postcode: clinicInfo.Postcode,
      Website: clinicInfo.Website,
      Feepage: clinicInfo.Feepage,
      googleRating: googleRatingInfo ? googleRatingInfo.rating : null,
      totalReviews: googleRatingInfo ? googleRatingInfo.totalReviews : 0,
      currentCategory: {
        name: currentCategory,
        treatments: currentCategoryTreatments.map(t => ({
          name: t.treatment,
          price: t.Price,
          category: t.Category
        }))
      },
      otherTreatments: otherTreatments.map(t => ({
        name: t.treatment,
        price: t.Price,
        category: t.Category
      })),
      totalTreatments: allTreatments.length
    };

    return NextResponse.json(formattedClinicData);
  } catch (error) {
    console.error('Error fetching clinic data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}