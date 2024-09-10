// src/app/api/google-reviews/route.js
import { Client } from '@googlemaps/google-maps-services-js';
import { NextResponse } from 'next/server';

const client = new Client({});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');

  if (!placeId) {
    return NextResponse.json({ error: 'Place ID is required' }, { status: 400 });
  }

  try {
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        fields: ['reviews', 'rating', 'user_ratings_total'],
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    const { reviews, rating, user_ratings_total } = response.data.result;

    return NextResponse.json({
      reviews: reviews?.slice(0, 5) || [],
      rating: rating || 0,
      totalReviews: user_ratings_total || 0,
    });
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch Google reviews', details: error.message }, { status: 500 });
  }
}