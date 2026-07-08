import {
  generateTravelAgencySchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateEventSchema,
  generateTourSchema,
  generateFAQSchema
} from './schema';

const siteName = "Himsagar Tours and Travels";
const baseUrl = "https://himsagartravels.com";
const logoUrl = `${baseUrl}/logo.png`; // Update with actual full logo URL
const defaultPhone = "+91 78457 38386";
const defaultAddress = "Kolkata, West Bengal, India";

// Base SEO Configs
export const seoConfig = {
  Home: {
    title: `${siteName} – Spiritual & Himalayan Tour Packages`,
    description: "Explore curated spiritual, domestic & international tour packages. From high peaks to serene landscapes, experience unforgettable journeys with Himsagar Travels.",
    canonicalPath: "/",
    keywords: "himalayan tours, spiritual tours, travel agency india, domestic tours, international tour packages",
    robots: "index, follow",
    schema: generateTravelAgencySchema(
      siteName,
      baseUrl,
      logoUrl,
      "Explore curated spiritual, domestic & international tour packages. From high peaks to serene landscapes, experience unforgettable journeys with Himsagar Travels.",
      defaultPhone,
      defaultAddress
    )
  },
  About: {
    title: `About Us – Our Story & Heritage | ${siteName}`,
    description: "Since 1995, Himsagar Travels has been crafting spiritual and Himalayan tour packages. Learn about our heritage, principles, and team.",
    canonicalPath: "/about",
    keywords: "about himsagar travels, travel agency heritage, our travel team",
    robots: "index, follow",
    schema: [
      generateOrganizationSchema(siteName, baseUrl, logoUrl),
      generateBreadcrumbSchema([
        { name: "Home", item: baseUrl },
        { name: "About Us", item: `${baseUrl}/about` }
      ])
    ]
  },
  Contact: {
    title: `Contact Us – Book Your Journey | ${siteName}`,
    description: "Get in touch with Himsagar Travels for bookings, inquiries, and custom tour packages. Find our office locations, FAQs, and contact details.",
    canonicalPath: "/contact",
    keywords: "contact himsagar travels, travel agency contact, tour bookings india",
    robots: "index, follow",
    schema: [
      generateTravelAgencySchema(
        siteName,
        baseUrl,
        logoUrl,
        "Get in touch with Himsagar Travels for bookings, inquiries, and custom tour packages.",
        defaultPhone,
        defaultAddress
      ),
      generateBreadcrumbSchema([
        { name: "Home", item: baseUrl },
        { name: "Contact", item: `${baseUrl}/contact` }
      ])
    ]
  },
  Events: {
    title: `Tour Packages – Spiritual, Domestic & International | ${siteName}`,
    description: "Browse all curated travel experiences. From the high peaks of the North to the silent deserts of the West — handpicked journeys designed for the soul.",
    canonicalPath: "/tours",
    keywords: "tour packages, spiritual tours, travel destinations, holiday packages",
    robots: "index, follow",
    schema: generateBreadcrumbSchema([
      { name: "Home", item: baseUrl },
      { name: "Tours", item: `${baseUrl}/tours` }
    ])
  },
  Blog: {
    title: `Travel Blog | Tips, Guides & Stories | ${siteName}`,
    description: "Explore travel guides, spiritual journey tips, tour stories and destination insights from Himsagar Travels — curated by expert travellers.",
    canonicalPath: "/blog",
    keywords: "travel blog, tour guides, spiritual journey tips, destination insights, travel stories",
    robots: "index, follow",
    schema: generateBreadcrumbSchema([
      { name: "Home", item: baseUrl },
      { name: "Blog", item: `${baseUrl}/blog` }
    ])
  }
};

export const getEventSEOConfig = (event: any) => {
  if (!event) {
    return {
      title: `Tour Details | ${siteName}`,
      description: "Discover an unforgettable journey with Himsagar Travels.",
      canonicalPath: "/tours",
      robots: "noindex, follow",
    };
  }

  const url = `${baseUrl}/tours/${event.slug || event._id || event.id}`;

  const schemas = [
    generateBreadcrumbSchema([
      { name: "Home", item: baseUrl },
      { name: "Tours", item: `${baseUrl}/tours` },
      { name: event.title, item: url }
    ]),
    generateEventSchema(event),
    generateTourSchema(event)
  ].filter(Boolean);

  return {
    title: `${event.title} – ${event.location} | ${siteName}`,
    description: (event.description || event.desc || "").substring(0, 160),
    canonicalPath: `/tours/${event.slug || event._id || event.id}`,
    ogImage: event.images && event.images.length > 0 ? event.images[0] : undefined,
    keywords: `${event.title}, ${event.location}, ${event.category} tour, travel package`,
    robots: "index, follow",
    schema: schemas.length > 0 ? schemas : undefined
  };
};
