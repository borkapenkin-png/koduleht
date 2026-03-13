import React from 'react';

// Structured Data Component for SEO - JSON-LD
const StructuredData = ({ settings = {} }) => {
  const companyName = settings?.company_name || "J&B Tasoitus ja Maalaus Oy";
  const phone = settings?.company_phone_primary || settings?.contact_phone_1 || "+358 40 054 7270";
  const email = settings?.company_email || settings?.contact_email || "info@jbtasoitusmaalaus.fi";
  const address = settings?.company_address || settings?.contact_address || "Sienitie 25, 00760 Helsinki";
  const description = settings?.hero_subtitle || "Ammattitaitoista tasoitus- ja maalauspalvelua Helsingissä ja Uudellamaalla.";
  
  // LocalBusiness Schema
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://jbtasoitusmaalaus.fi/#localbusiness",
    "name": companyName,
    "description": description,
    "url": "https://jbtasoitusmaalaus.fi",
    "telephone": phone,
    "email": email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Sienitie 25",
      "addressLocality": "Helsinki",
      "postalCode": "00760",
      "addressRegion": "Uusimaa",
      "addressCountry": "FI"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 60.2390,
      "longitude": 25.0450
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "07:00",
      "closes": "17:00"
    },
    "areaServed": [
      { "@type": "City", "name": "Helsinki" },
      { "@type": "City", "name": "Espoo" },
      { "@type": "City", "name": "Vantaa" },
      { "@type": "City", "name": "Kauniainen" },
      { "@type": "AdministrativeArea", "name": "Uusimaa" }
    ],
    "priceRange": "€€",
    "paymentAccepted": ["Cash", "Credit Card", "Invoice"],
    "currenciesAccepted": "EUR",
    "image": "https://jbtasoitusmaalaus.fi/og-image.jpg",
    "logo": settings?.logo_url || "https://jbtasoitusmaalaus.fi/logo.png",
    "sameAs": []
  };
  
  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://jbtasoitusmaalaus.fi/#organization",
    "name": companyName,
    "url": "https://jbtasoitusmaalaus.fi",
    "logo": settings?.logo_url || "https://jbtasoitusmaalaus.fi/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": phone,
      "contactType": "customer service",
      "availableLanguage": ["Finnish", "Estonian"]
    }
  };
  
  // Service Schema (for homepage)
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Tasoitus- ja maalauspalvelut",
    "provider": {
      "@type": "LocalBusiness",
      "@id": "https://jbtasoitusmaalaus.fi/#localbusiness"
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": "Uusimaa"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Palvelut",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Tasoitustyöt",
            "description": "Ammattitaitoiset tasoitustyöt sisä- ja ulkotiloihin"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Maalaustyöt",
            "description": "Sisä- ja ulkomaalaustyöt kaikenkokoisiin kohteisiin"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Julkisivumaalaus",
            "description": "Julkisivujen maalaus ja kunnostus"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Mikrosementti",
            "description": "Modernit mikrosementtipinnat"
          }
        }
      ]
    }
  };
  
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
    </>
  );
};

export default StructuredData;
