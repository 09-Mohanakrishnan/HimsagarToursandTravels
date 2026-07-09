import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Search, ArrowRight, Clock, Eye, Calendar, Tag, ChevronLeft, ChevronRight, BookOpen, FileText, MapPin, Compass, Phone } from "lucide-react";
import { Blog, BlogCategory } from "../types";
import { cn } from "../lib/utils";
import { useSEOOverride } from "../lib/useSEO";
import { seoConfig } from "../lib/seoConfig";

const HERO_BG = "/images/blog-hero.png";

function BlogCard({ blog, featured = false }: { blog: Blog; featured?: boolean }) {
  const category = typeof blog.category === "object" ? blog.category : null;
  const publishedDate = blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

  if (featured) {
    return (
      <Link to={`/blog/${blog.slug}`} className="group block">
        <div className="relative rounded-[2.5rem] overflow-hidden aspect-[16/7] bg-gray-100">
          {blog.featuredImage ? (
            <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-navy to-brand-dark" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            {category && (
              <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.3em] font-black text-white/90 border border-white/20 backdrop-blur-sm bg-white/10">
                {category.name}
              </span>
            )}
            <h2 className="text-2xl md:text-4xl font-serif font-black text-white leading-tight mb-4 max-w-3xl group-hover:text-brand-primary transition-colors">
              {blog.title}
            </h2>
            <p className="text-white/70 text-sm md:text-base line-clamp-2 max-w-2xl mb-6">{blog.excerpt}</p>
            <div className="flex items-center gap-6 text-white/50 text-xs">
              <span className="flex items-center gap-2"><Calendar size={12} />{publishedDate}</span>
              <span className="flex items-center gap-2"><Clock size={12} />{blog.readingTime || 1} min read</span>
              <span className="flex items-center gap-2"><Eye size={12} />{blog.views || 0} views</span>
            </div>
          </div>
          <div className="absolute top-6 left-6">
            <span className="px-3 py-1 bg-brand-primary text-white text-[9px] uppercase tracking-[0.35em] font-black rounded-full">Featured</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white border border-gray-100 rounded-[2rem] overflow-hidden hover:shadow-xl hover:shadow-gray-100/80 transition-all duration-500"
    >
      <Link to={`/blog/${blog.slug}`} className="block">
        <div className="aspect-[16/9] overflow-hidden bg-gray-50 relative">
          {blog.featuredImage ? (
            <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-navy/10 to-brand-primary/10 flex items-center justify-center">
              <FileText size={32} className="text-gray-300" />
            </div>
          )}
          {category && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full text-[9px] uppercase tracking-[0.3em] font-black text-white backdrop-blur-sm" style={{ background: category.color || "#c29d44" }}>
                {category.name}
              </span>
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-3">
            <span className="flex items-center gap-1.5"><Calendar size={10} />{publishedDate}</span>
            <span className="flex items-center gap-1.5"><Clock size={10} />{blog.readingTime || 1} min</span>
          </div>
          <h3 className="text-lg font-serif font-black text-gray-900 leading-snug mb-3 group-hover:text-brand-primary transition-colors line-clamp-2">
            {blog.title}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4">{blog.excerpt}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold">By {blog.author}</span>
            <span className="flex items-center gap-1 text-brand-primary text-xs font-black uppercase tracking-widest group-hover:gap-2 transition-all">
              Read <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [featured, setFeatured] = useState<Blog | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [popular, setPopular] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // SEO Integration
  const seoResult = useSEOOverride("blog", seoConfig.Blog);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: "9" });
        if (search) params.set("search", search);
        if (selectedCategory) params.set("category", selectedCategory);

        const [blogsRes, featuredRes, catsRes, popularRes] = await Promise.all([
          fetch(`/api/blogs?${params}`).then(r => r.json()),
          fetch("/api/blogs/featured").then(r => r.json()),
          fetch("/api/blog-categories").then(r => r.json()),
          fetch("/api/blogs/popular?limit=5").then(r => r.json()),
        ]);

        const normalizedBlogs = (blogsRes.blogs || []).map((b: any) => ({ ...b, id: b._id || b.id }));
        setBlogs(normalizedBlogs);
        setTotalPages(blogsRes.pages || 1);
        setFeatured(featuredRes[0] ? { ...featuredRes[0], id: featuredRes[0]._id || featuredRes[0].id } : null);
        setCategories((catsRes || []).map((c: any) => ({ ...c, id: c._id || c.id })));
        setPopular((popularRes || []).map((b: any) => ({ ...b, id: b._id || b.id })));
      } catch (err) {
        console.error("Failed to fetch blog data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, search, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#fcfdfd]">

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO — Cinematic full-bleed hero (matching Tours & About)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden pt-28">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={HERO_BG}
            alt="Travel Blog"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/70 via-brand-navy/50 to-brand-navy/80" />
        </div>

        {/* Floating geometric accents */}
        <div className="absolute top-24 right-16 w-64 h-64 border border-white/[0.05] rounded-full" />
        <div className="absolute bottom-20 left-12 w-40 h-40 border border-brand-primary/10 rounded-full" />

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 md:px-12 text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-6 py-2.5 mb-10">
              <BookOpen size={12} className="text-brand-primary" />
              <span className="text-white/80 text-[10px] uppercase tracking-[0.4em] font-bold">Travel Stories & Guides</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-[6.5rem] font-serif font-black tracking-tighter text-white leading-[0.9] mb-8">
              {seoResult?.h1Tag ? seoResult.h1Tag : (<>Our<br /><span className="text-brand-primary">Journal</span></>)}
            </h1>
            <p className="text-white/55 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
              Expert insights, spiritual journeys, and destination guides curated for the discerning traveller.
            </p>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fcfdfd] to-transparent" />
      </section>

      {/* ── Search Bar ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-6 md:px-12 py-4">
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search articles, destinations, guides..."
                className="w-full bg-slate-50 border border-gray-100 rounded-2xl py-3 pl-11 pr-4 outline-none focus:border-brand-primary transition-all text-sm text-gray-700"
              />
            </div>
            <button type="submit" className="px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-brand-accent transition-colors shrink-0">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 py-16">
        {/* ── Featured Blog ── */}
        {featured && !search && !selectedCategory && page === 1 && (
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <p className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-primary">Featured Post</p>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
            <BlogCard blog={featured} featured />
          </section>
        )}

        <div className="flex gap-12 items-start">
          {/* ── Blog Grid ── */}
          <main className="flex-1 min-w-0">
            {/* Category Filter Pills */}
            <div className="flex gap-3 flex-wrap mb-10">
              <button
                onClick={() => { setSelectedCategory(""); setPage(1); }}
                className={cn("px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all", !selectedCategory ? "bg-brand-primary text-white" : "bg-slate-50 text-gray-400 hover:bg-slate-100")}
              >
                All Posts
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                  className={cn("px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all", selectedCategory === cat.id ? "bg-brand-primary text-white" : "bg-slate-50 text-gray-400 hover:bg-slate-100")}
                >
                  {cat.name} {cat.postCount !== undefined && <span className="opacity-60">({cat.postCount})</span>}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="rounded-[2rem] bg-gray-100 animate-pulse aspect-[4/3]" />)}
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[2rem] border border-gray-100">
                <Search size={40} className="text-gray-200 mb-4 mx-auto" />
                <p className="text-xl font-serif text-gray-400">No articles found</p>
                <p className="text-sm text-gray-300 mt-2">Try a different search or category</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {blogs.map(blog => <BlogCard key={blog.id} blog={blog} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-12">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-3 rounded-2xl bg-slate-50 border border-gray-100 text-gray-400 hover:bg-white hover:text-brand-primary disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={cn("w-10 h-10 rounded-2xl text-sm font-black transition-all", p === page ? "bg-brand-primary text-white" : "bg-slate-50 text-gray-400 hover:bg-white")}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-3 rounded-2xl bg-slate-50 border border-gray-100 text-gray-400 hover:bg-white hover:text-brand-primary disabled:opacity-30 transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>

          {/* ── Sidebar ── */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-8 sticky top-24">
            {/* Popular Posts */}
            {popular.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-primary mb-6">Popular Posts</h3>
                <div className="space-y-5">
                  {popular.map((blog, i) => (
                    <Link key={blog.id} to={`/blog/${blog.slug}`} className="flex gap-3 group items-start">
                      <span className="text-2xl font-black text-gray-100 leading-none shrink-0 w-7">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-700 group-hover:text-brand-primary transition-colors line-clamp-2 leading-snug">{blog.title}</p>
                        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Eye size={9} />{blog.views} views</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {categories.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-primary mb-6">Categories</h3>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id); setPage(1); window.scrollTo(0, 0); }}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ background: cat.color || "#c29d44" }} />
                        <span className="text-sm text-gray-600 group-hover:text-brand-primary transition-colors font-medium">{cat.name}</span>
                      </div>
                      <span className="text-[10px] font-black text-gray-300">{cat.postCount || 0}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Start Your Journey CTA */}
            <div className="bg-brand-navy rounded-[2rem] p-6">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/15 flex items-center justify-center mb-4">
                <Compass size={18} className="text-brand-primary" />
              </div>
              <p className="text-[9px] uppercase tracking-[0.4em] font-black text-brand-primary mb-2">Start Your Journey</p>
              <h3 className="text-white font-serif text-lg mb-3 leading-snug">Ready to turn inspiration into adventure?</h3>
              <p className="text-white/40 text-sm mb-5 leading-relaxed">Our expert curators craft personalised itineraries for every kind of traveller.</p>
              <Link to="/contact" className="block w-full py-3 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-brand-accent transition-colors text-center mb-3">
                Get a Free Quote
              </Link>
              <Link to="/tours" className="block w-full py-3 bg-white/5 border border-white/10 text-white/70 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-colors text-center">
                Explore Tours
              </Link>
            </div>
          </aside>
        </div>

        {/* ── Explore Journeys CTA ── */}
        <section className="mt-24 bg-brand-navy rounded-[3rem] p-12 md:p-16 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-brand-primary/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6">
                  <MapPin size={12} className="text-brand-primary" />
                  <span className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-bold">Curated Experiences</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-black text-white mb-4 leading-tight">Explore Our Curated Journeys</h2>
                <p className="text-white/50 mb-8 leading-relaxed">From sacred pilgrimages to hidden Himalayan valleys — discover handcrafted itineraries designed for the discerning traveller.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/tours" className="px-8 py-3.5 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-accent transition-colors text-center">
                    Browse All Tours
                  </Link>
                  <Link to="/contact" className="px-8 py-3.5 bg-white/5 border border-white/15 text-white/80 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-colors text-center">
                    Custom Itinerary
                  </Link>
                </div>
              </div>
              <div className="hidden md:grid grid-cols-2 gap-4">
                {[
                  { icon: Compass, label: "Destinations", value: "50+" },
                  { icon: Calendar, label: "Years of Expertise", value: "15+" },
                  { icon: MapPin, label: "Tour Packages", value: "100+" },
                  { icon: Phone, label: "Support", value: "24/7" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center hover:bg-white/10 transition-colors">
                    <stat.icon size={18} className="text-brand-primary mx-auto mb-2" />
                    <p className="text-2xl font-black text-white mb-1">{stat.value}</p>
                    <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
