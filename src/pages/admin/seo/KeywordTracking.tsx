import { useState } from "react";
import { Plus, Trash2, Edit3, Target, X, Save } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../../lib/utils";

interface Keyword {
  _id: string;
  keyword: string;
  landingPage: string;
  targetUrl: string;
  status: string;
  notes: string;
}

interface Props {
  keywords: Keyword[];
  onRefresh: () => void;
}

const statusBadges: Record<string, { label: string; color: string }> = {
  optimized: { label: "Optimized", color: "bg-emerald-100 text-emerald-700" },
  needs_attention: { label: "Needs Attention", color: "bg-orange-100 text-orange-700" },
  missing_landing: { label: "Landing Page Missing", color: "bg-red-100 text-red-700" },
  needs_content: { label: "Needs Content", color: "bg-yellow-100 text-yellow-700" },
  missing_schema: { label: "Missing Schema", color: "bg-purple-100 text-purple-700" },
  missing_faq: { label: "Missing FAQ", color: "bg-blue-100 text-blue-700" },
  missing_links: { label: "Missing Internal Links", color: "bg-gray-200 text-gray-600" },
  missing_images: { label: "Missing Images", color: "bg-pink-100 text-pink-700" },
};

export default function KeywordTracking({ keywords, onRefresh }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ keyword: "", landingPage: "", targetUrl: "", status: "needs_attention", notes: "" });

  const token = localStorage.getItem("adminToken");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const handleAdd = async () => {
    if (!form.keyword.trim()) return;
    await fetch("/api/admin/seo/keywords", { method: "POST", headers, body: JSON.stringify(form) });
    setForm({ keyword: "", landingPage: "", targetUrl: "", status: "needs_attention", notes: "" });
    setShowAdd(false);
    onRefresh();
  };

  const handleUpdate = async (id: string) => {
    await fetch(`/api/admin/seo/keywords/${id}`, { method: "PUT", headers, body: JSON.stringify(form) });
    setEditingId(null);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this keyword?")) return;
    await fetch(`/api/admin/seo/keywords/${id}`, { method: "DELETE", headers });
    onRefresh();
  };

  const startEdit = (kw: Keyword) => {
    setEditingId(kw._id);
    setForm({ keyword: kw.keyword, landingPage: kw.landingPage || "", targetUrl: kw.targetUrl || "", status: kw.status || "needs_attention", notes: kw.notes || "" });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target size={16} className="text-brand-primary" />
            <div>
              <h3 className="text-sm font-bold text-gray-800">Keyword Tracking</h3>
              <p className="text-xs text-gray-500">{keywords.length} keywords tracked</p>
            </div>
          </div>
          <button
            onClick={() => { setShowAdd(true); setEditingId(null); setForm({ keyword: "", landingPage: "", targetUrl: "", status: "needs_attention", notes: "" }); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-xl text-[9px] uppercase tracking-widest font-black hover:bg-brand-accent transition-all"
          >
            <Plus size={12} /> Add Keyword
          </button>
        </div>

        {/* Add/Edit Form */}
        <AnimatePresence>
          {(showAdd || editingId) && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-gray-100">
              <div className="p-6 bg-brand-primary/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-800">{editingId ? "Edit Keyword" : "Add New Keyword"}</span>
                  <button onClick={() => { setShowAdd(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <input value={form.keyword} onChange={e => setForm({ ...form, keyword: e.target.value })} placeholder="Target Keyword" className="bg-white border border-gray-100 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-brand-primary" />
                  <input value={form.landingPage} onChange={e => setForm({ ...form, landingPage: e.target.value })} placeholder="Landing Page (e.g., /tours)" className="bg-white border border-gray-100 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-brand-primary" />
                  <input value={form.targetUrl} onChange={e => setForm({ ...form, targetUrl: e.target.value })} placeholder="Target URL Slug" className="bg-white border border-gray-100 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-brand-primary" />
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="bg-white border border-gray-100 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-brand-primary">
                    {Object.entries(statusBadges).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optional)" className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-brand-primary" />
                <div className="flex justify-end">
                  <button
                    onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                    className="flex items-center gap-1.5 px-6 py-2.5 bg-brand-primary text-white rounded-xl text-[9px] uppercase tracking-widest font-black hover:bg-brand-accent transition-all"
                  >
                    <Save size={12} /> {editingId ? "Update" : "Save"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400">Target Keyword</th>
                <th className="text-left px-4 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400">Landing Page</th>
                <th className="text-left px-4 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400">Target URL</th>
                <th className="text-left px-4 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400">Status</th>
                <th className="text-left px-4 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400">Notes</th>
                <th className="text-right px-4 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keywords.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No keywords tracked yet. Click "Add Keyword" to start.</td></tr>
              )}
              {keywords.map((kw) => {
                const badge = statusBadges[kw.status] || statusBadges.needs_attention;
                return (
                  <tr key={kw._id} className="border-b border-gray-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-bold text-gray-800 text-xs">{kw.keyword}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 font-mono">{kw.landingPage || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 font-mono">{kw.targetUrl || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded whitespace-nowrap", badge.color)}>{badge.label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[150px] truncate">{kw.notes || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => startEdit(kw)} className="p-1.5 text-gray-400 hover:text-brand-primary transition-colors"><Edit3 size={13} /></button>
                        <button onClick={() => handleDelete(kw._id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
