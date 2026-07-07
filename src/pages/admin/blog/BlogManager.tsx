import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus, Search, RefreshCw, Edit2, Trash2, Eye, Copy, Archive,
  Globe, FileText, MoreVertical, CheckSquare, Square, ChevronLeft,
  ChevronRight, Send, X, Check, Loader2
} from "lucide-react";
import { Blog, BlogCategory } from "../../../types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../../lib/utils";

type StatusFilter = "all" | "draft" | "published" | "archived";

const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-600 border-emerald-100",
  draft: "bg-amber-50 text-amber-600 border-amber-100",
  archived: "bg-gray-100 text-gray-400 border-gray-200",
};

// ── Publish Confirmation Modal ────────────────────────────────────────────────
function PublishModal({
  blog,
  subscriberCount,
  onCancel,
  onPublishOnly,
  onPublishAndEmail,
  loading,
}: {
  blog: Blog;
  subscriberCount: number;
  onCancel: () => void;
  onPublishOnly: () => void;
  onPublishAndEmail: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white rounded-[2.5rem] p-8 md:p-10 w-full max-w-md shadow-2xl"
      >
        <button onClick={onCancel} className="absolute top-6 right-6 p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
          <X size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-6">
          <Globe size={22} className="text-brand-primary" />
        </div>
        <h2 className="text-2xl font-serif font-black text-gray-900 mb-2">Publish Blog</h2>
        <p className="text-sm text-gray-500 mb-2">
          <span className="font-bold text-gray-700">"{blog.title}"</span>
        </p>
        <div className="bg-slate-50 rounded-2xl p-4 mb-8 border border-gray-100">
          <p className="text-xs text-gray-500 leading-relaxed">
            You have <span className="font-black text-gray-900">{subscriberCount} active subscriber{subscriberCount !== 1 ? "s" : ""}</span>.
            Would you like to notify them about this new article?
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={onPublishAndEmail}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-accent transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Publish & Notify Subscribers
          </button>
          <button
            onClick={onPublishOnly}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 bg-slate-50 border border-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white hover:text-brand-primary transition-colors disabled:opacity-60"
          >
            <Globe size={14} /> Publish Only
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function BlogManager() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [publishTarget, setPublishTarget] = useState<Blog | null>(null);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [publishLoading, setPublishLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0, archived: 0 });
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const token = () => localStorage.getItem("adminToken") || "";

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const authHeader = () => ({ Authorization: `Bearer ${token()}` });

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/blogs?${params}`, { headers: authHeader() });
      if (res.status === 401 || res.status === 403) { localStorage.removeItem("adminToken"); window.location.href = "/admin/login"; return; }
      const data = await res.json();
      setBlogs((data.blogs || []).map((b: any) => ({ ...b, id: b._id || b.id })));
      setTotal(data.total || 0);
      setTotalPages(data.pages || 1);
    } catch { showToast("Failed to load blogs", "error"); }
    finally { setLoading(false); }
  }, [page, statusFilter, categoryFilter, search]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/blog-categories", { headers: authHeader() }).then(r => r.json()),
      fetch("/api/admin/blogs/stats", { headers: authHeader() }).then(r => r.json()),
    ]).then(([cats, statsData]) => {
      setCategories((cats || []).map((c: any) => ({ ...c, id: c._id || c.id })));
      setStats(statsData);
      setSubscriberCount(statsData.subscribers || 0);
    }).catch(() => {});
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/admin/blogs/${id}`, { method: "DELETE", headers: authHeader() });
      showToast("Blog deleted");
      fetchBlogs();
    } catch { showToast("Delete failed", "error"); }
    setActionMenuId(null);
  };

  const handleAction = async (action: string, id: string) => {
    setActionMenuId(null);
    try {
      const res = await fetch(`/api/admin/blogs/${id}/${action}`, { method: "POST", headers: { ...authHeader(), "Content-Type": "application/json" }, body: JSON.stringify({}) });
      if (!res.ok) throw new Error();
      showToast(`Blog ${action}d`);
      fetchBlogs();
    } catch { showToast(`Failed to ${action} blog`, "error"); }
  };

  const handlePublish = (blog: Blog) => {
    setPublishTarget(blog);
    setActionMenuId(null);
  };

  const executePublish = async (sendEmail: boolean) => {
    if (!publishTarget) return;
    setPublishLoading(true);
    try {
      const res = await fetch(`/api/admin/blogs/${publishTarget.id}/publish`, {
        method: "POST",
        headers: { ...authHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ sendEmail }),
      });
      if (!res.ok) throw new Error();
      showToast(sendEmail ? "Published & notification queued!" : "Blog published!");
      setPublishTarget(null);
      fetchBlogs();
    } catch { showToast("Failed to publish blog", "error"); }
    finally { setPublishLoading(false); }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    if (action === "delete" && !confirm(`Delete ${ids.length} blog(s)?`)) return;
    try {
      await fetch("/api/admin/blogs/bulk", {
        method: "POST",
        headers: { ...authHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids }),
      });
      showToast(`Bulk ${action} done`);
      setSelectedIds(new Set());
      fetchBlogs();
    } catch { showToast("Bulk action failed", "error"); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === blogs.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(blogs.map(b => b.id)));
  };

  const STATUS_TABS: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: stats.total },
    { key: "published", label: "Published", count: stats.published },
    { key: "draft", label: "Drafts", count: stats.drafts },
    { key: "archived", label: "Archived", count: stats.archived },
  ];

  return (
    <div className="space-y-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={cn("fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-3", toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
            {toast.type === "success" ? <Check size={14} /> : <X size={14} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Publish Modal */}
      <AnimatePresence>
        {publishTarget && (
          <PublishModal
            blog={publishTarget}
            subscriberCount={subscriberCount}
            onCancel={() => setPublishTarget(null)}
            onPublishOnly={() => executePublish(false)}
            onPublishAndEmail={() => executePublish(true)}
            loading={publishLoading}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-serif font-black text-gray-900">Blog Management</h1>
          <p className="text-sm text-gray-400 mt-1">{total} article{total !== 1 ? "s" : ""} total</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchBlogs} className="inline-flex items-center gap-2 px-5 py-3 bg-slate-50 text-gray-500 rounded-2xl border border-slate-100 hover:bg-white hover:text-brand-primary transition-all text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          <Link to="/admin/blog/categories" className="inline-flex items-center gap-2 px-5 py-3 bg-slate-50 text-gray-500 rounded-2xl border border-slate-100 hover:bg-white hover:text-brand-primary transition-all text-sm">
            Categories
          </Link>
          <Link to="/admin/blog/new" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-accent transition-colors shadow-lg shadow-brand-primary/20">
            <Plus size={14} /> New Blog
          </Link>
        </div>
      </div>

      {/* Stats Tabs */}
      <div className="flex gap-2 border-b border-gray-100 pb-1">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setStatusFilter(tab.key); setPage(1); }}
            className={cn("px-5 py-2.5 rounded-t-2xl text-xs font-black uppercase tracking-widest transition-all", statusFilter === tab.key ? "bg-white border border-b-white border-gray-100 text-brand-primary -mb-px" : "text-gray-400 hover:text-gray-600")}
          >
            {tab.label} {tab.count > 0 && <span className={cn("ml-1.5 px-2 py-0.5 rounded-full text-[9px]", statusFilter === tab.key ? "bg-brand-primary/10 text-brand-primary" : "bg-gray-100 text-gray-400")}>{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          {/* Category filter */}
          <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-gray-100 rounded-2xl py-2.5 px-4 text-sm text-gray-600 outline-none focus:border-brand-primary">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl px-4 py-2">
              <span className="text-xs font-black text-brand-primary">{selectedIds.size} selected</span>
              <button onClick={() => handleBulkAction("publish")} className="text-xs font-bold text-emerald-600 hover:underline">Publish</button>
              <button onClick={() => handleBulkAction("unpublish")} className="text-xs font-bold text-amber-600 hover:underline">Unpublish</button>
              <button onClick={() => handleBulkAction("delete")} className="text-xs font-bold text-red-500 hover:underline">Delete</button>
              <button onClick={() => setSelectedIds(new Set())} className="p-1 hover:text-gray-500 text-gray-300"><X size={12} /></button>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
          <input type="text" placeholder="Search blogs..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-50 border border-gray-100 rounded-2xl py-2.5 pl-10 pr-4 outline-none focus:border-brand-primary text-sm text-gray-700 transition-all" />
        </div>
      </div>

      {/* Blog List */}
      <div className="space-y-3">
        {/* Select all row */}
        {blogs.length > 0 && (
          <div className="flex items-center gap-3 px-2">
            <button onClick={toggleSelectAll} className="text-gray-300 hover:text-brand-primary transition-colors">
              {selectedIds.size === blogs.length ? <CheckSquare size={16} className="text-brand-primary" /> : <Square size={16} />}
            </button>
            <span className="text-xs text-gray-300 uppercase tracking-widest font-bold">Select all on page</span>
          </div>
        )}

        {loading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-3xl bg-gray-100 animate-pulse" />)
        ) : blogs.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center">
            <p className="text-5xl mb-4">📝</p>
            <p className="text-xl font-serif text-gray-400">No blogs found</p>
            <p className="text-sm text-gray-300 mt-1 mb-6">Create your first article to get started.</p>
            <Link to="/admin/blog/new" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-accent transition-colors">
              <Plus size={14} /> Create Blog
            </Link>
          </div>
        ) : (
          blogs.map((blog, i) => {
            const category = typeof blog.category === "object" ? blog.category as BlogCategory : null;
            const publishedDate = blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

            return (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={cn("bg-white border rounded-3xl p-5 flex gap-4 items-start hover:shadow-md transition-all", selectedIds.has(blog.id) ? "border-brand-primary/30 bg-brand-primary/5" : "border-gray-100")}
              >
                {/* Checkbox */}
                <button onClick={() => toggleSelect(blog.id)} className="text-gray-300 hover:text-brand-primary transition-colors mt-1 shrink-0">
                  {selectedIds.has(blog.id) ? <CheckSquare size={16} className="text-brand-primary" /> : <Square size={16} />}
                </button>

                {/* Thumbnail */}
                <div className="w-20 h-16 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                  {blog.featuredImage ? <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📝</div>}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 flex-wrap mb-1.5">
                    <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-1 flex-1">{blog.title}</h3>
                    <span className={cn("px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0", STATUS_STYLES[blog.status] || "")}>
                      {blog.status}
                    </span>
                    {blog.isFeatured && <span className="px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary border border-brand-primary/20">Featured</span>}
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1 mb-2">{blog.excerpt}</p>
                  <div className="flex items-center gap-4 text-[10px] text-gray-300 uppercase tracking-widest font-bold">
                    {category && <span style={{ color: category.color || "#c29d44" }}>{category.name}</span>}
                    <span>By {blog.author}</span>
                    <span>{publishedDate}</span>
                    <span>{blog.views || 0} views</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {blog.status === "draft" && (
                    <button onClick={() => handlePublish(blog)} title="Publish" className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                      <Globe size={14} />
                    </button>
                  )}
                  <Link to={`/admin/blog/edit/${blog.id}`} title="Edit" className="p-2 rounded-xl bg-slate-50 text-gray-400 hover:bg-white hover:text-brand-primary border border-transparent hover:border-gray-100 transition-all">
                    <Edit2 size={14} />
                  </Link>
                  <div className="relative">
                    <button onClick={() => setActionMenuId(actionMenuId === blog.id ? null : blog.id)} className="p-2 rounded-xl bg-slate-50 text-gray-400 hover:bg-white hover:text-gray-600 border border-transparent hover:border-gray-100 transition-all">
                      <MoreVertical size={14} />
                    </button>
                    <AnimatePresence>
                      {actionMenuId === blog.id && (
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl border border-gray-100 shadow-xl z-20 overflow-hidden">
                          <button onClick={() => window.open(`/blog/${blog.slug}`, "_blank")} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-gray-600 hover:bg-slate-50 transition-colors">
                            <Eye size={13} /> Preview
                          </button>
                          <button onClick={() => { navigate(`/admin/blog/edit/${blog.id}`); setActionMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-gray-600 hover:bg-slate-50 transition-colors">
                            <Edit2 size={13} /> Edit
                          </button>
                          <button onClick={() => handleAction("duplicate", blog.id)} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-gray-600 hover:bg-slate-50 transition-colors">
                            <Copy size={13} /> Duplicate
                          </button>
                          {blog.status === "draft" && (
                            <button onClick={() => handlePublish(blog)} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-emerald-600 hover:bg-emerald-50 transition-colors">
                              <Globe size={13} /> Publish
                            </button>
                          )}
                          {blog.status === "published" && (
                            <button onClick={() => handleAction("unpublish", blog.id)} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-amber-600 hover:bg-amber-50 transition-colors">
                              <FileText size={13} /> Unpublish
                            </button>
                          )}
                          <button onClick={() => handleAction("archive", blog.id)} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-gray-400 hover:bg-slate-50 transition-colors">
                            <Archive size={13} /> Archive
                          </button>
                          <div className="border-t border-gray-100" />
                          <button onClick={() => handleDelete(blog.id, blog.title)} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={13} /> Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-3 rounded-2xl bg-slate-50 border border-gray-100 text-gray-400 hover:text-brand-primary disabled:opacity-30 transition-all">
            <ChevronLeft size={14} />
          </button>
          <span className="text-sm text-gray-500 font-bold">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-3 rounded-2xl bg-slate-50 border border-gray-100 text-gray-400 hover:text-brand-primary disabled:opacity-30 transition-all">
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
