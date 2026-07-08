import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit2, Trash2, ArrowLeft, Check, X, Loader2, Tag } from "lucide-react";
import { BlogCategory } from "../../../types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../../lib/utils";

const PRESET_COLORS = ["#c29d44", "#0f172a", "#16a34a", "#dc2626", "#2563eb", "#7c3aed", "#ea580c", "#0891b2"];

function CategoryForm({ initial, onSave, onCancel, loading }: {
  initial?: Partial<BlogCategory>; onSave: (data: any) => void; onCancel: () => void; loading: boolean;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [color, setColor] = useState(initial?.color || "#c29d44");

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
      className="bg-white border border-brand-primary/20 rounded-3xl p-6 shadow-lg space-y-4">
      <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">{initial?.id ? "Edit Category" : "New Category"}</h3>
      <div>
        <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1.5">Name *</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Spiritual Journeys"
          className="w-full bg-slate-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm text-gray-700 outline-none focus:border-brand-primary" />
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1.5">Description</label>
        <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..."
          className="w-full bg-slate-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm text-gray-700 outline-none focus:border-brand-primary resize-none" />
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">Color</label>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} style={{ background: c }}
              className={cn("w-8 h-8 rounded-xl transition-all", color === c ? "ring-2 ring-offset-2 ring-brand-primary scale-110" : "hover:scale-105")}>
              {color === c && <Check size={14} className="text-white mx-auto" />}
            </button>
          ))}
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded-xl overflow-hidden cursor-pointer border border-gray-100" title="Custom color" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={() => onSave({ name, description, color })} disabled={!name.trim() || loading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-accent transition-colors disabled:opacity-60">
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save
        </button>
        <button onClick={onCancel} className="px-6 py-3 bg-slate-50 text-gray-500 rounded-2xl text-xs font-bold hover:bg-white transition-colors">Cancel</button>
      </div>
    </motion.div>
  );
}

export default function BlogCategories() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const token = () => localStorage.getItem("adminToken") || "";
  const authHeader = () => ({ Authorization: `Bearer ${token()}` });
  const showToast = (msg: string, type: "success" | "error" = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog-categories", { headers: authHeader() });
      const data = await res.json();
      setCategories((data || []).map((c: any) => ({ ...c, id: c._id || c.id })));
    } catch { showToast("Failed to load categories", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async (data: any) => {
    setFormLoading(true);
    try {
      const res = await fetch("/api/admin/blog-categories", { method: "POST", headers: { ...authHeader(), "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error((await res.json()).error);
      showToast("Category created!");
      setShowNewForm(false);
      fetchCategories();
    } catch (err: any) { showToast(err.message || "Failed to create", "error"); }
    finally { setFormLoading(false); }
  };

  const handleUpdate = async (id: string, data: any) => {
    setFormLoading(true);
    try {
      const res = await fetch(`/api/admin/blog-categories/${id}`, { method: "PUT", headers: { ...authHeader(), "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error((await res.json()).error);
      showToast("Category updated!");
      setEditingId(null);
      fetchCategories();
    } catch (err: any) { showToast(err.message || "Failed to update", "error"); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? All posts in this category will become uncategorized.`)) return;
    try {
      await fetch(`/api/admin/blog-categories/${id}`, { method: "DELETE", headers: authHeader() });
      showToast("Category deleted");
      fetchCategories();
    } catch { showToast("Delete failed", "error"); }
  };

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={cn("fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-3", toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
            {toast.type === "success" ? <Check size={14} /> : <X size={14} />} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/blog" className="p-2.5 rounded-2xl bg-slate-50 border border-gray-100 text-gray-400 hover:text-brand-primary hover:border-brand-primary transition-all">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-3xl font-serif font-black text-gray-900">Blog Categories</h1>
            <p className="text-sm text-gray-400 mt-0.5">{categories.length} categories</p>
          </div>
        </div>
        <button onClick={() => { setShowNewForm(true); setEditingId(null); }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-accent transition-colors shadow-lg shadow-brand-primary/20">
          <Plus size={14} /> New Category
        </button>
      </div>

      {/* New form */}
      <AnimatePresence>
        {showNewForm && (
          <CategoryForm loading={formLoading} onSave={handleCreate} onCancel={() => setShowNewForm(false)} />
        )}
      </AnimatePresence>

      {/* Category List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-3xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center">
          <Tag size={40} className="text-gray-200 mb-4 mx-auto" />
          <p className="text-xl font-serif text-gray-400 mb-2">No categories yet</p>
          <p className="text-sm text-gray-300 mb-6">Create your first category to organise your blog posts.</p>
          <button onClick={() => setShowNewForm(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-accent transition-colors">
            <Plus size={14} /> Create Category
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <AnimatePresence mode="wait">
                {editingId === cat.id ? (
                  <CategoryForm
                    key="edit"
                    initial={cat}
                    loading={formLoading}
                    onSave={data => handleUpdate(cat.id, data)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div key="view" className="bg-white border border-gray-100 rounded-3xl p-5 flex items-center gap-5 hover:shadow-md transition-all">
                    <div className="w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center text-white font-black text-sm" style={{ background: cat.color || "#c29d44" }}>
                      {cat.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-gray-800">{cat.name}</p>
                        <span className="text-[9px] bg-slate-100 text-gray-400 px-2.5 py-1 rounded-full font-bold">{cat.postCount || 0} posts</span>
                      </div>
                      {cat.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{cat.description}</p>}
                      <p className="text-[9px] text-gray-300 font-mono mt-1">/blog/category/{cat.slug}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => { setEditingId(cat.id); setShowNewForm(false); }}
                        className="p-2.5 rounded-xl bg-slate-50 text-gray-400 hover:bg-white hover:text-brand-primary border border-transparent hover:border-gray-100 transition-all">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-2.5 rounded-xl bg-slate-50 text-gray-400 hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-100 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
