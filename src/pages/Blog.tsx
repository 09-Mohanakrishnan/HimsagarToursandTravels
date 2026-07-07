import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Search, ArrowRight, Clock, Eye, Calendar, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { Blog, BlogCategory } from "../types";
import SubscriptionForm from "../components/SubscriptionForm";
import { cn } from "../lib/utils";

const HERO_BG = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=2000";

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
              <span className="text-4xl">✍️</span>
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

  // Update document head for SEO
  useEffect(() => {
    document.title = "Travel Blog | Tips, Guides & Stories | Himsagar Travels";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Explore travel guides, spiritual journey tips, tour stories and destination insights from Himsagar Travels — curated by expert travellers.");
  }, []);

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
    <div className="min-h-screen bg-[#fdfdfd]">
      {/* ── Hero ── */}
      <section className="relative h-[55vh] min-h-[420px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="Travel Blog" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
        <div className="relative container mx-auto px-6 md:px-12 pb-16">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest font-bold">
            <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white/80">Blog</span>
          </nav>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-brand-primary text-[10px] uppercase tracking-[0.4em] font-black mb-3">Himsagar Travels</p>
            <h1 className="text-4xl md:text-6xl font-serif font-black text-white leading-tight mb-4">
              Travel Stories &<br />Guides
            </h1>
            <p className="text-white/60 max-w-lg text-base">
              Expert insights, spiritual journeys, and destination guides curated for the discerning traveller.
            </p>
          </motion.div>
        </div>
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
                <p className="text-5xl mb-4">📝</p>
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

            {/* Newsletter */}
            <div className="bg-brand-navy rounded-[2rem] p-6">
              <p className="text-[9px] uppercase tracking-[0.4em] font-black text-brand-primary mb-2">Newsletter</p>
              <h3 className="text-white font-serif text-lg mb-3 leading-snug">Get travel stories in your inbox</h3>
              <SubscriptionForm
                source="blog-sidebar"
                title=""
                description=""
                buttonLabel="Subscribe Free"
              />
            </div>
          </aside>
        </div>

        {/* ── Newsletter CTA ── */}
        <section className="mt-24 bg-brand-navy rounded-[3rem] p-12 md:p-16 text-center">
          <p className="text-brand-primary text-[10px] uppercase tracking-[0.4em] font-black mb-4">Stay Inspired</p>
          <h2 className="text-3xl md:text-5xl font-serif font-black text-white mb-4">Never Miss a Journey</h2>
          <p className="text-white/50 max-w-xl mx-auto mb-8">Join thousands of travellers receiving our exclusive stories, guides, and early-access tour announcements.</p>
          <div className="max-w-md mx-auto">
            <SubscriptionForm source="blog-cta" title="" description="" buttonLabel="Subscribe to Blog" />
          </div>
        </section>
      </div>
    </div>
  );
}
