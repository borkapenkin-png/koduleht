import { Helmet } from 'react-helmet-async';

// Company info for schema
const COMPANY = {
  name: "J&B Tasoitus ja Maalaus Oy",
  url: "https://jbtasoitusmaalaus.fi",
  logo: "https://customer-assets.emergentagent.com/job_modern-jbta/artifacts/g1de58um_jb2-logo.png",
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
  "url": COMPANY.url + "/palvelut/" + service.slug
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
  service,
  breadcrumbs
}) => {
  const pageTitle = title || "J&B Tasoitus ja Maalaus - Ammattitaitoista maalausta ja tasoitusta Helsinki";
  const pageDescription = description || "Ammattitaitoista tasoitus- ja maalaustyötä Helsingissä ja Uudellamaalla vuodesta 2018. Sisä- ja ulkomaalaukset, julkisivurappaukset, tasoitustyöt. Pyydä ilmainen arvio!";
  const pageCanonical = canonical || COMPANY.url;

  const localBusinessSchema = JSON.stringify(getLocalBusinessSchema());
  const serviceSchema = service ? JSON.stringify(getServiceSchema(service)) : null;
  const breadcrumbSchema = breadcrumbs ? JSON.stringify(getBreadcrumbSchema(breadcrumbs)) : null;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={pageCanonical} />
      <meta name="language" content="Finnish" />
      <meta name="geo.region" content="FI-18" />
      <meta name="geo.placename" content="Helsinki" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={pageCanonical} />
      <meta property="og:image" content={COMPANY.logo} />
      <meta property="og:site_name" content="J&B Tasoitus ja Maalaus" />
      <meta property="og:locale" content="fi_FI" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={COMPANY.logo} />
      <script type="application/ld+json">{localBusinessSchema}</script>
      {serviceSchema && <script type="application/ld+json">{serviceSchema}</script>}
      {breadcrumbSchema && <script type="application/ld+json">{breadcrumbSchema}</script>}
    </Helmet>
  );
};

export { COMPANY };
