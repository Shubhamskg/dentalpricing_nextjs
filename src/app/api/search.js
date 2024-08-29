import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { searchTerm, category, location } = req.body;
    console.log("data",req.body)

    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('dentalpricing');
    const collection = db.collection('pricedata');

    const query = {};

    if (searchTerm) {
      query.$or = [
        { Name: { $regex: searchTerm, $options: 'i' } },
        { treatment: { $regex: searchTerm, $options: 'i' } },
        { Category: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    if (category) {
      query.Category = { $regex: category, $options: 'i' };
    }

    if (location) {
      query.$or = query.$or || [];
      query.$or.push(
        { Address_1: { $regex: location, $options: 'i' } },
        { Postcode: { $regex: location, $options: 'i' } }
      );
    }

    const results = await collection.find(query).toArray();
    
    client.close();

    res.status(200).json(results);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}