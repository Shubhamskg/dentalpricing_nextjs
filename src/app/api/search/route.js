import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

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
  const { searchMethod, category, treatment, postcode, radius } = await request.json();

  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db('dentalpricing');
  const priceCollection = db.collection('pricedata');
  const postcodeCollection = client.db('webscrapping').collection('postalcode');

  try {
    const formattedUserPostcode = formatPostcode(postcode);

    // Get user's postcode coordinates
    const userPostcode = await postcodeCollection.findOne({ postcode: formattedUserPostcode });
    if (!userPostcode) {
      throw new Error('Invalid postcode');
    }

    const query = {};

    // Apply search based on the selected method
    if (searchMethod === 'category' && category) {
      query.Category = { $regex: category, $options: 'i' };
    } else if (searchMethod === 'treatment' && treatment) {
      query.$or = [
        { treatment: { $regex: treatment, $options: 'i' } },
        { Category: { $regex: treatment, $options: 'i' } }
      ];
    }

    const results = await priceCollection.find(query).toArray();

    // Calculate distances and filter based on radius
    const filteredResults = await Promise.all(results.map(async (result) => {
      const formattedClinicPostcode = formatPostcode(result.Postcode);
      const clinicPostcode = await postcodeCollection.findOne({ postcode: formattedClinicPostcode });
      if (clinicPostcode) {
        const distance = calculateDistance(
          userPostcode.latitude,
          userPostcode.longitude,
          clinicPostcode.latitude,
          clinicPostcode.longitude
        );
        if (distance <= radius) {
          return { ...result, distance };
        }
      }
      return null;
    }));

    const finalResults = filteredResults.filter(result => result !== null);

    await client.close();
    return NextResponse.json(finalResults);
  } catch (error) {
    console.error("Database query error:", error);
    await client.close();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
// import { NextResponse } from 'next/server';
// import { MongoClient } from 'mongodb';
// import NodeCache from 'node-cache';

// const MONGODB_URI = process.env.MONGODB_URI;
// const cache = new NodeCache({ stdTTL: 600 });
// let client;

// async function connectToDatabase() {
//   if (!client) {
//     try {
//       client = new MongoClient(MONGODB_URI, {
//         maxPoolSize: 10
//       });
//       await client.connect();
//       console.log('Connected to MongoDB');
//     } catch (error) {
//       console.error('Failed to connect to MongoDB:', error);
//       throw error;
//     }
//   }
//   return client;
// }

// function formatPostcode(postcode) {
//   return postcode.replace(/\s+/g, '').toUpperCase();
// }

// async function getCachedPostcodeCoordinates(postcodeCollection, postcode) {
//   const cacheKey = `postcode_${postcode}`;
//   let coordinates = cache.get(cacheKey);
  
//   if (!coordinates) {
//     console.log(`Cache miss for postcode: ${postcode}`);
//     try {
//       coordinates = await postcodeCollection.findOne(
//         { postcode },
//         { projection: { latitude: 1, longitude: 1 } }
//       );
//       if (coordinates) {
//         cache.set(cacheKey, coordinates);
//         console.log(`Cached coordinates for postcode: ${postcode}`);
//       } else {
//         console.log(`No coordinates found for postcode: ${postcode}`);
//       }
//     } catch (error) {
//       console.error(`Error fetching coordinates for postcode ${postcode}:`, error);
//       throw error;
//     }
//   } else {
//     console.log(`Cache hit for postcode: ${postcode}`);
//   }
  
//   return coordinates;
// }

// export async function POST(request) {
//   console.log('Received POST request');
//   let requestBody;
//   try {
//     requestBody = await request.json();
//     console.log('Request body:', requestBody);
//   } catch (error) {
//     console.error('Error parsing request body:', error);
//     return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
//   }

//   const { 
//     searchMethod, 
//     category, 
//     treatment, 
//     postcode, 
//     radius, 
//     page = 1, 
//     pageSize = 20 
//   } = requestBody;
  
//   console.log('Parsed request parameters:', { searchMethod, category, treatment, postcode, radius, page, pageSize });
  
//   try {
//     const client = await connectToDatabase();
//     const db = client.db('dentalpricing');
//     const priceCollection = db.collection('pricedata');
//     const postcodeCollection = client.db('webscrapping').collection('postalcode');

//     const formattedUserPostcode = formatPostcode(postcode);
//     console.log('Formatted user postcode:', formattedUserPostcode);

//     const userPostcode = await getCachedPostcodeCoordinates(postcodeCollection, formattedUserPostcode);

//     if (!userPostcode) {
//       console.log('Invalid postcode:', formattedUserPostcode);
//       return NextResponse.json({ error: 'Invalid postcode' }, { status: 400 });
//     }

//     console.log('User postcode coordinates:', userPostcode);

//     const query = {};
//     if (searchMethod === 'category' && category) {
//       query.Category = { $regex: new RegExp(category, 'i') };
//     } else if (searchMethod === 'treatment' && treatment) {
//       query.$or = [
//         { treatment: { $regex: new RegExp(treatment, 'i') } },
//         { Category: { $regex: new RegExp(treatment, 'i') } }
//       ];
//     }

//     console.log('MongoDB query:', JSON.stringify(query));

//     const aggregationPipeline = [
//       { $match: query },
//       {
//         $lookup: {
//           from: "postalcode",
//           localField: "Postcode",
//           foreignField: "postcode",
//           as: "postcodeInfo"
//         }
//       },
//       { $unwind: "$postcodeInfo" },
//       {
//         $addFields: {
//           distance: {
//             $function: {
//               body: function(lat1, lon1, lat2, lon2) {
//                 const toRadians = (angle) => angle * (Math.PI / 180);
//                 const R = 3959; // Earth's radius in miles
//                 const φ1 = toRadians(lat1);
//                 const φ2 = toRadians(lat2);
//                 const Δφ = toRadians(lat2 - lat1);
//                 const Δλ = toRadians(lon2 - lon1);
//                 const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
//                           Math.cos(φ1) * Math.cos(φ2) *
//                           Math.sin(Δλ/2) * Math.sin(Δλ/2);
//                 const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//                 return R * c;
//               },
//               args: ["$postcodeInfo.latitude", "$postcodeInfo.longitude", userPostcode.latitude, userPostcode.longitude],
//               lang: "js"
//             }
//           }
//         }
//       },
//       { $match: { distance: { $lte: radius } } },
//       {
//         $project: {
//           _id: 1,
//           Name: 1,
//           treatment: 1,
//           Price: 1,
//           Category: 1,
//           "Address 1": 1,
//           Postcode: 1,
//           Website: 1,
//           Feepage: 1,
//           distance: 1
//         }
//       },
//       { $sort: { distance: 1 } },
//       { $skip: (page - 1) * pageSize },
//       { $limit: pageSize }
//     ];

//     console.log('Aggregation pipeline:', JSON.stringify(aggregationPipeline));

//     // Check if there are any documents in the collection
//     const totalDocuments = await priceCollection.countDocuments();
//     console.log('Total documents in priceCollection:', totalDocuments);

//     // Execute the aggregation pipeline
//     const results = await priceCollection.aggregate(aggregationPipeline).toArray();
//     console.log(`Found ${results.length} results`);

//     // If no results, let's check why
//     if (results.length === 0) {
//       // Check how many documents match the initial query
//       const matchingDocuments = await priceCollection.countDocuments(query);
//       console.log(`Documents matching initial query: ${matchingDocuments}`);

//       // Check how many documents are left after the distance calculation
//       const documentsWithinRadius = await priceCollection.aggregate(aggregationPipeline.slice(0, 5)).toArray();
//       console.log(`Documents within radius: ${documentsWithinRadius.length}`);
//     }

//     const totalCountPipeline = aggregationPipeline.slice(0, -2);
//     totalCountPipeline.push({ $count: 'total' });
//     const totalCountResult = await priceCollection.aggregate(totalCountPipeline).toArray();
//     const totalCount = totalCountResult[0]?.total || 0;
//     console.log('Total count:', totalCount);

//     return NextResponse.json({
//       results,
//       pagination: {
//         currentPage: page,
//         totalPages: Math.ceil(totalCount / pageSize),
//         totalCount
//       }
//     });
//   } catch (error) {
//     console.error("Database query error:", error);
//     return NextResponse.json({ error: 'An internal server error occurred', details: error.message }, { status: 500 });
//   }
// }