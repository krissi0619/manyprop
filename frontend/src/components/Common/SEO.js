import React from 'react';
import { Helmet } from 'react-helmet-async';

const DEFAULT_TITLE = 'ManyProp - Real Estate Platform | Verified Listings & No Brokerage';
const DEFAULT_DESC = 'ManyProp is India\'s most trusted property platform with 100% owner listings and zero brokerage. Buy, rent, and sell flats, villas, apartments, and luxury bungalows.';
const DEFAULT_KEYWORDS = 'real estate, buy property, rent apartment, sell flat, no brokerage, verified owners, villas for sale, ManyProp, Pune real estate';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80'; // Sleek fallback image
const DEFAULT_SITE_URL = 'https://manyprop.onrender.com';

const SEO = ({
  title,
  description,
  keywords,
  image,
  canonicalUrl,
  type = 'website',
  schema,
}) => {
  const seoTitle = title ? `${title} | ManyProp` : DEFAULT_TITLE;
  const seoDescription = description || DEFAULT_DESC;
  const seoKeywords = keywords || DEFAULT_KEYWORDS;
  const seoImage = image || DEFAULT_IMAGE;
  const currentUrl = canonicalUrl || typeof window !== 'undefined' ? window.location.href : DEFAULT_SITE_URL;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="ManyProp" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
