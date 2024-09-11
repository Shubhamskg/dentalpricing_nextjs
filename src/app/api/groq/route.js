import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function generateDescription(prompt) {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3.1',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Unexpected response structure from GROQ API');
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error in generateDescription:', error);
    return null;
  }
}

export async function POST(request) {
  try {
    const { type, data } = await request.json();

    let description;
    if (type === 'clinic') {
      const prompt = `Provide a brief description of a dental clinic named "${data.name}" located in "${data.location}". Include information about their services and any unique features. Use this metadata if available: ${data.metadata}`;
      description = await generateDescription(prompt);
      if (!description) {
        description = `Welcome to ${data.name}, a dental clinic located in ${data.location}. We are committed to providing high-quality dental care in a comfortable and friendly environment.`;
      }
    } else if (type === 'treatment') {
      const prompt = `Briefly describe the dental treatment "${data.name}". Include basic information about the procedure and when it might be recommended.`;
      description = await generateDescription(prompt);
      if (!description) {
        description = `${data.name} is a dental treatment offered by our clinic. Please consult with our dentists for more information about this procedure.`;
      }
    } else {
      return NextResponse.json({ error: 'Invalid type specified' }, { status: 400 });
    }

    return NextResponse.json({ description });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}