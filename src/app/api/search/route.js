// import { NextResponse } from 'next/server';
// import { MongoClient } from 'mongodb';

// function toRadians(degrees) {
//   return degrees * Math.PI / 180;
// }

// function calculateDistance(lat1, lon1, lat2, lon2) {
//   const R = 3958.8; // Earth's radius in miles
//   const dLat = toRadians(lat2 - lat1);
//   const dLon = toRadians(lon2 - lon1);
//   const a = 
//     Math.sin(dLat/2) * Math.sin(dLat/2) +
//     Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
//     Math.sin(dLon/2) * Math.sin(dLon/2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//   return R * c;
// }

// function formatPostcode(postcode) {
//   return postcode.replace(/\s+/g, '').toUpperCase();
// }

// export async function POST(request) {
//   const { searchMethod, category, treatment, postcode, radius } = await request.json();

//   const client = await MongoClient.connect(process.env.MONGODB_URI);
//   const db = client.db('dentalpricing');
//   const priceCollection = db.collection('pricedata');
//   const postcodeCollection = client.db('webscrapping').collection('postalcode');

//   try {
//     const formattedUserPostcode = formatPostcode(postcode);

//     // Get user's postcode coordinates
//     const userPostcode = await postcodeCollection.findOne({ postcode: formattedUserPostcode });
//     if (!userPostcode) {
//       throw new Error('Invalid postcode');
//     }

//     const query = {};

//     // Apply search based on the selected method
//     if (searchMethod === 'category' && category) {
//       query.Category = { $regex: category, $options: 'i' };
//     } else if (searchMethod === 'treatment' && treatment) {
//       query.$or = [
//         { treatment: { $regex: treatment, $options: 'i' } }
//       ];
//     }

//     const results = await priceCollection.find(query).toArray();

//     // Calculate distances and filter based on radius
//     const filteredResults = await Promise.all(results.map(async (result) => {
//       const formattedClinicPostcode = formatPostcode(result.Postcode);
//       const clinicPostcode = await postcodeCollection.findOne({ postcode: formattedClinicPostcode });
//       if (clinicPostcode) {
//         const distance = calculateDistance(
//           userPostcode.latitude,
//           userPostcode.longitude,
//           clinicPostcode.latitude,
//           clinicPostcode.longitude
//         );
//         if (distance <= radius) {
//           return { ...result, distance };
//         }
//       }
//       return null;
//     }));

//     const finalResults = filteredResults.filter(result => result !== null);

//     await client.close();
//     return NextResponse.json(finalResults);
//   } catch (error) {
//     console.error("Database query error:", error);
//     await client.close();
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import NodeCache from 'node-cache';

// Initialize cache with a 10-minute TTL
const cache = new NodeCache({ stdTTL: 600 });

// Helper function to convert degrees to radians
function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

// Calculate distance between two points using the Haversine formula
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

// Format postcode by removing spaces and converting to uppercase
function formatPostcode(postcode) {
  return postcode.replace(/\s+/g, '').toUpperCase();
}

export async function POST(request) {
  const { searchMethod, category, treatment, postcode, radius, page = 1, limit = 10 } = await request.json();

  // Create a cache key based on search parameters
  const cacheKey = `${searchMethod}-${category}-${treatment}-${postcode}-${radius}-${page}-${limit}`;
  
  // Check if result is in cache
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
        { treatment: { $regex: new RegExp(treatment, 'i') } },
        // { Category: { $regex: new RegExp(category, 'i') } }
      ];
    }

    const skip = (page - 1) * limit;
    
    // Fetch results without distance calculation
    const results = await priceCollection.find(query).skip(skip).limit(limit).toArray();

    // Fetch all unique postcodes from the results
    const uniquePostcodes = [...new Set(results.map(result => formatPostcode(result.Postcode)))];

    // Fetch latitude and longitude for all unique postcodes in one query
    const postcodeInfo = await postcodeCollection.find({ postcode: { $in: uniquePostcodes } }).toArray();
    const postcodeMap = new Map(postcodeInfo.map(info => [info.postcode, info]));

    // Calculate distances and filter results
    const filteredResults = results.map(result => {
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

    const totalCount = await priceCollection.countDocuments(query);

    const response = {
      results: filteredResults,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalResults: totalCount
      }
    };

    // Cache the result
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