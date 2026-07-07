import { useState, useEffect } from "react";
import { Globe, FileText, Search, Activity, Target, Zap, Save, CheckCircle, Loader2 } from "lucide-react";
import { TravelEvent } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

// Sub-components
import HealthSummaryCards from "./seo/HealthSummaryCards";
import SEORecommendations from "./seo/SEORecommendations";
import SearchPreviewEnhanced from "./seo/SearchPreviewEnhanced";
import SEOStatusTable from "./seo/SEOStatusTable";
import KeywordTracking from "./seo/KeywordTracking";
import LandingPageProgress from "./seo/LandingPageProgress";
import QuickActions from "./seo/QuickActions";

export default function SEOManager() {
  const [activeTab, setActiveTab] = useState("static");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [seoConfigs, setSeoConfigs] = useState<any[]>([]);
  const [events, setEvents] = useState<TravelEvent[]>([]);
  const [healthData, setHealthData] = useState<any>(null);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  
  // Preview State
  const [previewKey, setPreviewKey] = useState<string>("home");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const headers = { Authorization: `Bearer ${token}` };
      
      const [configsRes, eventsRes, healthRes, kwRes] = await Promise.all([
        fetch("/api/admin/seo", { headers }),
        fetch("/api/events"),
        fetch("/api/admin/seo/health", { headers }),
        fetch("/api/admin/seo/keywords", { headers })
      ]);
      
      if (configsRes.status === 401 || configsRes.status === 403) {
        window.location.href = "/admin/login";
        return;
      }

      setSeoConfigs(await configsRes.json());
      const evData = await eventsRes.json();
      setEvents(evData.map((e: any) => ({ ...e, id: e._id || e.id })));
      setHealthData(await healthRes.json());
      setKeywords(await kwRes.json());
    } catch (err) {
      console.error(err);
      setError("Failed to load SEO data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKey) return;
    
    setError(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin/seo/${editingKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error("Failed to save config");
      
      setSaved(true);
      setEditingKey(null);
      setTimeout(() => setSaved(false), 3000);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGenerateFiles = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/seo/generate-files", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to generate files");
      alert("Successfully generated robots.txt and sitemap.xml");
    } catch (err: any) {
      alert("Failed to generate files: " + err.message);
    }
  };

  const openEditor = (pageKey: string, defaultData: any = {}) => {
    const existing = seoConfigs.find(c => c.pageKey === pageKey) || {};
    setFormData({ ...defaultData, ...existing });
    setEditingKey(pageKey);
    setPreviewKey(pageKey);
    // Switch to static or dynamic tab if on audit
    if (activeTab === "audit" || activeTab === "keywords" || activeTab === "actions") {
      if (pageKey.startsWith("event::")) {
        setActiveTab("dynamic");
      } else {
        setActiveTab("static");
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const tabs = [
    { id: "static", label: "Static Pages", icon: FileText },
    { id: "dynamic", label: "Dynamic Pages", icon: Globe },
    { id: "audit", label: "SEO Audit", icon: Activity },
    { id: "preview", label: "Search Preview", icon: Search },
    { id: "keywords", label: "Keywords", icon: Target },
    { id: "actions", label: "Quick Actions", icon: Zap },
  ];

  const staticPages = [
    { key: "home", label: "Home Page", path: "/" },
    { key: "about", label: "About Us", path: "/about" },
    { key: "contact", label: "Contact Us", path: "/contact" },
    { key: "events", label: "Tours / Events", path: "/tours" }
  ];

  const InputField = ({ label, field, type = "text", placeholder = "", rows = 1 }: any) => (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">{label}</label>
      {type === "textarea" ? (
        <textarea
          rows={rows}
          value={formData[field] || ""}
          onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
          placeholder={placeholder}
          className="w-full bg-slate-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:border-brand-primary transition-all text-gray-700 text-sm font-medium resize-none"
        />
      ) : (
        <input
          type={type}
          value={formData[field] || ""}
          onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
          placeholder={placeholder}
          className="w-full bg-slate-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:border-brand-primary transition-all text-gray-700 text-sm font-medium"
        />
      )}
    </div>
  );

  const getPreviewData = (key: string) => {
    if (editingKey === key) return formData;
    
    const conf = seoConfigs.find(c => c.pageKey === key) || {};

    let defaultTitle = "Himsagar Travels";
    let defaultDesc = "Experience spiritual and Himalayan tour packages with Himsagar Travels.";
    let defaultImg = "https://himsagartravels.com/logo.png";
    let defaultUrl = "https://himsagartravels.com";

    if (key.startsWith("event::")) {
      const slug = key.split("::")[1];
      const ev = events.find(e => e.slug === slug);
      if (ev) {
        defaultTitle = `${ev.title} | Himsagar Travels`;
        defaultDesc = ev.description || defaultDesc;
        defaultImg = ev.images?.[0] || defaultImg;
        defaultUrl = `https://himsagartravels.com/tours/${ev.slug}`;
      }
    } else {
      const sp = staticPages.find(s => s.key === key);
      if (sp) {
        defaultTitle = `${sp.label} | Himsagar Travels`;
        defaultUrl = `https://himsagartravels.com${sp.path}`;
      }
    }

    return {
      seoTitle: (conf as any).seoTitle || defaultTitle,
      metaDescription: (conf as any).metaDescription || defaultDesc,
      ogImage: (conf as any).ogImage || defaultImg,
      canonicalUrl: (conf as any).canonicalUrl || defaultUrl
    };
  };

  const previewData = getPreviewData(previewKey);

  const allPreviewPages = [
    ...staticPages.map(sp => ({ key: sp.key, label: sp.label })),
    ...events.map(ev => ({ key: `event::${ev.slug}`, label: ev.title }))
  ];

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>;

  return (
    <div className="space-y-8 max-w-6xl">
      {saved && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl px-6 py-4">
          <CheckCircle size={18} />
          <span className="text-sm font-bold">SEO settings saved successfully.</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-4">
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setEditingKey(null); }}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] uppercase tracking-widest font-black transition-all",
              activeTab === tab.id 
                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Editor Overlay */}
      <AnimatePresence mode="wait">
        {editingKey && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white border border-brand-primary/30 rounded-3xl p-8 shadow-xl shadow-brand-primary/5 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary" />
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-serif text-gray-800">Editing SEO: <span className="text-brand-primary">{editingKey}</span></h3>
                <p className="text-xs text-gray-400 mt-1">Configure metadata overrides for this page.</p>
              </div>
            </div>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="SEO Title" field="seoTitle" placeholder="Page Title | Himsagar Travels" />
                <InputField label="Canonical URL" field="canonicalUrl" placeholder="https://himsagartravels.com/..." />
              </div>
              <InputField label="Meta Description" field="metaDescription" type="textarea" rows={2} placeholder="Brief description of the page..." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Keywords (comma separated)" field="keywords" placeholder="travel, himalaya, tours" />
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">Robots Directive</label>
                  <select
                    value={formData.robots || "index, follow"}
                    onChange={(e) => setFormData({ ...formData, robots: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:border-brand-primary transition-all text-gray-700 text-sm font-medium"
                  >
                    <option value="index, follow">index, follow</option>
                    <option value="noindex, follow">noindex, follow</option>
                    <option value="noindex, nofollow">noindex, nofollow</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Open Graph Image URL" field="ogImage" placeholder="https://..." />
                <InputField label="Twitter Image URL" field="twitterImage" placeholder="https://..." />
              </div>
              <InputField label="Custom JSON-LD Schema" field="customSchema" type="textarea" rows={4} placeholder='{ "@context": "https://schema.org", ... }' />
              
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setEditingKey(null)} className="px-6 py-3 text-[10px] uppercase tracking-widest font-black text-gray-400 hover:text-gray-700 transition-colors">Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-brand-primary text-white rounded-xl text-[10px] uppercase tracking-widest font-black hover:bg-brand-accent transition-all shadow-lg shadow-brand-primary/20">
                  <Save size={14} /> Save Config
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={editingKey ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
        {/* Static Pages Tab */}
        {activeTab === "static" && (
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-serif text-gray-800 mb-6">Static Pages SEO</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {staticPages.map((page) => {
                const conf = seoConfigs.find(c => c.pageKey === page.key);
                return (
                  <div key={page.key} className="p-6 rounded-2xl border border-gray-100 bg-slate-50 hover:border-brand-primary/30 transition-all flex justify-between items-center group">
                    <div>
                      <h4 className="font-bold text-gray-800">{page.label}</h4>
                      <p className="text-xs text-gray-400 mt-1 font-mono">{page.path}</p>
                      {conf ? (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded">Customized</span>
                      ) : (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-gray-200 text-gray-500 text-[9px] font-black uppercase tracking-widest rounded">Default</span>
                      )}
                    </div>
                    <button 
                      onClick={() => openEditor(page.key, { canonicalUrl: `https://himsagartravels.com${page.path}` })}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] uppercase tracking-widest font-black text-brand-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-primary hover:text-white"
                    >
                      Edit
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Pages Tab */}
        {activeTab === "dynamic" && (
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-serif text-gray-800 mb-6">Tour & Event Pages</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((ev) => {
                const pageKey = `event::${ev.slug}`;
                const conf = seoConfigs.find(c => c.pageKey === pageKey);
                return (
                  <div key={ev.id} className="p-6 rounded-2xl border border-gray-100 bg-slate-50 hover:border-brand-primary/30 transition-all flex justify-between items-center group">
                    <div>
                      <h4 className="font-bold text-gray-800 line-clamp-1">{ev.title}</h4>
                      <p className="text-xs text-gray-400 mt-1 font-mono">/tours/{ev.slug}</p>
                      {conf ? (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded">Customized</span>
                      ) : (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-gray-200 text-gray-500 text-[9px] font-black uppercase tracking-widest rounded">Auto-Generated</span>
                      )}
                    </div>
                    <button 
                      onClick={() => openEditor(pageKey, { seoTitle: `${ev.title} | Himsagar Travels`, canonicalUrl: `https://himsagartravels.com/tours/${ev.slug}`, metaDescription: ev.description?.substring(0, 160) })}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] uppercase tracking-widest font-black text-brand-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-primary hover:text-white"
                    >
                      Edit
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SEO Audit Tab */}
        {activeTab === "audit" && healthData && (
          <div className="space-y-8">
            <HealthSummaryCards healthData={healthData} onEditPage={openEditor} />
            <SEORecommendations recommendations={healthData.recommendations || []} onEditPage={openEditor} />
            <SEOStatusTable pages={healthData.pages || []} onEditPage={openEditor} />
            <LandingPageProgress pages={healthData.pages || []} />
          </div>
        )}

        {/* Search Preview Tab */}
        {activeTab === "preview" && (
          <SearchPreviewEnhanced
            previewData={previewData}
            allPages={allPreviewPages}
            onSelectPage={setPreviewKey}
            selectedKey={previewKey}
          />
        )}

        {/* Keywords Tab */}
        {activeTab === "keywords" && (
          <KeywordTracking keywords={keywords} onRefresh={fetchData} />
        )}

        {/* Quick Actions Tab */}
        {activeTab === "actions" && (
          <QuickActions onGenerateFiles={handleGenerateFiles} />
        )}
      </div>
    </div>
  );
}
