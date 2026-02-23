import { Helmet } from 'react-helmet-async';

// Company info for schema
const COMPANY = {
  name: "J&B Tasoitus ja Maalaus Oy",
  url: "https://jbtasoitusmaalaus.fi",
  logo: "https://jbtasoitusmaalaus.fi/logo.png",
  phone: "+358 40 054 7270",
  email: "info@jbtasoitusmaalaus.fi",
  address: {
    street: "Sienitie 25",
    city: "Helsinki",
    postalCode: "00760",
    country: "FI"
  },
  geo: {
    lat: 60.2341,
    lng: 25.0842
  },
  areaServed: ["Helsinki", "Espoo", "Vantaa", "Uusimaa"],
  foundingDate: "2018",
  priceRange: "€€"
};

// LocalBusiness Schema
const getLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": COMPANY.url,
  "name": COMPANY.name,
  "image": COMPANY.logo,
  "url": COMPANY.url,
  "telephone": COMPANY.phone,
  "email": COMPANY.email,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": COMPANY.address.street,
    "addressLocality": COMPANY.address.city,
    "postalCode": COMPANY.address.postalCode,
    "addressCountry": COMPANY.address.country
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": COMPANY.geo.lat,
    "longitude": COMPANY.geo.lng
  },
  "areaServed": COMPANY.areaServed.map(area => ({
    "@type": "City",
    "name": area
  })),
  "foundingDate": COMPANY.foundingDate,
  "priceRange": COMPANY.priceRange,
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "07:00",
    "closes": "17:00"
  },
  "sameAs": []
});

// Service Schema
const getServiceSchema = (service) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": service.name,
  "provider": {
    "@type": "LocalBusiness",
    "name": COMPANY.name
  },
  "areaServed": COMPANY.areaServed.map(area => ({
    "@type": "City",
    "name": area
  })),
  "description": service.description,
  "url": `${COMPANY.url}/palvelut/${service.slug}`
});

// BreadcrumbList Schema
const getBreadcrumbSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const SEOHead = ({ 
  title, 
  description, 
  keywords,
  canonical,
  type = "website",
  image,
  service,
  breadcrumbs
}) => {
  const fullTitle = title ? `${title} | J&B Tasoitus ja Maalaus` : "J&B Tasoitus ja Maalaus | Ammattitaitoista maalausta ja tasoitusta Helsinki";
  const fullDescription = description || "Ammattitaitoista tasoitus- ja maalaustyötä Helsingissä ja Uudellamaalla vuodesta 2018. Sisä- ja ulkomaalaukset, julkisivurappaukset, tasoitustyöt. Pyydä ilmainen arvio!";
  const fullImage = image || COMPANY.logo;
  const fullCanonical = canonical || COMPANY.url;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={fullCanonical} />
      
      {/* Language */}
      <html lang="fi" />
      <meta name="language" content="Finnish" />
      <meta name="geo.region" content="FI-18" />
      <meta name="geo.placename" content="Helsinki" />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="J&B Tasoitus ja Maalaus" />
      <meta property="og:locale" content="fi_FI" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#0891B2" />
      
      {/* LocalBusiness Schema */}
      <script type="application/ld+json">
        {JSON.stringify(getLocalBusinessSchema())}
      </script>
      
      {/* Service Schema (if service page) */}
      {service && (
        <script type="application/ld+json">
          {JSON.stringify(getServiceSchema(service))}
        </script>
      )}
      
      {/* Breadcrumb Schema */}
      {breadcrumbs && (
        <script type="application/ld+json">
          {JSON.stringify(getBreadcrumbSchema(breadcrumbs))}
        </script>
      )}
    </Helmet>
  );
};

export { COMPANY };
