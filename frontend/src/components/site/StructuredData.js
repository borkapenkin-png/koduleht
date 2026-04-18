export function LocalBusinessSchema({ settings = {}, siteUrl }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "PaintingContractor",
    name: settings.company_name || "J&B Tasoitus ja Maalaus Oy",
    telephone: settings.company_phone_primary || settings.contact_phone_1 || "+358 40 054 7270",
    email: settings.company_email || settings.contact_email || "info@jbtasoitusmaalaus.fi",
    url: siteUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.company_address || settings.contact_address || "Sienitie 25, 00760 Helsinki",
      addressLocality: settings.company_city || "Helsinki",
      addressCountry: "FI",
    },
    areaServed: (settings.service_areas || ["Helsinki", "Espoo", "Vantaa", "Kauniainen", "Uusimaa"]).map((area) => ({
      "@type": "City",
      name: area,
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
