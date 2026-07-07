import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, RotateCw, X, ArrowLeft, Users, Send, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { EmailCampaign } from "../../../types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../../lib/utils";

const STATUS_STYLES: Record<string, { cls: string; icon: React.ElementType; label: string }> = {
  queued: { cls: "bg-amber-50 text-amber-600 border-amber-100", icon: Clock, label: "Queued" },
  processing: { cls: "bg-blue-50 text-blue-600 border-blue-100", icon: Clock, label: "Processing" },
  sent: { cls: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: CheckCircle2, label: "Sent" },
  failed: { cls: "bg-red-50 text-red-500 border-red-100", icon: AlertCircle, label: "Failed" },
  cancelled: { cls: "bg-gray-100 text-gray-400 border-gray-200", icon: X, label: "Cancelled" },
};

interface Stats {
  total: number; queued: number; processing: number; sent: number; failed: number; cancelled: number;
  subscribers: number; totalEmailsSent: number;
}

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest", color)}>{label}</span>
      </div>
      <p className="text-3xl font-black text-gray-900">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div className="h-full bg-brand-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function EmailCampaignMonitor() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, queued: 0, processing: 0, sent: 0, failed: 0, cancelled: 0, subscribers: 0, totalEmailsSent: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [retryLoading, setRetryLoading] = useState<string | null>(null);

  const token = () => localStorage.getItem("adminToken") || "";
  const authHeader = () => ({ Authorization: `Bearer ${token()}` });
  const showToast = (msg: string, type: "success" | "error" = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, campaignsRes] = await Promise.all([
        fetch("/api/admin/email-campaigns/stats", { headers: authHeader() }).then(r => r.json()),
        fetch("/api/admin/email-campaigns", { headers: authHeader() }).then(r => r.json()),
      ]);
      setStats(statsRes || {});
      setCampaigns((campaignsRes || []).map((c: any) => ({ ...c, id: c._id || c.id })));
    } catch { showToast("Failed to load campaigns", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Auto-refresh if any processing
  useEffect(() => {
    const hasActive = campaigns.some(c => c.status === "queued" || c.status === "processing");
    if (!hasActive) return;
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [campaigns]);

  const handleRetry = async (id: string) => {
    setRetryLoading(id);
    try {
      const res = await fetch(`/api/admin/email-campaigns/${id}/retry`, { method: "POST", headers: authHeader() });
      if (!res.ok) throw new Error((await res.json()).error);
      showToast("Campaign queued for retry");
      fetchData();
    } catch (err: any) { showToast(err.message || "Retry failed", "error"); }
    finally { setRetryLoading(null); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this email campaign?")) return;
    try {
      await fetch(`/api/admin/email-campaigns/${id}/cancel`, { method: "DELETE", headers: authHeader() });
      showToast("Campaign cancelled");
      fetchData();
    } catch { showToast("Cancel failed", "error"); }
  };

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={cn("fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-3", toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
            {toast.type === "success" ? "✓" : "✕"} {toast.msg}
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
            <h1 className="text-3xl font-serif font-black text-gray-900">Email Campaign Monitor</h1>
            <p className="text-sm text-gray-400 mt-0.5">Blog subscriber notification history</p>
          </div>
        </div>
        <button onClick={fetchData} className="inline-flex items-center gap-2 px-5 py-3 bg-slate-50 text-gray-500 rounded-2xl border border-slate-100 hover:bg-white hover:text-brand-primary transition-all text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Subscribers" value={stats.subscribers} icon="👥" color="bg-slate-100 text-gray-500" />
        <StatCard label="Total Sent" value={stats.totalEmailsSent} icon="📧" color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Failed" value={stats.failed} icon="❌" color="bg-red-50 text-red-500" />
        <StatCard label="In Queue" value={stats.queued + stats.processing} icon="⏳" color="bg-amber-50 text-amber-600" />
      </div>

      {/* Campaigns Table */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-black text-gray-800 text-sm uppercase tracking-widest">Campaign History</h2>
          <span className="text-xs text-gray-300 font-bold">{campaigns.length} campaigns</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-5xl mb-4">📬</p>
            <p className="text-xl font-serif text-gray-400 mb-1">No campaigns yet</p>
            <p className="text-sm text-gray-300">Publish a blog and choose "Notify Subscribers" to create a campaign.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {campaigns.map((campaign, i) => {
              const statusMeta = STATUS_STYLES[campaign.status] || STATUS_STYLES.failed;
              const StatusIcon = statusMeta.icon;
              const pct = campaign.totalRecipients > 0 ? Math.round(((campaign.sentCount + campaign.failedCount) / campaign.totalRecipients) * 100) : 0;
              const isActive = campaign.status === "queued" || campaign.status === "processing";

              return (
                <motion.div key={campaign.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="px-6 py-5 flex items-start gap-5 hover:bg-slate-50/50 transition-colors">
                  {/* Status Icon */}
                  <div className={cn("w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center border", statusMeta.cls)}>
                    <StatusIcon size={16} className={isActive ? "animate-spin" : ""} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                      <div>
                        <p className="font-bold text-gray-800 text-sm leading-snug line-clamp-1">{campaign.blogTitle}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-mono">/blog/{campaign.blogSlug}</p>
                      </div>
                      <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0", statusMeta.cls)}>
                        {statusMeta.label}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1.5">
                      <ProgressBar value={campaign.sentCount + campaign.failedCount} max={campaign.totalRecipients} />
                      <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        <span className="text-emerald-500">{campaign.sentCount} sent</span>
                        <span className="text-red-400">{campaign.failedCount} failed</span>
                        <span>{campaign.totalRecipients} recipients</span>
                        <span>{pct}% complete</span>
                      </div>
                    </div>

                    {/* Error message */}
                    {campaign.errorMessage && (
                      <p className="mt-2 text-[10px] text-red-400 bg-red-50 border border-red-100 rounded-xl px-3 py-2 font-mono line-clamp-2">
                        {campaign.errorMessage}
                      </p>
                    )}

                    {/* Dates */}
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-300">
                      <span>Created: {formatDate(campaign.created_at)}</span>
                      {campaign.startedAt && <span>Started: {formatDate(campaign.startedAt)}</span>}
                      {campaign.completedAt && <span>Completed: {formatDate(campaign.completedAt)}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {(campaign.status === "failed" || campaign.status === "cancelled") && (
                      <button onClick={() => handleRetry(campaign.id)} disabled={retryLoading === campaign.id}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-xl text-xs font-black hover:bg-brand-primary hover:text-white transition-colors disabled:opacity-60">
                        {retryLoading === campaign.id ? <RefreshCw size={12} className="animate-spin" /> : <RotateCw size={12} />} Retry
                      </button>
                    )}
                    {isActive && (
                      <button onClick={() => handleCancel(campaign.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-xs font-black hover:bg-red-50 hover:text-red-500 transition-colors">
                        <X size={12} /> Cancel
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* SMTP Status */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <h3 className="text-[10px] uppercase tracking-widest font-black text-brand-primary mb-4">Email Service Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-1">Provider</p>
            <p className="font-bold text-gray-800">SMTP via Nodemailer</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-1">Configuration</p>
            <p className="font-bold text-gray-800">Via <code className="bg-white px-2 py-0.5 rounded-lg text-[10px] font-mono text-brand-primary border border-gray-100">.env</code> file</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 md:col-span-2">
            <p className="text-xs text-gray-400 mb-2">Required Environment Variables</p>
            <div className="font-mono text-[11px] text-gray-500 space-y-1">
              {["SMTP_HOST", "SMTP_PORT", "SMTP_SECURE", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"].map(v => (
                <div key={v} className="flex items-center gap-2">
                  <span className="text-brand-primary font-bold">{v}</span>
                  <span className="text-gray-300">= configured in .env</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
