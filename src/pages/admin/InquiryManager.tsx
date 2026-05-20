import { useState, useEffect } from "react";
import { MessageSquare, Phone, Mail, Clock, CheckSquare, Search, X, RefreshCw } from "lucide-react";
import { Inquiry } from "../../types";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

export default function InquiryManager() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => { fetchInquiries(); }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch("/api/admin/inquiries", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("adminToken");
        window.location.href = "/admin/login";
        return;
      }
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      // Normalize _id -> id for MongoDB documents
      setInquiries(data.map((i: any) => ({ ...i, id: i._id || i.id })));
    } catch (err) {
      console.error("Failed to fetch inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdating(id);
    const token = localStorage.getItem("adminToken");
    try {
      // Correct endpoint: PUT /api/admin/inquiries/:id (not PATCH .../status)
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("adminToken");
        window.location.href = "/admin/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to update");
      await fetchInquiries();
    } catch (err) {
      alert("Failed to update status. Please try again.");
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const filteredInquiries = inquiries.filter(i => {
    const matchesFilter = filter === "all" || i.status === filter;
    const matchesSearch =
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.event_title || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusColors: Record<string, string> = {
    pending: "bg-orange-50 text-orange-600 border-orange-200",
    reviewed: "bg-blue-50 text-blue-600 border-blue-200",
    contacted: "bg-emerald-50 text-emerald-600 border-emerald-200",
    closed: "bg-gray-100 text-gray-500 border-gray-200",
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex bg-slate-50 p-1 rounded-xl border border-gray-100 gap-1">
          {["all", "pending", "contacted", "closed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                filter === f
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                  : "text-gray-400 hover:text-gray-700"
              )}
            >
              {f}
              {f !== "all" && (
                <span className="ml-2 text-[8px]">
                  ({inquiries.filter(i => i.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input
              type="text"
              placeholder="Search by name, email, tour..."
              className="w-full bg-slate-50 border border-gray-100 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-brand-primary text-sm transition-all text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchInquiries} className="p-3 bg-slate-50 border border-gray-100 rounded-xl text-gray-400 hover:text-brand-primary hover:border-brand-primary transition-all" title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex gap-6 text-sm">
        <span className="text-gray-400 font-medium">
          Total: <strong className="text-gray-700">{inquiries.length}</strong>
        </span>
        <span className="text-orange-500 font-medium">
          Pending: <strong>{inquiries.filter(i => i.status === "pending").length}</strong>
        </span>
        <span className="text-emerald-500 font-medium">
          Contacted: <strong>{inquiries.filter(i => i.status === "contacted").length}</strong>
        </span>
      </div>

      {/* Inquiry List */}
      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map(n => <div key={n} className="h-40 bg-gray-100 animate-pulse rounded-2xl" />)
        ) : filteredInquiries.length > 0 ? (
          filteredInquiries.map((inquiry, idx) => (
            <motion.div
              key={inquiry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-6 hover:border-brand-primary/20 transition-all shadow-sm hover:shadow-md group"
            >
              {/* Avatar & Status */}
              <div className="flex md:flex-col items-center gap-4 shrink-0">
                <div className="w-14 h-14 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary text-xl font-black font-serif">
                  {inquiry.name[0]?.toUpperCase()}
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                  statusColors[inquiry.status] || "bg-gray-100 text-gray-500 border-gray-200"
                )}>
                  {inquiry.status}
                </span>
              </div>

              {/* Content */}
              <div className="flex-grow space-y-3">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-brand-primary transition-colors">{inquiry.name}</h3>
                    <p className="text-xs text-brand-primary font-bold uppercase tracking-widest">
                      Tour: <span className="text-gray-500 normal-case font-medium">{inquiry.event_title || "General Inquiry"}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-[10px] font-black uppercase tracking-widest shrink-0">
                    <Clock size={12} className="text-brand-primary" />
                    {new Date(inquiry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>

                {inquiry.message && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-600 leading-relaxed">"{inquiry.message}"</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-6">
                  <a href={`mailto:${inquiry.email}`} className="flex items-center gap-2 text-gray-400 hover:text-brand-primary transition-colors text-xs font-medium">
                    <Mail size={14} className="text-brand-primary" /> {inquiry.email}
                  </a>
                  {inquiry.phone && (
                    <a href={`tel:${inquiry.phone}`} className="flex items-center gap-2 text-gray-400 hover:text-brand-primary transition-colors text-xs font-medium">
                      <Phone size={14} className="text-brand-primary" /> {inquiry.phone}
                    </a>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex md:flex-col gap-2 shrink-0 justify-end">
                <button
                  onClick={() => handleStatusUpdate(inquiry.id, "contacted")}
                  disabled={updating === inquiry.id || inquiry.status === "contacted"}
                  className={cn(
                    "p-3 rounded-xl transition-all text-sm font-bold flex items-center gap-2",
                    inquiry.status === "contacted"
                      ? "bg-emerald-500 text-white cursor-default"
                      : "bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-100"
                  )}
                  title="Mark as Contacted"
                >
                  <CheckSquare size={16} />
                  <span className="hidden md:inline text-xs uppercase tracking-widest font-black">Contacted</span>
                </button>
                <button
                  onClick={() => handleStatusUpdate(inquiry.id, "closed")}
                  disabled={updating === inquiry.id || inquiry.status === "closed"}
                  className={cn(
                    "p-3 rounded-xl transition-all flex items-center gap-2",
                    inquiry.status === "closed"
                      ? "bg-gray-700 text-white cursor-default"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-700 hover:text-white border border-gray-200"
                  )}
                  title="Close Inquiry"
                >
                  <X size={16} />
                  <span className="hidden md:inline text-xs uppercase tracking-widest font-black">Close</span>
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-2xl border border-gray-100">
            <MessageSquare size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-serif text-lg">No inquiries match your current filters.</p>
            <button onClick={() => { setFilter("all"); setSearchTerm(""); }} className="mt-4 text-brand-primary text-xs uppercase tracking-widest font-black hover:underline">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
