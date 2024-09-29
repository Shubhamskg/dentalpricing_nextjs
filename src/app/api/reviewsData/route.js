import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;

async function connectToDatabase() {
    if (!db) {
        await client.connect();
        db = client.db('dentalpricing');
    }
    return db;
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const address = searchParams.get('address');
    const postcode = searchParams.get('postcode');
    const showAll = searchParams.get('showAll') === 'true';

    if (!name || !address || !postcode) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    try {
        const database = await connectToDatabase();
        const collection = database.collection('googleReviews');
        const clinic = await collection.findOne({ name, address, postcode });

        if (clinic && clinic.reviews) {
            const limit = showAll ? 0 : 3;  // 0 means no limit
            const processReviews = (reviews) => reviews.slice(0, limit || undefined).map(review => ({
                ...review,
                rating: parseFloat(review.rating.match(/(\d+(\.\d+)?)/)[0])
            }));

            const responseData = {
                reviews: {
                    most_relevant: processReviews(clinic.reviews.most_relevant || []),
                    newest: processReviews(clinic.reviews.newest || []),
                    highest: processReviews(clinic.reviews.highest || []),
                    lowest: processReviews(clinic.reviews.lowest || [])
                },
                rating: parseFloat(clinic.reviews.total_rating),
                totalReviews: clinic.reviews.total_reviews
            };

            return NextResponse.json(responseData);
        } else {
            return NextResponse.json({ message: 'Reviews not found in database' }, { status: 404 });
        }
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}