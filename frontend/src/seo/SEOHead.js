import { useEffect } from 'react';

// Company info for schema
const COMPANY = {
  name: "J&B Tasoitus ja Maalaus Oy",
  url: "https://www.jbtasoitusmaalaus.fi",
  logo: "https://www.jbtasoitusmaalaus.fi/logo.png",
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
  "@type": ["LocalBusiness", "PaintingContractor"],
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
  }
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
  const pageDescription = description || "Ammattitaitoista tasoitus- ja maalaustyötä Helsingissä ja Uudellamaalla.";
  const pageCanonical = canonical || COMPANY.url;

  useEffect(() => {
    // Set document title
    document.title = pageTitle;
    
    // Update meta tags
    const updateMeta = (name, content, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    updateMeta('description', pageDescription);
    if (keywords) updateMeta('keywords', keywords);
    updateMeta('og:title', pageTitle, true);
    updateMeta('og:description', pageDescription, true);
    updateMeta('og:url', pageCanonical, true);
    updateMeta('twitter:title', pageTitle);
    updateMeta('twitter:description', pageDescription);
    
    // Update canonical
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', pageCanonical);
    
    // Add schemas
    const addSchema = (id, schema) => {
      let script = document.getElementById(id);
      if (!script) {
        script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    };
    
    addSchema('schema-localbusiness', getLocalBusinessSchema());
    if (service) {
      addSchema('schema-service', getServiceSchema(service));
    }
    if (breadcrumbs) {
      addSchema('schema-breadcrumb', getBreadcrumbSchema(breadcrumbs));
    }
    
  }, [pageTitle, pageDescription, pageCanonical, keywords, service, breadcrumbs]);

  return null; // No JSX, just side effects
};

export { COMPANY };
