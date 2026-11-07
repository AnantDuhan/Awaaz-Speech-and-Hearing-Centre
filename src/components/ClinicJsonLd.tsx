import { site } from "@/content/site";

const isPlaceholder = (value?: string) => !value || /\[.*\]/.test(value);

/**
 * Structured data that tells Google this is a clinic, where it is and when
 * it's open. Rendered on the home page. Check it with
 * https://search.google.com/test/rich-results once the site is live.
 */
export function ClinicJsonLd() {
  const { address, google } = site;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: site.name,
    description: site.description,
    url: site.url,
    telephone: site.phone.tel,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${address.street}, ${address.area}`,
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.pin,
      addressCountry: address.country,
    },
    openingHoursSpecification: site.hours.flatMap((row) => {
      if (row.closed || isPlaceholder(row.opens) || isPlaceholder(row.closes)) return [];

      return [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: row.days,
          opens: row.opens,
          closes: row.closes,
        },
      ];
    }),
    ...(google.profileUrl ? { hasMap: google.profileUrl, sameAs: [google.profileUrl] } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}
