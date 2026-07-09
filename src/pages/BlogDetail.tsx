import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Calendar, Clock, Eye, Tag, ChevronLeft, ChevronRight, ArrowLeft,
  Share2, Copy, Check, ChevronDown, ChevronUp, MapPin, Phone, List
} from "lucide-react";
import { Blog, BlogCategory, BlogTag, TravelEvent } from "../types";
import SubscriptionForm from "../components/SubscriptionForm";
import { cn } from "../lib/utils";

// ── Social Share Buttons ──────────────────────────────────────────────────────
function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">Share</span>
      {/* WhatsApp */}
      <a href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noreferrer"
        className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
      </a>
      {/* Facebook */}
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noreferrer"
        className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
      </a>
      {/* Twitter/X */}
      <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noreferrer"
        className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.735-8.835L1.253 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
      </a>
      {/* Copy Link */}
      <button onClick={copyLink}
        className="w-9 h-9 rounded-xl bg-slate-100 text-gray-500 flex items-center justify-center hover:bg-slate-200 transition-colors">
        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
      </button>
    </div>
  );
}

// ── FAQ Accordion ─────────────────────────────────────────────────────────────
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left gap-4 group">
        <span className="font-bold text-gray-800 group-hover:text-brand-primary transition-colors text-sm md:text-base">{question}</span>
        {open ? <ChevronUp size={16} className="text-brand-primary shrink-0" /> : <ChevronDown size={16} className="text-gray-300 shrink-0" />}
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pb-5 text-gray-500 text-sm leading-relaxed">
          {answer}
        </motion.div>
      )}
    </div>
  );
}

