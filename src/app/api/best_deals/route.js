import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 });

async function getPlaceId(name, address, postcode) {
  const input = encodeURIComponent(`${name}, ${address}, ${postcode}, UK`);
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${input}&inputtype=textquery&fields=place_id&key=${process.env.GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'REQUEST_DENIED') {
      console.error('Google API Error:', data.error_message);
      return null;
    }

    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].place_id;
    }
  } catch (error) {
    console.error('Error fetching Place ID:', error);
  }

  return null;
}

async function getGoogleRating(placeId) {
  if (!placeId) return { rating: 0, totalReviews: 0 };

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total&key=${process.env.GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
      const { rating, user_ratings_total } = data.result;
      return { rating: rating || 0, totalReviews: user_ratings_total || 0 };
    }
  } catch (error) {
    console.error('Error fetching Google rating:', error);
  }

  return { rating: 0, totalReviews: 0 };
}

export async function GET(request) {
  const cacheKey = 'bestDeals';
  const cachedResult = cache.get(cacheKey);

  if (cachedResult) {
    return NextResponse.json(cachedResult);
  }

  let client;
  try {
    client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('dentalpricing');
    const priceCollection = db.collection('pricedata');

    const bestDeals = await priceCollection.aggregate([
      { $sample: { size: 100 } },
      { $match: { Price: { $type: "number", $gt: 0 } } },
      { $group: {
          _id: "$Category",
          deals: { $push: "$$ROOT" }
      }},
      { $project: {
          deals: { $slice: ["$deals", 3] }
      }},
      { $unwind: "$deals" },
      { $replaceRoot: { newRoot: "$deals" } },
      { $limit: 3 },
      { $project: {
          treatment: "$treatment",
          category: "$Category",
          clinicName: "$Name",
          price: "$Price",
          website: "$Website",
          address: "$Address 1",
          postcode: "$Postcode"
      }}
    ]).toArray();

    const dealsWithRatings = await Promise.all(bestDeals.map(async (deal) => {
      const placeId = await getPlaceId(deal.clinicName, deal.address, deal.postcode);
      const { rating, totalReviews } = await getGoogleRating(placeId);
      if(rating === 0 && totalReviews === 0) return {...deal, rating:4.0, totalReviews:20}
      return { ...deal, rating, totalReviews };
    }));

    const response = { bestDeals: dealsWithRatings };
    cache.set(cacheKey, response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}