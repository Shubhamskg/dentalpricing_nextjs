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

        if (!reviews) {
            return NextResponse.json({
                reviews: { most_relevant: [], newest: [], highest: [], lowest: [] },
                rating: rating || 0,
                totalReviews: user_ratings_total || 0,
            });
        }

        // Process and categorize reviews
        const processedReviews = reviews.map(review => ({
            name: review.author_name,
            rating: review.rating,
            relative_time: review.relative_time_description,
            text: review.text
        }));

        const categorizedReviews = {
            most_relevant: processedReviews.slice(0, 20),
            newest: [...processedReviews].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 20),
            highest: [...processedReviews].sort((a, b) => b.rating - a.rating).slice(0, 20),
            lowest: [...processedReviews].sort((a, b) => a.rating - b.rating).slice(0, 20)
        };

        return NextResponse.json({
            reviews: categorizedReviews,
            rating: rating || 0,
            totalReviews: user_ratings_total || 0,
        });
    } catch (error) {
        console.error('Error fetching Google reviews:');
        return NextResponse.json({ error: 'Failed to fetch Google reviews', details: error.message }, { status: 500 });
    }
}