import { RefreshCcw, Download, FileText, FileJson, FileCode, Shield, BarChart, Activity, Globe2, Zap, Lock } from "lucide-react";
import { cn } from "../../../lib/utils";

interface Props {
  onGenerateFiles: () => void;
}

export default function QuickActions({ onGenerateFiles }: Props) {
  const actions = [
    { label: "Generate Sitemap", desc: "Rebuild sitemap.xml from current pages", icon: FileJson, action: onGenerateFiles, active: true },
    { label: "Download robots.txt", desc: "Regenerate and download robots.txt", icon: FileText, action: () => window.open("/robots.txt", "_blank"), active: true },
    { label: "View Sitemap", desc: "Preview current sitemap.xml", icon: FileCode, action: () => window.open("/sitemap.xml", "_blank"), active: true },
    { label: "Export SEO Report", desc: "Download full SEO audit as JSON", icon: Download, action: async () => {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/seo/health", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `seo-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    }, active: true },
  ];

  const futureEnhancements = [
    { label: "Google Search Console", desc: "Track impressions, clicks, CTR, position", icon: Globe2 },
    { label: "Google Analytics", desc: "Page views, sessions, bounce rate", icon: BarChart },
    { label: "Core Web Vitals", desc: "LCP, FID, CLS monitoring", icon: Zap },
    { label: "Lighthouse Score", desc: "Performance, SEO, Accessibility", icon: Activity },
    { label: "Backlink Summary", desc: "Domain authority, referring domains", icon: Shield },
    { label: "Keyword Rankings", desc: "Track SERP positions over time", icon: Lock },
  ];

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">Quick SEO Actions</h3>
          <p className="text-xs text-gray-500 mt-0.5">Common SEO maintenance tasks</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={action.action}
              className={cn(
                "flex items-start gap-4 p-4 rounded-2xl border transition-all text-left",
                action.active
                  ? "border-gray-100 hover:border-brand-primary/30 hover:shadow-md bg-white group cursor-pointer"
                  : "border-gray-100 bg-gray-50/50 opacity-60 cursor-not-allowed"
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-primary/20 transition-colors">
                <action.icon size={18} className="text-brand-primary" />
              </div>
              <div>
                <span className="text-sm font-bold text-gray-800">{action.label}</span>
                <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Future Enhancements */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">Future Enhancements</h3>
          <p className="text-xs text-gray-500 mt-0.5">Upcoming integrations — reserved for API connections</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {futureEnhancements.map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/30 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <item.icon size={18} className="text-gray-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-500">{item.label}</span>
                  <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest bg-gray-200 text-gray-500 rounded">Coming Soon</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
