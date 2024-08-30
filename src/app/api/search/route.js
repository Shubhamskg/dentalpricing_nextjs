
// import { NextResponse } from 'next/server';
// import { MongoClient } from 'mongodb';
// import NodeCache from 'node-cache';

// // Initialize cache with a 10-minute TTL
// const cache = new NodeCache({ stdTTL: 600 });

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
//   const { searchMethod, category, treatment, postcode, radius, page = 1, limit = 20, sort = 'price-desc' } = await request.json();

//   const cacheKey = `${searchMethod}-${category}-${treatment}-${postcode}-${radius}-${page}-${limit}-${sort}`;
  
//   const cachedResult = cache.get(cacheKey);
//   if (cachedResult) {
//     return NextResponse.json(cachedResult);
//   }

//   let client;
//   try {
//     client = await MongoClient.connect(process.env.MONGODB_URI);
//     const db = client.db('dentalpricing');
//     const priceCollection = db.collection('pricedata');
//     const postcodeCollection = client.db('webscrapping').collection('postalcode');

//     const formattedUserPostcode = formatPostcode(postcode);
//     const userPostcode = await postcodeCollection.findOne({ postcode: formattedUserPostcode });
    
//     if (!userPostcode) {
//       throw new Error('Invalid postcode');
//     }

//     const query = {};
//     if (searchMethod === 'category' && category) {
//       query.Category = { $regex: new RegExp(category, 'i') };
//     } else if (searchMethod === 'treatment' && treatment) {
//       query.$or = [
//         { treatment: { $regex: new RegExp(treatment, 'i') } }
//       ];
//     }

//     // Determine sort order
//     let sortOrder = {};
//     if (sort === 'price-asc') {
//       sortOrder = { Price: 1 };
//     } else if (sort === 'price-desc') {
//       sortOrder = { Price: -1 };
//     }

//     // Apply sort and pagination
//     const results = await priceCollection.find(query)
//       .sort(sortOrder)
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .toArray();

//     const uniquePostcodes = [...new Set(results.map(result => formatPostcode(result.Postcode)))];

//     const postcodeInfo = await postcodeCollection.find({ postcode: { $in: uniquePostcodes } }).toArray();
//     const postcodeMap = new Map(postcodeInfo.map(info => [info.postcode, info]));

//     const filteredResults = results.map(result => {
//       const formattedClinicPostcode = formatPostcode(result.Postcode);
//       const clinicPostcode = postcodeMap.get(formattedClinicPostcode);
//       if (clinicPostcode) {
//         const distance = calculateDistance(
//           userPostcode.latitude,
//           userPostcode.longitude,
//           clinicPostcode.latitude,
//           clinicPostcode.longitude
//         );
//         if (distance <= parseFloat(radius)) {
//           return { ...result, distance };
//         }
//       }
//       return null;
//     }).filter(result => result !== null);

//     // Apply distance sorting if needed
//     if (sort === 'distance-asc') {
//       filteredResults.sort((a, b) => a.distance - b.distance);
//     } else if (sort === 'distance-desc') {
//       filteredResults.sort((a, b) => b.distance - a.distance);
//     }

//     const totalCount = await priceCollection.countDocuments(query);

//     const response = {
//       results: filteredResults,
//       pagination: {
//         currentPage: page,
//         totalPages: Math.ceil(totalCount / limit),
//         totalResults: totalCount
//       }
//     };

//     cache.set(cacheKey, response);

//     return NextResponse.json(response);
//   } catch (error) {
//     console.error("Database query error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   } finally {
//     if (client) {
//       await client.close();
//     }
//   }
// }
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

export async function POST(request) {
  const { searchMethod, category, treatment, postcode, radius, page = 1, limit = 20, sort = 'price-desc' } = await request.json();

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

    // Determine sort order
    let sortOrder = {};
    if (sort === 'price-asc') {
      sortOrder = { Price: 1 };
    } else if (sort === 'price-desc') {
      sortOrder = { Price: -1 };
    }

    // First, get all results that match the query
    const allResults = await priceCollection.find(query).sort(sortOrder).toArray();

    // Fetch all unique postcodes from the results
    const uniquePostcodes = [...new Set(allResults.map(result => formatPostcode(result.Postcode)))];

    // Fetch latitude and longitude for all unique postcodes in one query
    const postcodeInfo = await postcodeCollection.find({ postcode: { $in: uniquePostcodes } }).toArray();
    const postcodeMap = new Map(postcodeInfo.map(info => [info.postcode, info]));

    // Calculate distances and filter results
    const filteredResults = allResults.map(result => {
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

    // Apply distance sorting if needed
    if (sort === 'distance-asc') {
      filteredResults.sort((a, b) => a.distance - b.distance);
    } else if (sort === 'distance-desc') {
      filteredResults.sort((a, b) => b.distance - a.distance);
    }

    // Apply pagination after filtering
    const paginatedResults = filteredResults.slice((page - 1) * limit, page * limit);

    const response = {
      results: paginatedResults,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredResults.length / limit),
        totalResults: filteredResults.length
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