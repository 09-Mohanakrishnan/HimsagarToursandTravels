import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Save, Globe, Eye, ArrowLeft, Upload, X, Plus, Trash2,
  ChevronDown, Image as ImageIcon, Tag, Link as LinkIcon, Loader2,
  Star, StarOff, Check, FileEdit, Search, type LucideIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Blog, BlogCategory, BlogTag } from "../../../types";
import RichTextEditor from "../../../components/RichTextEditor";
import { cn } from "../../../lib/utils";

type Tab = "content" | "media" | "categorize" | "relations" | "publish";

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "content", label: "Content", icon: FileEdit },
  { id: "media", label: "Media", icon: ImageIcon },
  { id: "categorize", label: "Categorize", icon: Tag },
  { id: "relations", label: "Relations & FAQ", icon: LinkIcon },
  { id: "publish", label: "Publish", icon: Globe },
];

function slugify(text: string): string {
  return text.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function countWords(html: string): number {
  return html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
}

// ── Tag Combobox ──────────────────────────────────────────────────────────────
function TagSelector({ available, selected, onChange }: { available: BlogTag[]; selected: string[]; onChange: (ids: string[]) => void }) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = available.filter(t => t.name.toLowerCase().includes(input.toLowerCase()) && !selected.includes(t.id));
  const selectedTags = available.filter(t => selected.includes(t.id));

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map(tag => (
          <span key={tag.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-xl text-xs font-bold">
            #{tag.name}
            <button onClick={() => onChange(selected.filter(id => id !== tag.id))} className="hover:text-red-500 transition-colors"><X size={11} /></button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          type="text" placeholder="Search or type a tag..." value={input}
          onChange={e => setInput(e.target.value)} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 200)}
          className="w-full bg-slate-50 border border-gray-100 rounded-2xl py-3 px-4 outline-none focus:border-brand-primary transition-all text-sm text-gray-700"
        />
        {open && (filtered.length > 0 || input) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl z-20 overflow-hidden max-h-40 overflow-y-auto">
            {filtered.map(tag => (
              <button key={tag.id} onMouseDown={() => { onChange([...selected, tag.id]); setInput(""); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-gray-600 hover:bg-slate-50 transition-colors text-left">
                <Tag size={12} /> #{tag.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── FAQ Editor ────────────────────────────────────────────────────────────────
function FAQEditor({ faqs, onChange }: { faqs: { question: string; answer: string }[]; onChange: (faqs: { question: string; answer: string }[]) => void }) {
  const add = () => onChange([...faqs, { question: "", answer: "" }]);
  const remove = (i: number) => onChange(faqs.filter((_, idx) => idx !== i));
  const update = (i: number, field: "question" | "answer", value: string) => {
    const copy = [...faqs];
    copy[i] = { ...copy[i], [field]: value };
    onChange(copy);
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, i) => (
        <div key={i} className="bg-slate-50 border border-gray-100 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-black text-brand-primary">FAQ #{i + 1}</span>
            <button onClick={() => remove(i)} className="p-1.5 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
          </div>
          <input type="text" placeholder="Question" value={faq.question} onChange={e => update(i, "question", e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-4 text-sm text-gray-700 outline-none focus:border-brand-primary" />
          <textarea rows={3} placeholder="Answer" value={faq.answer} onChange={e => update(i, "answer", e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-4 text-sm text-gray-700 outline-none focus:border-brand-primary resize-none" />
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 text-sm font-black text-brand-primary hover:text-brand-accent transition-colors uppercase tracking-widest">
        <Plus size={14} /> Add FAQ
      </button>
    </div>
  );
}

// ── Image Upload Field ────────────────────────────────────────────────────────
function ImageUpload({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">{label}</label>
      <div className="flex gap-3">
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="Image URL or upload below..."
          className="flex-1 bg-slate-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm text-gray-700 outline-none focus:border-brand-primary transition-all" />
        <button onClick={() => ref.current?.click()} className="px-4 py-3 bg-slate-50 border border-gray-100 rounded-2xl text-sm text-gray-500 hover:border-brand-primary hover:text-brand-primary transition-all flex items-center gap-2">
          <Upload size={14} /> Upload
        </button>
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) onChange(URL.createObjectURL(e.target.files[0])); }} />
      </div>
      {value && (
        <div className="mt-3 relative w-40 h-28 rounded-2xl overflow-hidden border border-gray-100">
          <img src={value} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
          <button onClick={() => onChange("")} className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-lg text-gray-500 hover:text-red-500 transition-colors"><X size={12} /></button>
        </div>
      )}
    </div>
  );
}

// ── Publish Confirmation Modal ─────────────────────────────────────────────────
function PublishModal({ subscriberCount, onCancel, onPublishOnly, onPublishAndEmail, loading }: {
  subscriberCount: number; onCancel: () => void; onPublishOnly: () => void; onPublishAndEmail: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl">
        <button onClick={onCancel} className="absolute top-6 right-6 p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"><X size={16} /></button>
        <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-5"><Globe size={22} className="text-brand-primary" /></div>
        <h2 className="text-2xl font-serif font-black text-gray-900 mb-2">Ready to Publish?</h2>
        <p className="text-sm text-gray-500 mb-6">You have <span className="font-black text-gray-900">{subscriberCount} active subscriber{subscriberCount !== 1 ? "s" : ""}</span>. Would you like to send them a notification?</p>
        <div className="space-y-3">
          <button onClick={onPublishAndEmail} disabled={loading} className="w-full flex items-center justify-center gap-3 py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-accent transition-colors disabled:opacity-60">
            {loading ? <Loader2 size={14} className="animate-spin" /> : "✉️"} Publish & Notify Subscribers
          </button>
          <button onClick={onPublishOnly} disabled={loading} className="w-full flex items-center justify-center gap-3 py-4 bg-slate-50 border border-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white transition-colors disabled:opacity-60">
            Publish Only
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Blog Editor ──────────────────────────────────────────────────────────
export default function BlogEditor() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [activeTab, setActiveTab] = useState<Tab>("content");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [loadingPage, setLoadingPage] = useState(isEditing);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Gallery file input ref
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const featuredImageFileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    featuredImageFile: null as File | null,
    gallery: [] as string[],
    category: "",
    selectedTags: [] as string[],
    author: "Himsagar Travels",
    status: "draft" as "draft" | "published" | "archived",
    isFeatured: false,
    relatedTours: [] as string[],
    faq: [] as { question: string; answer: string }[],
  });
  const [slugEdited, setSlugEdited] = useState(false);

  const formRef = useRef(form);
  useEffect(() => { formRef.current = form; }, [form]);

  const token = () => localStorage.getItem("adminToken") || "";
  const authHeader = () => ({ Authorization: `Bearer ${token()}` });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load categories, tags, tours, stats
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/blog-categories", { headers: authHeader() }).then(r => r.json()),
      fetch("/api/admin/blog-tags", { headers: authHeader() }).then(r => r.json()),
      fetch("/api/admin/blogs/stats", { headers: authHeader() }).then(r => r.json()),
      fetch("/api/admin/events", { headers: authHeader() }).then(r => r.json()).catch(() => []),
    ]).then(([cats, tgs, stats, eventsData]) => {
      setCategories((cats || []).map((c: any) => ({ ...c, id: c._id || c.id })));
      setTags((tgs || []).map((t: any) => ({ ...t, id: t._id || t.id })));
      setSubscriberCount(stats?.subscribers || 0);
      const evArr = Array.isArray(eventsData) ? eventsData : (eventsData?.events || []);
      setTours(evArr.map((e: any) => ({ ...e, id: e._id || e.id })));
    }).catch(() => {});
  }, []);

  // Load existing blog if editing
  useEffect(() => {
    if (!isEditing || !id) return;
    fetch(`/api/admin/blogs/${id}`, { headers: authHeader() }).then(r => r.json()).then((data: any) => {
      setForm({
        title: data.title || "",
        slug: data.slug || "",
        excerpt: data.excerpt || "",
        content: data.content || "",
        featuredImage: data.featuredImage || "",
        featuredImageFile: null,
        gallery: data.gallery || [],
        category: typeof data.category === "object" ? (data.category?._id || data.category?.id || "") : (data.category || ""),
        selectedTags: (data.tags || []).map((t: any) => (typeof t === "object" ? (t._id || t.id) : t)),
        author: data.author || "Himsagar Travels",
        status: data.status || "draft",
        isFeatured: data.isFeatured || false,
        relatedTours: (data.relatedTours || []).map((t: any) => (typeof t === "object" ? (t._id || t.id) : t)),
        faq: data.faq || [],
      });
      setSlugEdited(true);
    }).catch(() => showToast("Failed to load blog", "error"))
    .finally(() => setLoadingPage(false));
  }, [id]);

  // Auto-Save Effect
  useEffect(() => {
    const interval = setInterval(async () => {
      const currentForm = formRef.current;
      // Skip if missing required title or already saving/publishing
      if (!currentForm.title.trim() || saving || publishing) return;

      try {
        const fd = new FormData();
        fd.append("title", currentForm.title);
        fd.append("slug", currentForm.slug);
        fd.append("excerpt", currentForm.excerpt);
        fd.append("content", currentForm.content);
        if (currentForm.featuredImageFile) fd.append("featuredImageFile", currentForm.featuredImageFile);
        else fd.append("featuredImage", currentForm.featuredImage);
        fd.append("gallery", JSON.stringify(currentForm.gallery));
        fd.append("category", currentForm.category);
        fd.append("tags", JSON.stringify(currentForm.selectedTags));
        fd.append("author", currentForm.author);
        fd.append("status", currentForm.status);
        fd.append("isFeatured", String(currentForm.isFeatured));
        fd.append("relatedTours", JSON.stringify(currentForm.relatedTours));
        fd.append("faq", JSON.stringify(currentForm.faq));

        const url = isEditing ? `/api/admin/blogs/${id}` : "/api/admin/blogs";
        const method = isEditing ? "PUT" : "POST";
        const res = await fetch(url, { method, headers: authHeader(), body: fd });
        
        if (res.ok && !isEditing) {
          const saved = await res.json();
          if (saved._id || saved.id) {
            localStorage.removeItem("draft_blog_new");
            navigate(`/admin/blog/edit/${saved._id || saved.id}`, { replace: true });
          }
        }
      } catch (e) {
        // Silent fail for auto-save
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [saving, publishing, isEditing, id, navigate]);

  // Draft Recovery for new posts
  useEffect(() => {
    if (!isEditing) {
      const draftStr = localStorage.getItem("draft_blog_new");
      if (draftStr) {
        try {
          const parsed = JSON.parse(draftStr);
          if (parsed.title || parsed.content) {
            if (window.confirm("You have an unsaved draft. Do you want to recover it?")) {
              setForm(f => ({ ...f, ...parsed, status: "draft" }));
              setSlugEdited(true);
            } else {
              localStorage.removeItem("draft_blog_new");
            }
          }
        } catch(e){}
      }
    }
  }, [isEditing]);

  // Save to local storage continuously for new drafts
  useEffect(() => {
    if (!isEditing && (form.title || form.content)) {
      localStorage.setItem("draft_blog_new", JSON.stringify(form));
    }
  }, [form, isEditing]);

  const setField = (key: keyof typeof form, value: any) => setForm(f => ({ ...f, [key]: value }));

  const onTitleChange = (title: string) => {
    setField("title", title);
    if (!slugEdited) setField("slug", slugify(title));
  };

  const wordCount = countWords(form.content);
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("slug", form.slug);
    fd.append("excerpt", form.excerpt);
    fd.append("content", form.content);
    if (form.featuredImageFile) {
      fd.append("featuredImageFile", form.featuredImageFile);
    } else {
      fd.append("featuredImage", form.featuredImage);
    }
    fd.append("gallery", JSON.stringify(form.gallery));
    fd.append("category", form.category);
    fd.append("tags", JSON.stringify(form.selectedTags));
    fd.append("author", form.author);
    fd.append("status", form.status);
    fd.append("isFeatured", String(form.isFeatured));
    fd.append("relatedTours", JSON.stringify(form.relatedTours));
    fd.append("faq", JSON.stringify(form.faq));
    return fd;
  };

  const save = async (asPublished = false) => {
    if (!form.title.trim()) { showToast("Title is required", "error"); setActiveTab("content"); return; }
    setSaving(true);
    try {
      const fd = buildFormData();
      if (asPublished) fd.set("status", "published");

      const url = isEditing ? `/api/admin/blogs/${id}` : "/api/admin/blogs";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: authHeader(), body: fd });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed");
      const saved = await res.json();
      showToast(isEditing ? "Blog updated!" : "Blog created!");
      if (!isEditing) navigate(`/admin/blog/edit/${saved._id || saved.id}`, { replace: true });
      else setForm(f => ({ ...f, status: saved.status || f.status }));
    } catch (err: any) {
      showToast(err.message || "Failed to save", "error");
    } finally { setSaving(false); }
  };

  const publishWithEmail = async (sendEmail: boolean) => {
    setPublishing(true);
    try {
      // First save the latest content
      const fd = buildFormData();
      const saveUrl = isEditing ? `/api/admin/blogs/${id}` : "/api/admin/blogs";
      const saveMethod = isEditing ? "PUT" : "POST";
      const saveRes = await fetch(saveUrl, { method: saveMethod, headers: authHeader(), body: fd });
      if (!saveRes.ok) throw new Error("Save failed");
      const saved = await saveRes.json();
      const blogId = id || saved._id || saved.id;

      // Then publish
      const res = await fetch(`/api/admin/blogs/${blogId}/publish`, {
        method: "POST",
        headers: { ...authHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ sendEmail }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Publish failed");
      showToast(sendEmail ? "Published & email notification queued!" : "Blog published!");
      setShowPublishModal(false);
      setField("status", "published");
      if (!isEditing) navigate(`/admin/blog/edit/${blogId}`, { replace: true });
    } catch (err: any) {
      showToast(err.message || "Publish failed", "error");
    } finally { setPublishing(false); }
  };

  if (loadingPage) {
    return (
      <div className="space-y-4 animate-pulse pt-8">
        <div className="h-8 bg-gray-100 rounded-2xl w-48" />
        <div className="h-12 bg-gray-100 rounded-3xl" />
        <div className="h-64 bg-gray-100 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <AnimatePresence>
        {showPublishModal && (
          <PublishModal
            subscriberCount={subscriberCount}
            onCancel={() => setShowPublishModal(false)}
            onPublishOnly={() => publishWithEmail(false)}
            onPublishAndEmail={() => publishWithEmail(true)}
            loading={publishing}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex items-center gap-4">
          <Link to="/admin/blog" className="p-2.5 rounded-2xl bg-slate-50 border border-gray-100 text-gray-400 hover:text-brand-primary hover:border-brand-primary transition-all">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-black text-gray-900">{isEditing ? "Edit Blog" : "Create Blog"}</h1>
            {form.status && (
              <span className={cn("text-[9px] uppercase tracking-widest font-black px-3 py-0.5 rounded-full border", form.status === "published" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : form.status === "draft" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-gray-100 text-gray-400")}>
                {form.status}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {form.status === "published" && (
            <a href={`/blog/${form.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-3 bg-slate-50 text-gray-500 rounded-2xl border border-gray-100 hover:text-brand-primary text-sm transition-all">
              <Eye size={14} /> Preview
            </a>
          )}
          <button onClick={() => save()} disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:border-brand-primary hover:text-brand-primary transition-all disabled:opacity-60">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save Draft
          </button>
          {form.status !== "published" ? (
            <button onClick={() => setShowPublishModal(true)} disabled={saving || publishing}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-accent transition-colors shadow-lg shadow-brand-primary/20 disabled:opacity-60">
              <Globe size={13} /> Publish
            </button>
          ) : (
            <button onClick={() => save()} disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-accent transition-colors shadow-lg shadow-brand-primary/20 disabled:opacity-60">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Update
            </button>
          )}
        </div>
      </div>

      {/* Word count bar */}
      <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest font-black text-gray-300">
        <span>{wordCount} words</span>
        <span>{readingTime} min read</span>
        {form.slug && <span className="text-gray-200">/{form.slug}</span>}
      </div>

      <div className="flex gap-6 items-start">
        {/* Tab Navigation */}
        <nav className="shrink-0 w-44 space-y-1 sticky top-24">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left", activeTab === tab.id ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "text-gray-400 hover:bg-slate-50 hover:text-gray-600")}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab Panels */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>

              {/* ── Content Tab ── */}
              {activeTab === "content" && (
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">Title *</label>
                    <input type="text" value={form.title} onChange={e => onTitleChange(e.target.value)} placeholder="Enter a compelling blog title..."
                      className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-5 text-lg font-bold text-gray-800 outline-none focus:border-brand-primary transition-all shadow-sm" />
                  </div>
                  {/* Slug */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">URL Slug</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-300 shrink-0">/blog/</span>
                      <input type="text" value={form.slug} onChange={e => { setField("slug", e.target.value); setSlugEdited(true); }} placeholder="url-slug"
                        className="flex-1 bg-slate-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm text-gray-600 outline-none focus:border-brand-primary font-mono transition-all" />
                    </div>
                  </div>
                  {/* Author */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">Author</label>
                    <input type="text" value={form.author} onChange={e => setField("author", e.target.value)} placeholder="Himsagar Travels"
                      className="w-full bg-slate-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm text-gray-700 outline-none focus:border-brand-primary transition-all" />
                  </div>
                  {/* Excerpt */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">
                      Excerpt <span className="text-gray-300 ml-1">({form.excerpt.length}/300)</span>
                    </label>
                    <textarea rows={3} value={form.excerpt} onChange={e => setField("excerpt", e.target.value)} maxLength={300}
                      placeholder="Write a short, enticing excerpt (shown in blog listings)..."
                      className="w-full bg-slate-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm text-gray-700 outline-none focus:border-brand-primary transition-all resize-none" />
                  </div>
                  {/* Content */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">Content</label>
                    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <RichTextEditor
                        value={form.content}
                        onChange={html => setField("content", html)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Media Tab ── */}
              {activeTab === "media" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-[10px] uppercase tracking-widest font-black text-brand-primary mb-4">Featured Image</h3>
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                      <ImageUpload
                        label="Featured Image URL"
                        value={form.featuredImage}
                        onChange={url => setField("featuredImage", url)}
                      />
                      <div className="mt-4">
                        <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">Or Upload from Computer</label>
                        <input ref={featuredImageFileRef} type="file" accept="image/*" className="hidden"
                          onChange={e => { if (e.target.files?.[0]) { const f = e.target.files[0]; setField("featuredImageFile", f); setField("featuredImage", URL.createObjectURL(f)); } }} />
                        <button onClick={() => featuredImageFileRef.current?.click()} className="flex items-center gap-2 px-5 py-3 bg-slate-50 border border-gray-100 rounded-2xl text-sm text-gray-500 hover:border-brand-primary hover:text-brand-primary transition-all">
                          <Upload size={14} /> Upload Featured Image
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] uppercase tracking-widest font-black text-brand-primary mb-4">Gallery</h3>
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                      {form.gallery.map((url, i) => (
                        <div key={i} className="flex gap-3 items-center">
                          <div className="w-16 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                            <img src={url} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                          </div>
                          <input type="text" value={url} onChange={e => { const g = [...form.gallery]; g[i] = e.target.value; setField("gallery", g); }}
                            className="flex-1 bg-slate-50 border border-gray-100 rounded-xl py-2.5 px-3 text-sm text-gray-600 outline-none focus:border-brand-primary" />
                          <button onClick={() => setField("gallery", form.gallery.filter((_, idx) => idx !== i))} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      ))}
                      <button onClick={() => setField("gallery", [...form.gallery, ""])} className="flex items-center gap-2 text-sm font-black text-brand-primary hover:text-brand-accent transition-colors uppercase tracking-widest">
                        <Plus size={14} /> Add Image URL
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Categorize Tab ── */}
              {activeTab === "categorize" && (
                <div className="space-y-6 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">Category</label>
                    <div className="flex gap-3 items-center">
                      <select value={form.category} onChange={e => setField("category", e.target.value)}
                        className="flex-1 bg-slate-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm text-gray-700 outline-none focus:border-brand-primary">
                        <option value="">No Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <Link to="/admin/blog/categories" className="px-4 py-3 bg-slate-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-500 hover:text-brand-primary transition-colors shrink-0">
                        Manage
                      </Link>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">Tags</label>
                    <TagSelector available={tags} selected={form.selectedTags} onChange={ids => setField("selectedTags", ids)} />
                  </div>
                </div>
              )}

              {/* ── Relations & FAQ Tab ── */}
              {activeTab === "relations" && (
                <div className="space-y-8">
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-[10px] uppercase tracking-widest font-black text-brand-primary mb-5">Related Tour Packages</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {tours.map(tour => (
                        <label key={tour.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                          <input type="checkbox" checked={form.relatedTours.includes(tour.id)}
                            onChange={e => { const ids = e.target.checked ? [...form.relatedTours, tour.id] : form.relatedTours.filter(id => id !== tour.id); setField("relatedTours", ids); }}
                            className="w-4 h-4 accent-brand-primary rounded" />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-700 truncate">{tour.title}</p>
                            <p className="text-[10px] text-gray-400">{tour.category} — {tour.location}</p>
                          </div>
                        </label>
                      ))}
                      {tours.length === 0 && <p className="text-sm text-gray-300 text-center py-6">No tour packages found.</p>}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-[10px] uppercase tracking-widest font-black text-brand-primary mb-5">FAQ Section</h3>
                    <FAQEditor faqs={form.faq} onChange={faqs => setField("faq", faqs)} />
                  </div>
                </div>
              )}

              {/* ── Publish Tab ── */}
              {activeTab === "publish" && (
                <div className="space-y-6 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">Status</label>
                    <div className="flex gap-3">
                      {(["draft", "published", "archived"] as const).map(s => (
                        <button key={s} onClick={() => setField("status", s)}
                          className={cn("px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all", form.status === s ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20" : "bg-slate-50 text-gray-400 border-gray-100 hover:border-brand-primary hover:text-brand-primary")}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-gray-100">
                    <button onClick={() => setField("isFeatured", !form.isFeatured)} className={cn("w-5 h-5 rounded-md border flex items-center justify-center transition-all", form.isFeatured ? "bg-brand-primary border-brand-primary" : "border-gray-200")}>
                      {form.isFeatured && <Check size={11} className="text-white" />}
                    </button>
                    <div>
                      <p className="text-sm font-bold text-gray-700">Mark as Featured</p>
                      <p className="text-xs text-gray-400">Featured posts appear prominently on the blog homepage.</p>
                    </div>
                    {form.isFeatured ? <Star size={16} className="text-brand-primary ml-auto" /> : <StarOff size={16} className="text-gray-300 ml-auto" />}
                  </div>

                  <div className="pt-4 flex flex-col gap-3">
                    <button onClick={() => setShowPublishModal(true)} className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-brand-accent transition-colors shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-3">
                      <Globe size={16} /> {form.status === "published" ? "Update Published Blog" : "Publish Blog"}
                    </button>
                    <button onClick={() => save()} disabled={saving} className="w-full py-4 bg-slate-50 border border-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white transition-colors flex items-center justify-center gap-3">
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save as Draft
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
