import { useEffect, useState } from 'react';

export interface SEOProps {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  keywords?: string;
  robots?: string;
  themeColor?: string;
  author?: string;
  twitterHandle?: string;
  schema?: object | object[];
}

export function useSEO({
  title,
  description,
  canonicalPath,
  ogImage,
  keywords,
  robots = 'index, follow',
  themeColor = '#0f172a',
  author = 'Himsagar Travels',
  twitterHandle = '@himsagartravels',
  schema
}: SEOProps) {
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
    updateMetaTag('meta[name="description"]', 'content', description, () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      return meta;
    });

    // 3. Update Canonical URL
    const baseUrl = window.location.origin;
    const fullCanonicalUrl = `${baseUrl}${canonicalPath}`;
    updateMetaTag('link[rel="canonical"]', 'href', fullCanonicalUrl, () => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      return link;
    });

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

    // 5. Update Twitter Cards
    updateMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'twitter:card');
      return meta;
    });

    updateMetaTag('meta[name="twitter:title"]', 'content', title, () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'twitter:title');
      return meta;
    });

    updateMetaTag('meta[name="twitter:description"]', 'content', description, () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'twitter:description');
      return meta;
    });

    if (twitterHandle) {
      updateMetaTag('meta[name="twitter:site"]', 'content', twitterHandle, () => {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'twitter:site');
        return meta;
      });
    }

    if (ogImage) {
      updateMetaTag('meta[name="twitter:image"]', 'content', ogImage, () => {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'twitter:image');
        return meta;
      });
    }

    // 6. Update Standard Tags
    if (keywords) {
      updateMetaTag('meta[name="keywords"]', 'content', keywords, () => {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'keywords');
        return meta;
      });
    }

    if (robots) {
      updateMetaTag('meta[name="robots"]', 'content', robots, () => {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'robots');
        return meta;
      });
    }

    if (themeColor) {
      updateMetaTag('meta[name="theme-color"]', 'content', themeColor, () => {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        return meta;
      });
    }

    if (author) {
      updateMetaTag('meta[name="author"]', 'content', author, () => {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'author');
        return meta;
      });
    }

    // 7. Update JSON-LD Schema
    const existingSchemaScript = document.querySelector('script[type="application/ld+json"]#seo-schema');
    if (existingSchemaScript) {
      existingSchemaScript.remove();
    }

    if (schema) {
      const schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.id = 'seo-schema';
      schemaScript.text = JSON.stringify(schema);
      document.head.appendChild(schemaScript);
    }

    // Cleanup function to prevent duplicate schemas on unmount
    return () => {
      const scriptToRemove = document.querySelector('script[type="application/ld+json"]#seo-schema');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };

  }, [title, description, canonicalPath, ogImage, keywords, robots, themeColor, author, twitterHandle, schema]);
}

const seoCache = new Map<string, any>();

export function useSEOOverride(pageKey: string, defaultConfig: SEOProps) {
  const [config, setConfig] = useState<SEOProps>(defaultConfig);

  useEffect(() => {
    // If config changes from parent (e.g., event data loads), update it initially
    setConfig(prev => ({ ...prev, ...defaultConfig }));
  }, [defaultConfig.title, defaultConfig.canonicalPath]);

  useEffect(() => {
    if (!pageKey) return;
    
    if (seoCache.has(pageKey)) {
      const override = seoCache.get(pageKey);
      applyOverride(override);
      return;
    }

    fetch(`/api/seo/${pageKey}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          seoCache.set(pageKey, data);
          applyOverride(data);
        }
      })
      .catch(console.error);

    function applyOverride(data: any) {
      setConfig(prev => {
        let newSchema = prev.schema;
        if (data.customSchema) {
          try {
            newSchema = JSON.parse(data.customSchema);
          } catch (e) {}
        }

        return {
          ...prev,
          title: data.seoTitle || prev.title,
          description: data.metaDescription || prev.description,
          canonicalPath: data.canonicalUrl ? new URL(data.canonicalUrl).pathname : prev.canonicalPath,
          ogImage: data.ogImage || prev.ogImage,
          keywords: data.keywords || prev.keywords,
          robots: data.robots || prev.robots,
          twitterHandle: data.twitterImage ? undefined : prev.twitterHandle, // if they provide an image, we can just use the standard twitter image tag
          schema: newSchema
        };
      });
    }
  }, [pageKey]);

  useSEO(config);
}
