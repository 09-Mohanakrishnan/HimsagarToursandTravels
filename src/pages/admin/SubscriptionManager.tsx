import { useEffect, useState } from "react";
import { Mail, Trash2, Search, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { Subscription } from "../../types";
import { cn } from "../../lib/utils";

export default function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch("/api/admin/subscriptions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("adminToken");
        window.location.href = "/admin/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to load subscriptions");
      const data = await res.json();
      setSubscriptions(data.map((item: any) => ({ ...item, id: item._id || item.id })));
    } catch (err) {
      console.error(err);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("adminToken");
    if (!window.confirm("Remove this subscriber from the list?")) return;
    setRemoving(id);
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setSubscriptions((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      alert("Could not remove subscriber. Please try again.");
      console.error(err);
    } finally {
      setRemoving(null);
    }
  };

  const filtered = subscriptions.filter((subscription) =>
    subscription.email.toLowerCase().includes(query.toLowerCase()) ||
    (subscription.name || "").toLowerCase().includes(query.toLowerCase()) ||
    (subscription.source || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-serif font-black text-gray-900">Newsletter Subscribers</h1>
          <p className="text-sm text-gray-500 mt-2">Review, search, and remove subscription entries collected from your site.</p>
        </div>
        <button
          onClick={fetchSubscriptions}
          className="inline-flex items-center gap-2 px-5 py-3 bg-slate-50 text-gray-500 rounded-2xl border border-slate-100 hover:bg-white hover:text-brand-primary transition-all"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="bg-slate-50 p-4 rounded-3xl border border-gray-100 text-sm text-gray-600">
          Total subscribers: <strong className="text-gray-900">{subscriptions.length}</strong>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
          <input
            type="text"
            placeholder="Search by email, name, or source"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-50 border border-gray-100 rounded-2xl py-3 pl-11 pr-4 outline-none focus:border-brand-primary transition-all text-sm text-gray-700"
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map((item) => (
            <div key={item} className="h-28 rounded-3xl bg-gray-100 animate-pulse" />
          ))
        ) : filtered.length > 0 ? (
          filtered.map((subscription, index) => (
            <motion.div
              key={subscription.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col md:flex-row justify-between gap-4 shadow-sm"
            >
              <div className="space-y-2">
                <p className="text-gray-900 font-bold text-sm">{subscription.email}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-black">{subscription.name || "Subscriber"}</p>
                <p className="text-[11px] text-gray-500">Source: {subscription.source || "website"}</p>
              </div>
              <div className="flex flex-col items-start md:items-end justify-between gap-3 md:text-right">
                <p className="text-xs text-gray-400 uppercase tracking-[0.25em]">Joined</p>
                <p className="text-sm text-gray-700 font-semibold">{new Date(subscription.created_at).toLocaleDateString()}</p>
                <button
                  onClick={() => handleDelete(subscription.id)}
                  disabled={removing === subscription.id}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs uppercase tracking-[0.3em] font-black transition-all",
                    removing === subscription.id ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-rose-500 text-white hover:bg-rose-600"
                  )}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center text-gray-500">
            No subscribers found. New signups will appear here automatically.
          </div>
        )}
      </div>
    </div>
  );
}
