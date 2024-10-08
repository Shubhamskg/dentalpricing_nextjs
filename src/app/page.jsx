"use client"

import { Suspense, useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import Dashboard from './price/page';
import Loading from './components/Loading';

// SEO component
function SEO({ title, description, pathname }) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={`https://www.dentalbooking.co.uk${pathname}`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`https://www.dentalbooking.co.uk${pathname}`} />
      <meta property="og:image" content="https://www.dentalbooking.co.uk/og-image.jpg" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="https://www.dentalbooking.co.uk/twitter-image.jpg" />
    </Head>
  );
}

function generateSEOData(pathname, searchParams) {
  const baseTitle = "Dental Booking | ";
  const baseDescription = "Compare dental treatment prices across different clinics in the UK. ";

  switch (pathname) {
    case '/':
      return {
        title: baseTitle + "Compare Dental Treatment Prices",
        description: baseDescription + "Find affordable dental care options in your area with our easy-to-use search tool."
      };
    case '/price':
      const category = searchParams.get('category');
      const treatment = searchParams.get('treatment');
      const postcode = searchParams.get('postcode');
      if (category) {
        return {
          title: baseTitle + `${category} Prices`,
          description: `Compare ${category} prices for dental treatments near ${postcode || 'you'}. Find the best deals on dental care.`
        };
      } else if (treatment) {
        return {
          title: baseTitle + `${treatment} Prices`,
          description: `Compare prices for ${treatment} near ${postcode || 'you'}. Find affordable options for this dental treatment.`
        };
      }
      return {
        title: baseTitle + "Search Dental Treatment Prices",
        description: baseDescription + "Use our search tool to find and compare dental treatment costs in your area."
      };
    case '/about':
      return {
        title: baseTitle + "About Us",
        description: "Learn about Dental Booking's mission to make dental care costs transparent and accessible to everyone in the UK."
      };
    // Add more cases for other pages as needed
    default:
      return {
        title: baseTitle + "UK Dental Price Comparison",
        description: baseDescription
      };
  }
}
function HomeContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [seoData, setSeoData] = useState({
    title: "Dental Booking | Compare Dental Treatment Prices",
    description: "Compare dental treatment prices across different clinics in the UK. Find affordable dental care options in your area with our easy-to-use search tool."
  });

  useEffect(() => {
    setSeoData(generateSEOData(pathname, searchParams));
  }, [pathname, searchParams]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Dental Booking",
    "url": "https://www.dentalbooking.co.uk",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.dentalbooking.co.uk/price?category={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "description": seoData.description
  };

  return (
    <>
      <SEO title={seoData.title} description={seoData.description} pathname={pathname} />
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Dashboard />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <HomeContent />
    </Suspense>
  );
}