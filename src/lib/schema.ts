export const generateTravelAgencySchema = (name: string, url: string, logo: string, description: string, telephone: string, address: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": name,
    "url": url,
    "logo": logo,
    "description": description,
    "telephone": telephone,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": address,
      "addressCountry": "IN"
    },
    "sameAs": [
      "https://www.facebook.com/himsagartravelsofficial/",
      "https://www.instagram.com/himsagar_travels"
    ]
  };
};

export const generateOrganizationSchema = (name: string, url: string, logo: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "url": url,
    "logo": logo,
    "sameAs": [
      "https://www.facebook.com/himsagartravelsofficial/",
      "https://www.instagram.com/himsagar_travels"
    ]
  };
};

export const generateFAQSchema = (faqs: { q: string; a: string }[]) => {
  if (!faqs || faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };
};

export const generateBreadcrumbSchema = (items: { name: string; item: string }[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.name,
      "item": breadcrumb.item
    }))
  };
};

export const generateEventSchema = (eventData: any) => {
  if (!eventData) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": eventData.title,
    "description": eventData.description || eventData.desc,
    "image": eventData.images ? eventData.images[0] : "",
    "startDate": eventData.date,
    "endDate": eventData.date, // If multi-day, ideally parse, but fallback to start date
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    "location": {
      "@type": "Place",
      "name": eventData.location,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": eventData.location
      }
    },
    "offers": {
      "@type": "Offer",
      "url": `https://himsagartravels.com/tours/${eventData.slug || eventData._id || eventData.id}`,
      "price": eventData.price,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "validFrom": new Date().toISOString()
    }
  };
};

export const generateTourSchema = (tourData: any) => {
  if (!tourData) return null;
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": tourData.title,
    "description": tourData.description || tourData.desc,
    "touristType": [
      "Leisure",
      tourData.category
    ],
    "itinerary": {
      "@type": "ItemList",
      "itemListElement": (tourData.itinerary || []).map((day: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "TouristAttraction",
          "name": day.title,
          "description": day.desc
        }
      }))
    }
  };
};

export const generateBlogPostSchema = (blogData: any) => {
  if (!blogData) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blogData.title,
    "image": blogData.image || "",
    "datePublished": blogData.publishedAt || new Date().toISOString(),
    "dateModified": blogData.updatedAt || new Date().toISOString(),
    "author": [{
      "@type": "Person",
      "name": blogData.author || "Himsagar Travels",
      "url": "https://himsagartravels.com/about"
    }]
  };
};

export const generateDestinationSchema = (destData: any) => {
  if (!destData) return null;
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "name": destData.title,
    "description": destData.description,
    "image": destData.image || "",
    "touristType": [
      "Leisure",
      destData.category || "Sightseeing"
    ]
  };
};
