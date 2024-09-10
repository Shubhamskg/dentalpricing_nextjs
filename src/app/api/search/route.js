import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 });


function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function formatPostcode(postcode) {
  return postcode.replace(/\s+/g, '').toUpperCase();
}

function isValidPrice(price) {
  return typeof price === 'number' && price > 0 && isFinite(price);
}

export async function GET(request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const searchMethod = searchParams.get('searchMethod');
  const category = searchParams.get('category');
  const treatment = searchParams.get('treatment');
  const postcode = searchParams.get('postcode');
  const radius = searchParams.get('radius');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const sort = searchParams.get('sort') || 'price-desc';
  
  const cacheKey = `${searchMethod}-${category}-${treatment}-${postcode}-${radius}-${page}-${limit}-${sort}`;

  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    return NextResponse.json(cachedResult);
  }

  let client;
  try {
    client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('dentalpricing');
    const priceCollection = db.collection('pricedata');
    const postcodeCollection = client.db('webscrapping').collection('postalcode');

    const formattedUserPostcode = formatPostcode(postcode);
    const userPostcode = await postcodeCollection.findOne({ postcode: formattedUserPostcode });
    
    if (!userPostcode) {
      throw new Error('Invalid postcode');
    }

    const query = {};
    if (searchMethod === 'category' && category) {
      query.Category = { $regex: new RegExp(category, 'i') };
    } else if (searchMethod === 'treatment' && treatment) {
      query.$or = [
        { treatment: { $regex: new RegExp(treatment, 'i') } }
      ];
    }

    // Get all results that match the query
    const allResults = await priceCollection.find(query).toArray();

    // Filter out results with invalid prices
    const validResults = allResults.filter(result => isValidPrice(result.Price));

    // Group results by category
    const groupedResults = validResults.reduce((acc, result) => {
      const category = result.Category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(result);
      return acc;
    }, {});

    // Filter out categories with fewer than 25 entries and remove cheapest 10%
    const filteredResults = Object.entries(groupedResults).flatMap(([category, results]) => {
      if (results.length < 25) {
        return [];
      }
      results.sort((a, b) => a.Price - b.Price);
      const cutoff = Math.ceil(results.length * 0.1);
      return results.slice(cutoff);
    });

    // Fetch all unique postcodes from the filtered results
    const uniquePostcodes = [...new Set(filteredResults.map(result => formatPostcode(result.Postcode)))];

    // Fetch latitude and longitude for all unique postcodes in one query
    const postcodeInfo = await postcodeCollection.find({ postcode: { $in: uniquePostcodes } }).toArray();
    const postcodeMap = new Map(postcodeInfo.map(info => [info.postcode, info]));

    // Calculate distances and filter results
    const resultsWithDistance = filteredResults.map(result => {
      const formattedClinicPostcode = formatPostcode(result.Postcode);
      const clinicPostcode = postcodeMap.get(formattedClinicPostcode);
      if (clinicPostcode) {
        const distance = calculateDistance(
          userPostcode.latitude,
          userPostcode.longitude,
          clinicPostcode.latitude,
          clinicPostcode.longitude
        );
        if (distance <= parseFloat(radius)) {
          return { ...result, distance };
        }
      }
      return null;
    }).filter(result => result !== null);

    // Apply sorting
    if (sort === 'distance-asc') {
      resultsWithDistance.sort((a, b) => a.distance - b.distance);
    } else if (sort === 'distance-desc') {
      resultsWithDistance.sort((a, b) => b.distance - a.distance);
    } else if (sort === 'price-asc') {
      resultsWithDistance.sort((a, b) => a.Price - b.Price);
    } else if (sort === 'price-desc') {
      resultsWithDistance.sort((a, b) => b.Price - a.Price);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedResults = resultsWithDistance.slice(startIndex, startIndex + limit);

    const response = {
      results: paginatedResults,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(resultsWithDistance.length / limit),
        totalResults: resultsWithDistance.length
      }
    };

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