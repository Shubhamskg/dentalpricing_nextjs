import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const address = searchParams.get('address');
    const postcode = searchParams.get('postcode');

    console.log(`Received request for: ${name}, ${address}, ${postcode}`);

    if (!name || !address || !postcode) {
      console.log('Missing required parameters');
      return NextResponse.json({ error: 'Name, address, and postcode are required' }, { status: 400 });
    }

    console.log('Calling Google Places API');
    console.log('API Key:', process.env.GOOGLE_MAPS_API_KEY ? 'Set' : 'Not Set');

    const input = encodeURIComponent(`${name}, ${address}, ${postcode}, UK`);
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${input}&inputtype=textquery&fields=place_id&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    console.log('Google Places API Response:', JSON.stringify(data, null, 2));

    if (data.status === 'REQUEST_DENIED') {
      console.error('Google API Error:', data.error_message);
      return NextResponse.json({ error: 'API key is not authorized', details: data.error_message }, { status: 403 });
    }

    if (data.candidates && data.candidates.length > 0) {
      const placeId = data.candidates[0].place_id;
      console.log('Place ID found:', placeId);
      return NextResponse.json({ placeId });
    } else {
      console.log('No place found');
      return NextResponse.json({ error: 'No place found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Unhandled error in API route:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}