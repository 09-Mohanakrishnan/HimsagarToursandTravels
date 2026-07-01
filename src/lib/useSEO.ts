import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
}

export function useSEO({ title, description, canonicalPath, ogImage }: SEOProps) {
  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // Helper to update or create meta tags
    const updateMetaTag = (selector: string, attribute: string, value: string, createIfMissing: () => HTMLElement) => {
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = createIfMissing();
        document.head.appendChild(tag);
      }
      tag.setAttribute(attribute, value);
    };

    // 2. Update Description
    updateMetaTag(
      'meta[name="description"]',
      'content',
      description,
      () => {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        return meta;
      }
    );

    // 3. Update Canonical URL
    const baseUrl = window.location.origin;
    const fullCanonicalUrl = `${baseUrl}${canonicalPath}`;
    updateMetaTag(
      'link[rel="canonical"]',
      'href',
      fullCanonicalUrl,
      () => {
        const link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        return link;
      }
    );

    // 4. Update Open Graph Tags
    updateMetaTag('meta[property="og:title"]', 'content', title, () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      return meta;
    });

    updateMetaTag('meta[property="og:description"]', 'content', description, () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      return meta;
    });

    updateMetaTag('meta[property="og:url"]', 'content', fullCanonicalUrl, () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:url');
      return meta;
    });

    updateMetaTag('meta[property="og:type"]', 'content', 'website', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:type');
      return meta;
    });

    if (ogImage) {
      updateMetaTag('meta[property="og:image"]', 'content', ogImage, () => {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:image');
        return meta;
      });
    }

  }, [title, description, canonicalPath, ogImage]);
}
