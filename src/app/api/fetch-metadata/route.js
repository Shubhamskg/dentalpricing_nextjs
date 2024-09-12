// import { NextResponse } from 'next/server';
// import { parse } from 'node-html-parser';

// export async function GET(request) {
//   const { searchParams } = new URL(request.url);
//   const url = searchParams.get('url');

//   if (!url) {
//     return NextResponse.json({ error: 'URL is required' }, { status: 400 });
//   }

//   try {
//     const response = await fetch(url);
//     const html = await response.text();
//     const root = parse(html);
//     const title=root.querySelector('title').textContent

//     const description = root.querySelector('meta[name="description"]')?.getAttribute('content') ||
//                         root.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
//                         '';

//     const logo = root.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
//                  root.querySelector('link[rel="icon"]')?.getAttribute('href') ||
//                  root.querySelector('link[rel="shortcut icon"]')?.getAttribute('href') ||
//                  '';

//     // If the logo is a relative path, make it absolute
//     const logoUrl = logo && !logo.startsWith('http') ? new URL(logo, url).href : logo;

//     return NextResponse.json({title, description, logo: logoUrl });
//   } catch (error) {
//     console.error('Error fetching metadata:', error);
//     return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
//   }
// }
import { NextResponse } from 'next/server';
import { parse } from 'node-html-parser';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    const root = parse(html);

    const title = root.querySelector('title')?.textContent || '';
    const description = root.querySelector('meta[name="description"]')?.getAttribute('content') ||
                        root.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                        '';
    const logo = root.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
                 root.querySelector('link[rel="icon"]')?.getAttribute('href') ||
                 root.querySelector('link[rel="shortcut icon"]')?.getAttribute('href') ||
                 '';

    // If the logo is a relative path, make it absolute
    const logoUrl = logo && !logo.startsWith('http') ? new URL(logo, url).href : logo;

    return NextResponse.json({ title, description, logo: logoUrl });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
}