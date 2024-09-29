// app/api/clinicDescriptions/route.js

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
    const website = searchParams.get('website');

    if (!website) {
        return NextResponse.json({ error: 'Website parameter is required' }, { status: 400 });
    }

    try {
        const database = await connectToDatabase();
        const collection = database.collection('clinicDescriptions');

        const clinicDescription = await collection.findOne({ url: website });

        if (!clinicDescription) {
            return NextResponse.json({ error: 'Clinic description not found' }, { status: 404 });
        }

        return NextResponse.json(clinicDescription, {
            status: 200,
            headers: {
                'Cache-Control': 'public, max-age=36000, s-maxage=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        console.error('Error fetching clinic description:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}