// ── Related Blog Card ─────────────────────────────────────────────────────────
function RelatedBlogCard({ blog }: { blog: Blog }) {
  const category = typeof blog.category === "object" ? blog.category as BlogCategory : null;
  return (
    <Link to={`/blog/${blog.slug}`} className="group flex gap-4 items-start">
      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
        {blog.featuredImage ? <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full bg-brand-primary/10" />}
      </div>
      <div className="min-w-0">
        {category && <p className="text-[9px] uppercase tracking-widest font-black mb-1" style={{ color: category.color || "#c29d44" }}>{category.name}</p>}
        <p className="text-sm font-bold text-gray-800 group-hover:text-brand-primary transition-colors line-clamp-2 leading-snug">{blog.title}</p>
        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Clock size={9} />{blog.readingTime || 1} min</p>
      </div>
    </Link>
  );
}

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [prevNext, setPrevNext] = useState<{ prev?: Blog, next?: Blog }>({});
  const [toc, setToc] = useState<{ id: string, title: string, level: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [siteSettings, setSiteSettings] = useState({ domain: "https://himsagartravels.com", phone: "+91 78457 38386", email: "concierge@himsagar.com" });

  // Parse HTML and create TOC
  useEffect(() => {
    if (blog && !loading && !notFound) {
      setTimeout(() => {
        const contentDiv = document.querySelector('.rich-content');
        if (contentDiv) {
          const headings = Array.from(contentDiv.querySelectorAll('h2, h3'));
          const tocData = headings.map((h, i) => {
            const id = h.id || `heading-${i}`;
            if (!h.id) h.id = id;
            return {
              id,
              title: h.textContent || '',
              level: h.tagName === 'H2' ? 2 : 3
            };
          });
          setToc(tocData);
        }
      }, 100); 
    }
  }, [blog, loading, notFound]);

  useEffect(() => {
    fetch("/api/content").then(r => r.json()).then(d => {
      setSiteSettings(s => ({ ...s, domain: d.site_domain || s.domain, phone: d.contact_phone || s.phone, email: d.contact_email || s.email }));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);

    Promise.all([
      fetch(`/api/blogs/${slug}`).then(r => { if (!r.ok) throw new Error("not found"); return r.json(); }),
      fetch(`/api/blogs/${slug}/related`).then(r => r.json()).catch(() => []),
    ]).then(([blogData, relatedData]) => {
      const b: Blog = { ...blogData, id: blogData._id || blogData.id };
      setBlog(b);
      setRelatedBlogs((relatedData || []).map((r: any) => ({ ...r, id: r._id || r.id })));

      // SEO head tags
      document.title = blogData.seoTitle || `${blogData.title} | Himsagar Travels`;
      const setMeta = (name: string, content: string, prop = false) => {
        const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
        let el = document.querySelector(sel) as HTMLMetaElement | null;
        if (!el) {
          el = document.createElement("meta");
          prop ? el.setAttribute("property", name) : el.setAttribute("name", name);
          document.head.appendChild(el);
        }
        el.setAttribute("content", content);
      };
      setMeta("description", blogData.metaDescription || blogData.excerpt || "");
      setMeta("keywords", blogData.keywords || "");
      setMeta("og:title", blogData.seoTitle || blogData.title, true);
      setMeta("og:description", blogData.metaDescription || blogData.excerpt || "", true);
      setMeta("og:image", blogData.ogImage || blogData.featuredImage || "", true);
      setMeta("og:url", `${siteSettings.domain}/blog/${blogData.slug}`, true);
      setMeta("twitter:card", "summary_large_image", false);
      setMeta("twitter:title", blogData.seoTitle || blogData.title, false);
      setMeta("twitter:description", blogData.metaDescription || blogData.excerpt || "", false);
      setMeta("twitter:image", blogData.twitterImage || blogData.featuredImage || "", false);

      // Canonical URL
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
      canonical.href = blogData.canonicalUrl || `${siteSettings.domain}/blog/${blogData.slug}`;

      // JSON-LD Article Schema
      const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": blogData.title,
        "description": blogData.excerpt || "",
        "image": blogData.featuredImage || "",
        "author": { "@type": "Person", "name": blogData.author || "Himsagar Travels" },
        "publisher": { "@type": "Organization", "name": "Himsagar Travels", "logo": { "@type": "ImageObject", "url": `${siteSettings.domain}/logo.png` } },
        "datePublished": blogData.publishedAt || blogData.created_at,
        "dateModified": blogData.updated_at || blogData.created_at,
        "url": `${siteSettings.domain}/blog/${blogData.slug}`,
      };
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": siteSettings.domain },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${siteSettings.domain}/blog` },
          { "@type": "ListItem", "position": 3, "name": blogData.title, "item": `${siteSettings.domain}/blog/${blogData.slug}` },
        ]
      };
      let schemaScript = document.getElementById("blog-schema") as HTMLScriptElement | null;
      if (!schemaScript) { schemaScript = document.createElement("script"); schemaScript.type = "application/ld+json"; schemaScript.id = "blog-schema"; document.head.appendChild(schemaScript); }
      schemaScript.text = JSON.stringify([articleSchema, breadcrumbSchema]);

      // Fetch prev/next
      fetch("/api/blogs/latest?limit=50").then(r => r.json()).then((all: Blog[]) => {
        const idx = all.findIndex(bl => bl.slug === slug);
        setPrevNext({ prev: idx < all.length - 1 ? all[idx + 1] : null, next: idx > 0 ? all[idx - 1] : null });
      }).catch(() => {});
    }).catch(() => {
      setNotFound(true);
    }).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-3xl mx-auto px-6 pt-40">
          <div className="h-8 rounded-2xl bg-gray-100 animate-pulse w-3/4" />
          <div className="h-4 rounded-xl bg-gray-100 animate-pulse" />
          <div className="h-4 rounded-xl bg-gray-100 animate-pulse w-5/6" />
          <div className="h-80 rounded-[2rem] bg-gray-100 animate-pulse mt-8" />
        </div>
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-32">
        <p className="text-6xl mb-4">📰</p>
        <h1 className="text-3xl font-serif text-gray-400 mb-2">Article Not Found</h1>
        <p className="text-gray-300 mb-8">This article may have been moved or deleted.</p>
        <Link to="/blog" className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-accent transition-colors">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  const category = typeof blog.category === "object" ? blog.category as BlogCategory : null;
  const tags = (blog.tags || []).map(t => (typeof t === "object" ? t as BlogTag : null)).filter(Boolean) as BlogTag[];
  const relatedTours = (blog.relatedTours || []) as any[];
  const publishedDate = blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "";
  const updatedDate = blog.updatedAt ? new Date(blog.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "";
  const currentUrl = `${siteSettings.domain}/blog/${blog.slug}`;

  return (
    <div className="min-h-screen bg-[#fdfdfd]">
      {/* ── Featured Image + Title Hero ── */}
      <section className="relative">
        {blog.featuredImage ? (
          <div className="h-[60vh] min-h-[400px] relative overflow-hidden">
            <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          </div>
        ) : (
          <div className="h-[35vh] min-h-[280px] bg-gradient-to-br from-brand-navy to-brand-dark" />
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-6 md:px-12 pb-10">
          {/* Breadcrumb */}
          <nav className="mb-5 flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest font-bold">
            <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-brand-primary transition-colors">Blog</Link>
            {category && <>
              <span>/</span>
              <Link to={`/blog?category=${typeof blog.category === "object" ? (blog.category as any)._id : blog.category}`} className="hover:text-brand-primary transition-colors">{category.name}</Link>
            </>}
          </nav>
          {category && (
            <span className="inline-block mb-3 px-4 py-1.5 rounded-full text-[9px] uppercase tracking-[0.3em] font-black text-white border border-white/20 backdrop-blur-sm bg-white/10">
              {category.name}
            </span>
          )}
          <h1 className="text-3xl md:text-5xl font-serif font-black text-white leading-tight max-w-4xl">
            {blog.title}
          </h1>
        </div>
      </section>

      {/* ── Meta Bar ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-6 md:px-12 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            <span className="flex items-center gap-1.5"><Calendar size={11} />{publishedDate}</span>
            <span className="flex items-center gap-1.5"><Clock size={11} />{blog.readingTime || 1} min read</span>
            <span className="flex items-center gap-1.5"><Eye size={11} />{blog.views || 0} views</span>
            <span className="text-gray-300">By <span className="text-gray-500">{blog.author}</span></span>
          </div>
          <ShareButtons title={blog.title} url={currentUrl} />
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 py-14">
        <div className="flex gap-14 items-start">
          {/* ── Main Content ── */}
          <article className="flex-1 min-w-0">
            {/* Excerpt */}
            {blog.excerpt && (
              <p className="text-lg md:text-xl text-gray-500 leading-relaxed border-l-4 border-brand-primary pl-6 mb-10 font-serif italic">
                {blog.excerpt}
              </p>
            )}

            {/* Rich Content */}
            <div
              className="rich-content text-gray-700 text-base leading-[1.9] max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap mt-12 pt-8 border-t border-gray-100">
                <Tag size={14} className="text-gray-300" />
                {tags.map(tag => (
                  <Link key={tag.id} to={`/blog?tag=${tag.id}`} className="px-4 py-1.5 bg-slate-50 border border-gray-100 rounded-full text-xs font-bold text-gray-400 hover:text-brand-primary hover:border-brand-primary transition-all">
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Share (bottom) */}
            <div className="mt-10 p-6 bg-slate-50 rounded-[2rem] flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-bold text-gray-700 text-sm">Found this article helpful?</p>
                <p className="text-xs text-gray-400">Share it with fellow travel enthusiasts.</p>
              </div>
              <ShareButtons title={blog.title} url={currentUrl} />
            </div>

            {/* Author */}
            <div className="mt-10 p-6 md:p-8 bg-white border border-gray-100 rounded-[2rem] flex items-start gap-5 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black text-xl shrink-0">
                {blog.author?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-400 mb-1">Written by</p>
                <p className="font-bold text-gray-800">{blog.author}</p>
                <p className="text-sm text-gray-500 mt-1">Expert travel curator at Himsagar Travels with curated stories and spiritual journey insights.</p>
              </div>
            </div>

            {/* Updated date */}
            {updatedDate && updatedDate !== publishedDate && (
              <p className="text-xs text-gray-300 mt-4 text-right">Last updated: {updatedDate}</p>
            )}

            {/* FAQ Section */}
            {blog.faq && blog.faq.length > 0 && (
              <section className="mt-16">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-2xl font-serif font-black text-gray-900">Frequently Asked Questions</h2>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>
                <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm divide-y divide-gray-100">
                  {blog.faq.map((item, i) => <FAQItem key={i} question={item.question} answer={item.answer} />)}
                </div>
              </section>
            )}

            {/* Related Tours */}
            {relatedTours.length > 0 && (
              <section className="mt-16">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-2xl font-serif font-black text-gray-900">Related Tour Packages</h2>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedTours.map((tour: any) => (
                    <Link key={tour._id || tour.id} to={`/tours/${tour.slug}`} className="group bg-white border border-gray-100 rounded-[2rem] overflow-hidden flex gap-4 p-4 hover:shadow-lg transition-all">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {tour.images?.[0] && <img src={tour.images[0]} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
                      </div>
                      <div className="min-w-0 flex flex-col justify-center">
                        <p className="text-[9px] uppercase tracking-widest font-black text-brand-primary mb-1">{tour.category}</p>
                        <p className="font-bold text-gray-800 group-hover:text-brand-primary transition-colors text-sm line-clamp-2">{tour.title}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><MapPin size={9} />{tour.location}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* CTA Section */}
            <section className="mt-16 bg-brand-navy rounded-[2rem] p-8 md:p-10 text-center">
              <p className="text-brand-primary text-[9px] uppercase tracking-[0.4em] font-black mb-3">Plan Your Journey</p>
              <h2 className="text-2xl md:text-3xl font-serif font-black text-white mb-4">Ready to Make This a Reality?</h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto text-sm">Our expert travel curators are ready to craft your perfect itinerary. Get in touch for a personalised quote.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact" className="px-8 py-3 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-accent transition-colors">
                  Get a Quote
                </Link>
                <a href={`tel:${siteSettings.phone.replace(/\s+/g, "")}`} className="px-8 py-3 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                  <Phone size={12} />{siteSettings.phone}
                </a>
              </div>
            </section>

            {/* Newsletter */}
            <section className="mt-10 bg-slate-50 border border-gray-100 rounded-[2rem] p-8">
              <h3 className="text-lg font-serif font-black text-gray-800 mb-2">Get More Travel Stories</h3>
              <p className="text-sm text-gray-400 mb-6">Subscribe to our newsletter and never miss an exclusive guide or tour announcement.</p>
              <SubscriptionForm source="blog-detail" title="" description="" buttonLabel="Subscribe Free" theme="light" />
            </section>

            {/* Prev / Next Navigation */}
            {(prevNext.prev || prevNext.next) && (
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                {prevNext.prev ? (
                  <Link to={`/blog/${prevNext.prev.slug}`} className="group p-5 bg-white border border-gray-100 rounded-[1.5rem] flex items-center gap-4 hover:shadow-md transition-all">
                    <ChevronLeft size={20} className="text-gray-300 group-hover:text-brand-primary transition-colors shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[9px] uppercase tracking-widest font-black text-gray-300 mb-1">Previous</p>
                      <p className="text-sm font-bold text-gray-700 group-hover:text-brand-primary transition-colors line-clamp-2">{prevNext.prev.title}</p>
                    </div>
                  </Link>
                ) : <div />}
                {prevNext.next && (
                  <Link to={`/blog/${prevNext.next.slug}`} className="group p-5 bg-white border border-gray-100 rounded-[1.5rem] flex items-center gap-4 justify-end text-right hover:shadow-md transition-all">
                    <div className="min-w-0">
                      <p className="text-[9px] uppercase tracking-widest font-black text-gray-300 mb-1">Next</p>
                      <p className="text-sm font-bold text-gray-700 group-hover:text-brand-primary transition-colors line-clamp-2">{prevNext.next.title}</p>
                    </div>
                    <ChevronRight size={20} className="text-gray-300 group-hover:text-brand-primary transition-colors shrink-0" />
                  </Link>
                )}
              </div>
            )}
          </article>

          <aside className="hidden lg:block w-72 shrink-0 space-y-8 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar pb-10">
            <Link to="/blog" className="flex items-center gap-2 text-xs uppercase tracking-widest font-black text-gray-400 hover:text-brand-primary transition-colors">
              <ArrowLeft size={14} /> Back to Blog
            </Link>

            {/* Table of Contents */}
            {toc.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-primary mb-4 flex items-center gap-2">
                  <List size={12} /> Table of Contents
                </h3>
                <nav className="space-y-3 relative before:absolute before:left-[3px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-100">
                  {toc.map((item) => (
                    <a 
                      key={item.id} 
                      href={`#${item.id}`} 
                      className={cn(
                        "block text-sm text-gray-500 hover:text-brand-primary transition-colors relative",
                        item.level === 3 ? "pl-5" : "pl-3 font-medium",
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {relatedBlogs.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-primary mb-6">Related Articles</h3>
                <div className="space-y-5">
                  {relatedBlogs.map(b => <RelatedBlogCard key={b.id} blog={b} />)}
                </div>
              </div>
            )}

            {/* Contact Card */}
            <div className="bg-brand-navy rounded-[2rem] p-6 text-center">
              <p className="text-[9px] uppercase tracking-[0.4em] font-black text-brand-primary mb-2">Expert Help</p>
              <h3 className="text-white font-serif text-base mb-4 leading-snug">Planning a similar trip?</h3>
              <Link to="/contact" className="block w-full py-3 bg-brand-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-accent transition-colors mb-3">
                Talk to an Expert
              </Link>
              <a href={`tel:${siteSettings.phone.replace(/\s+/g, "")}`} className="block text-white/40 text-xs hover:text-white transition-colors">
                {siteSettings.phone}
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
