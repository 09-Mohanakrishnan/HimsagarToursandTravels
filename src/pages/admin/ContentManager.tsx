import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Loader2, Image as ImageIcon } from "lucide-react";
import { SiteContent } from "../../types";
import { cn } from "../../lib/utils";

export default function ContentManager() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        setContent(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    try {
      const formData = new FormData();
      // Home
      formData.append("hero_images", JSON.stringify(content.hero_images || []));
      formData.append("categories", JSON.stringify(content.categories || []));
      formData.append("stats", JSON.stringify(content.stats || []));
      formData.append("philosophy", JSON.stringify(content.philosophy || []));
      formData.append("essentials", JSON.stringify(content.essentials || []));
      formData.append("destinations", JSON.stringify(content.destinations || []));
      formData.append("testimonials", JSON.stringify(content.testimonials || []));
      formData.append("instagram_moments", JSON.stringify(content.instagram_moments || []));
      // Tours
      formData.append("tours_trust_indicators", JSON.stringify(content.tours_trust_indicators || []));
      formData.append("tours_differences", JSON.stringify(content.tours_differences || []));
      // About
      formData.append("about_heritage_stats", JSON.stringify(content.about_heritage_stats || []));
      formData.append("about_principles", JSON.stringify(content.about_principles || []));
      formData.append("about_global_stats", JSON.stringify(content.about_global_stats || []));
      formData.append("about_team", JSON.stringify(content.about_team || []));
      // Contact
      formData.append("contact_offices", JSON.stringify(content.contact_offices || []));
      formData.append("contact_faqs", JSON.stringify(content.contact_faqs || []));

      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: formData,
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("adminToken");
        window.location.href = "/admin/login";
        return;
      }

      if (res.ok) {
        alert("Content saved successfully!");
      } else {
        alert("Failed to save content.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving content");
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand-primary w-8 h-8" /></div>;
  if (!content) return <div>No content found.</div>;

  const handleArrayChange = (key: keyof SiteContent, index: number, field: string, value: string) => {
    const newArr = [...(content[key] as any[])];
    newArr[index] = { ...newArr[index], [field]: value };
    setContent({ ...content, [key]: newArr });
  };

  const handleArrayAdd = (key: keyof SiteContent, defaultItem: any) => {
    setContent({ ...content, [key]: [...(content[key] as any[] || []), defaultItem] });
  };

  const handleArrayRemove = (key: keyof SiteContent, index: number) => {
    const newArr = [...(content[key] as any[])];
    newArr.splice(index, 1);
    setContent({ ...content, [key]: newArr });
  };

  const handleStringArrayChange = (key: keyof SiteContent, index: number, value: string) => {
    const newArr = [...(content[key] as string[])];
    newArr[index] = value;
    setContent({ ...content, [key]: newArr });
  };

  const handleStringArrayAdd = (key: keyof SiteContent) => {
    setContent({ ...content, [key]: [...(content[key] as string[] || []), ""] });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-serif font-black text-brand-navy">Page Content</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the dynamic sections across all pages.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-accent transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {["home", "tours", "about", "contact"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] whitespace-nowrap transition-all",
              activeTab === tab ? "bg-brand-navy text-white shadow-lg" : "bg-white text-gray-400 hover:text-gray-900 border border-gray-100"
            )}
          >
            {tab} Page
          </button>
        ))}
      </div>

      {activeTab === "home" && (
        <div className="space-y-8">
          {/* Hero Images */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b pb-4"><ImageIcon className="text-brand-primary" /> Hero Carousel Images</h2>
            <div className="space-y-4">
              {content.hero_images?.map((img, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <img src={img || "https://placehold.co/100x100"} className="w-16 h-16 object-cover rounded-lg bg-gray-100 shrink-0" />
                  <input
                    type="text"
                    value={img}
                    onChange={(e) => handleStringArrayChange("hero_images", i, e.target.value)}
                    className="flex-1 p-3 border rounded-xl"
                    placeholder="Image URL"
                  />
                  <button onClick={() => handleArrayRemove("hero_images", i)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={20} /></button>
                </div>
              ))}
              <button onClick={() => handleStringArrayAdd("hero_images")} className="flex items-center gap-2 text-brand-primary font-bold hover:text-brand-accent">
                <Plus size={16} /> Add Image
              </button>
            </div>
          </section>

          {/* Categories */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 border-b pb-4">Tour Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.categories?.map((cat, i) => (
                <div key={i} className="p-4 border rounded-xl space-y-4 relative bg-gray-50/50">
                  <button onClick={() => handleArrayRemove("categories", i)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Title</label>
                    <input type="text" value={cat.title} onChange={(e) => handleArrayChange("categories", i, "title", e.target.value)} className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Image URL</label>
                    <input type="text" value={cat.image} onChange={(e) => handleArrayChange("categories", i, "image", e.target.value)} className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Count Text</label>
                    <input type="text" value={cat.count} onChange={(e) => handleArrayChange("categories", i, "count", e.target.value)} className="w-full p-2 border rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => handleArrayAdd("categories", { title: "", image: "", count: "" })} className="mt-6 flex items-center gap-2 text-brand-primary font-bold hover:text-brand-accent">
              <Plus size={16} /> Add Category
            </button>
          </section>

          {/* Stats */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 border-b pb-4">Impact Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {content.stats?.map((stat, i) => (
                <div key={i} className="p-4 border rounded-xl space-y-3 relative">
                  <button onClick={() => handleArrayRemove("stats", i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  <input type="text" value={stat.number} onChange={(e) => handleArrayChange("stats", i, "number", e.target.value)} className="w-full p-2 border rounded-lg font-bold text-center text-xl" placeholder="Number" />
                  <input type="text" value={stat.label} onChange={(e) => handleArrayChange("stats", i, "label", e.target.value)} className="w-full p-2 border rounded-lg text-sm text-center" placeholder="Label" />
                </div>
              ))}
            </div>
            <button onClick={() => handleArrayAdd("stats", { number: "", label: "" })} className="mt-4 flex items-center gap-2 text-brand-primary font-bold hover:text-brand-accent">
              <Plus size={16} /> Add Stat
            </button>
          </section>

          {/* Philosophy */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 border-b pb-4">Philosophy Items</h2>
            <div className="space-y-4">
              {content.philosophy?.map((item, i) => (
                <div key={i} className="p-4 border rounded-xl flex gap-4 items-start">
                  <div className="flex-1 space-y-3">
                    <input type="text" value={item.title} onChange={(e) => handleArrayChange("philosophy", i, "title", e.target.value)} className="w-full p-2 border rounded-lg font-bold" placeholder="Title" />
                    <textarea value={item.desc} onChange={(e) => handleArrayChange("philosophy", i, "desc", e.target.value)} className="w-full p-2 border rounded-lg text-sm" placeholder="Description" rows={2} />
                  </div>
                  <button onClick={() => handleArrayRemove("philosophy", i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-1"><Trash2 size={18} /></button>
                </div>
              ))}
              <button onClick={() => handleArrayAdd("philosophy", { title: "", desc: "" })} className="flex items-center gap-2 text-brand-primary font-bold hover:text-brand-accent">
                <Plus size={16} /> Add Philosophy
              </button>
            </div>
          </section>

          {/* Travel Essentials */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 border-b pb-4">Travel Essentials</h2>
            <div className="space-y-4">
              {content.essentials?.map((item, i) => (
                <div key={i} className="p-4 border rounded-xl flex gap-4 items-start">
                  <div className="flex-1 space-y-3">
                    <input type="text" value={item.title} onChange={(e) => handleArrayChange("essentials", i, "title", e.target.value)} className="w-full p-2 border rounded-lg font-bold" placeholder="Title" />
                    <textarea value={item.desc} onChange={(e) => handleArrayChange("essentials", i, "desc", e.target.value)} className="w-full p-2 border rounded-lg text-sm" placeholder="Description" rows={2} />
                  </div>
                  <button onClick={() => handleArrayRemove("essentials", i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-1"><Trash2 size={18} /></button>
                </div>
              ))}
              <button onClick={() => handleArrayAdd("essentials", { title: "", desc: "" })} className="flex items-center gap-2 text-brand-primary font-bold hover:text-brand-accent">
                <Plus size={16} /> Add Essential
              </button>
            </div>
          </section>

          {/* Destinations */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 border-b pb-4">Popular Destinations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {content.destinations?.map((dest, i) => (
                <div key={i} className="p-4 border rounded-xl space-y-3 relative bg-gray-50/50">
                  <button onClick={() => handleArrayRemove("destinations", i)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-white rounded-full p-1"><Trash2 size={14} /></button>
                  <img src={dest.image || "https://placehold.co/300x200"} className="w-full h-32 object-cover rounded-lg mb-2" />
                  <input type="text" value={dest.name} onChange={(e) => handleArrayChange("destinations", i, "name", e.target.value)} className="w-full p-2 border rounded-lg text-sm font-bold" placeholder="Destination Name" />
                  <input type="text" value={dest.country} onChange={(e) => handleArrayChange("destinations", i, "country", e.target.value)} className="w-full p-2 border rounded-lg text-sm" placeholder="Country" />
                  <input type="text" value={dest.image} onChange={(e) => handleArrayChange("destinations", i, "image", e.target.value)} className="w-full p-2 border rounded-lg text-xs" placeholder="Image URL" />
                </div>
              ))}
            </div>
            <button onClick={() => handleArrayAdd("destinations", { name: "", country: "", image: "" })} className="mt-4 flex items-center gap-2 text-brand-primary font-bold hover:text-brand-accent">
              <Plus size={16} /> Add Destination
            </button>
          </section>

          {/* Testimonials */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 border-b pb-4">Testimonials</h2>
            <div className="space-y-4">
              {content.testimonials?.map((test, i) => (
                <div key={i} className="p-4 border rounded-xl flex gap-4 items-start bg-gray-50/50">
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-4">
                      <input type="text" value={test.name} onChange={(e) => handleArrayChange("testimonials", i, "name", e.target.value)} className="flex-1 p-2 border rounded-lg font-bold" placeholder="Traveler Name" />
                      <input type="text" value={test.location} onChange={(e) => handleArrayChange("testimonials", i, "location", e.target.value)} className="flex-1 p-2 border rounded-lg text-sm" placeholder="Location" />
                    </div>
                    <textarea value={test.text} onChange={(e) => handleArrayChange("testimonials", i, "text", e.target.value)} className="w-full p-2 border rounded-lg text-sm italic" placeholder="Testimonial Quote" rows={3} />
                  </div>
                  <button onClick={() => handleArrayRemove("testimonials", i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-1"><Trash2 size={18} /></button>
                </div>
              ))}
              <button onClick={() => handleArrayAdd("testimonials", { name: "", location: "", text: "" })} className="flex items-center gap-2 text-brand-primary font-bold hover:text-brand-accent">
                <Plus size={16} /> Add Testimonial
              </button>
            </div>
          </section>

          {/* Instagram Moments */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b pb-4"><ImageIcon className="text-brand-primary" /> Instagram Moments</h2>
            <div className="space-y-4">
              {content.instagram_moments?.map((img, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <img src={img || "https://placehold.co/100x100"} className="w-16 h-16 object-cover rounded-lg bg-gray-100 shrink-0" />
                  <input
                    type="text"
                    value={img}
                    onChange={(e) => handleStringArrayChange("instagram_moments", i, e.target.value)}
                    className="flex-1 p-3 border rounded-xl"
                    placeholder="Instagram Image URL"
                  />
                  <button onClick={() => handleArrayRemove("instagram_moments", i)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={20} /></button>
                </div>
              ))}
              <button onClick={() => handleStringArrayAdd("instagram_moments")} className="flex items-center gap-2 text-brand-primary font-bold hover:text-brand-accent">
                <Plus size={16} /> Add Image
              </button>
            </div>
          </section>
        </div>
      )}

      {activeTab === "tours" && (
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 border-b pb-4">Trust Indicators</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {content.tours_trust_indicators?.map((item, i) => (
                <div key={i} className="p-4 border rounded-xl space-y-3 relative">
                  <button onClick={() => handleArrayRemove("tours_trust_indicators", i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  <input type="text" value={item.value} onChange={(e) => handleArrayChange("tours_trust_indicators", i, "value", e.target.value)} className="w-full p-2 border rounded-lg font-bold text-center text-xl" placeholder="Value (e.g. 30+)" />
                  <input type="text" value={item.label} onChange={(e) => handleArrayChange("tours_trust_indicators", i, "label", e.target.value)} className="w-full p-2 border rounded-lg text-sm text-center" placeholder="Label (e.g. Years of Experience)" />
                </div>
              ))}
            </div>
            <button onClick={() => handleArrayAdd("tours_trust_indicators", { value: "", label: "" })} className="mt-4 flex items-center gap-2 text-brand-primary font-bold hover:text-brand-accent">
              <Plus size={16} /> Add Indicator
            </button>
          </section>

          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 border-b pb-4">The Himsagar Difference</h2>
            <div className="space-y-4">
              {content.tours_differences?.map((item, i) => (
                <div key={i} className="p-4 border rounded-xl flex gap-4 items-start">
                  <div className="flex-1 space-y-3">
                    <input type="text" value={item.title} onChange={(e) => handleArrayChange("tours_differences", i, "title", e.target.value)} className="w-full p-2 border rounded-lg font-bold" placeholder="Title" />
                    <textarea value={item.desc} onChange={(e) => handleArrayChange("tours_differences", i, "desc", e.target.value)} className="w-full p-2 border rounded-lg text-sm" placeholder="Description" rows={2} />
                  </div>
                  <button onClick={() => handleArrayRemove("tours_differences", i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-1"><Trash2 size={18} /></button>
                </div>
              ))}
              <button onClick={() => handleArrayAdd("tours_differences", { title: "", desc: "" })} className="flex items-center gap-2 text-brand-primary font-bold hover:text-brand-accent">
                <Plus size={16} /> Add Difference
              </button>
            </div>
          </section>
        </div>
      )}

      {activeTab === "about" && (
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 border-b pb-4">Heritage Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {content.about_heritage_stats?.map((item, i) => (
                <div key={i} className="p-4 border rounded-xl space-y-3 relative">
                  <button onClick={() => handleArrayRemove("about_heritage_stats", i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  <input type="text" value={item.label} onChange={(e) => handleArrayChange("about_heritage_stats", i, "label", e.target.value)} className="w-full p-2 border rounded-lg text-xs font-bold text-center uppercase tracking-widest text-brand-primary" placeholder="Label (e.g. Established)" />
                  <input type="text" value={item.value} onChange={(e) => handleArrayChange("about_heritage_stats", i, "value", e.target.value)} className="w-full p-2 border rounded-lg text-2xl font-black text-center" placeholder="Value (e.g. 2010)" />
                </div>
              ))}
            </div>
            <button onClick={() => handleArrayAdd("about_heritage_stats", { label: "", value: "" })} className="mt-4 flex items-center gap-2 text-brand-primary font-bold hover:text-brand-accent">
              <Plus size={16} /> Add Heritage Stat
            </button>
          </section>

          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 border-b pb-4">Guiding Principles</h2>
            <div className="space-y-4">
              {content.about_principles?.map((item, i) => (
                <div key={i} className="p-4 border rounded-xl flex gap-4 items-start">
                  <div className="flex-1 space-y-3">
                    <input type="text" value={item.icon} onChange={(e) => handleArrayChange("about_principles", i, "icon", e.target.value)} className="w-full p-2 border rounded-lg font-bold" placeholder="Lucide Icon Name (e.g. Compass)" />
                    <input type="text" value={item.title} onChange={(e) => handleArrayChange("about_principles", i, "title", e.target.value)} className="w-full p-2 border rounded-lg font-bold" placeholder="Title" />
                    <textarea value={item.desc} onChange={(e) => handleArrayChange("about_principles", i, "desc", e.target.value)} className="w-full p-2 border rounded-lg text-sm" placeholder="Description" rows={2} />
                  </div>
                  <button onClick={() => handleArrayRemove("about_principles", i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-1"><Trash2 size={18} /></button>
                </div>
              ))}
              <button onClick={() => handleArrayAdd("about_principles", { icon: "", title: "", desc: "" })} className="flex items-center gap-2 text-brand-primary font-bold hover:text-brand-accent">
                <Plus size={16} /> Add Principle
              </button>
            </div>
          </section>

          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 border-b pb-4">Global Footprint Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {content.about_global_stats?.map((item, i) => (
                <div key={i} className="p-4 border rounded-xl space-y-3 relative">
                  <button onClick={() => handleArrayRemove("about_global_stats", i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  <input type="text" value={item.region} onChange={(e) => handleArrayChange("about_global_stats", i, "region", e.target.value)} className="w-full p-2 border rounded-lg font-bold text-center text-sm" placeholder="Region (e.g. Asia Pacific)" />
                  <input type="text" value={item.count} onChange={(e) => handleArrayChange("about_global_stats", i, "count", e.target.value)} className="w-full p-2 border rounded-lg text-xs font-bold text-brand-primary text-center uppercase tracking-widest" placeholder="Count (e.g. 45+ Destinations)" />
                </div>
              ))}
            </div>
            <button onClick={() => handleArrayAdd("about_global_stats", { region: "", count: "" })} className="mt-4 flex items-center gap-2 text-brand-primary font-bold hover:text-brand-accent">
              <Plus size={16} /> Add Global Stat
            </button>
          </section>

          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 border-b pb-4">Team Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {content.about_team?.map((item, i) => (
                <div key={i} className="p-4 border rounded-xl space-y-3 relative bg-gray-50/50">
                  <button onClick={() => handleArrayRemove("about_team", i)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-white rounded-full p-1"><Trash2 size={14} /></button>
                  <img src={item.img || "https://placehold.co/300x300"} className="w-full aspect-square object-cover rounded-[2rem] mb-2" />
                  <input type="text" value={item.name} onChange={(e) => handleArrayChange("about_team", i, "name", e.target.value)} className="w-full p-2 border rounded-lg text-sm font-bold" placeholder="Name" />
                  <input type="text" value={item.role} onChange={(e) => handleArrayChange("about_team", i, "role", e.target.value)} className="w-full p-2 border rounded-lg text-xs uppercase tracking-widest text-brand-primary" placeholder="Role" />
                  <input type="text" value={item.img} onChange={(e) => handleArrayChange("about_team", i, "img", e.target.value)} className="w-full p-2 border rounded-lg text-xs" placeholder="Image URL" />
                </div>
              ))}
            </div>
            <button onClick={() => handleArrayAdd("about_team", { name: "", role: "", img: "" })} className="mt-4 flex items-center gap-2 text-brand-primary font-bold hover:text-brand-accent">
              <Plus size={16} /> Add Team Member
            </button>
          </section>
        </div>
      )}

      {activeTab === "contact" && (
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 border-b pb-4">Global Offices</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {content.contact_offices?.map((item, i) => (
                <div key={i} className="p-4 border rounded-xl space-y-3 relative bg-gray-50/50">
                  <button onClick={() => handleArrayRemove("contact_offices", i)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  <input type="text" value={item.city} onChange={(e) => handleArrayChange("contact_offices", i, "city", e.target.value)} className="w-full p-2 border rounded-lg font-black text-xl" placeholder="City (e.g. London)" />
                  <input type="text" value={item.desc} onChange={(e) => handleArrayChange("contact_offices", i, "desc", e.target.value)} className="w-full p-2 border rounded-lg text-xs uppercase tracking-widest font-bold text-brand-primary" placeholder="Description" />
                  <input type="text" value={item.address} onChange={(e) => handleArrayChange("contact_offices", i, "address", e.target.value)} className="w-full p-2 border rounded-lg text-sm text-gray-500" placeholder="Address" />
                </div>
              ))}
            </div>
            <button onClick={() => handleArrayAdd("contact_offices", { city: "", desc: "", address: "" })} className="mt-4 flex items-center gap-2 text-brand-primary font-bold hover:text-brand-accent">
              <Plus size={16} /> Add Office
            </button>
          </section>

          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 border-b pb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {content.contact_faqs?.map((item, i) => (
                <div key={i} className="p-4 border rounded-xl flex gap-4 items-start">
                  <div className="flex-1 space-y-3">
                    <input type="text" value={item.q} onChange={(e) => handleArrayChange("contact_faqs", i, "q", e.target.value)} className="w-full p-2 border rounded-lg font-bold" placeholder="Question" />
                    <textarea value={item.a} onChange={(e) => handleArrayChange("contact_faqs", i, "a", e.target.value)} className="w-full p-2 border rounded-lg text-sm" placeholder="Answer" rows={3} />
                  </div>
                  <button onClick={() => handleArrayRemove("contact_faqs", i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-1"><Trash2 size={18} /></button>
                </div>
              ))}
              <button onClick={() => handleArrayAdd("contact_faqs", { q: "", a: "" })} className="flex items-center gap-2 text-brand-primary font-bold hover:text-brand-accent">
                <Plus size={16} /> Add FAQ
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Floating Save Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-navy text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs shadow-2xl flex items-center gap-3 hover:bg-brand-dark transition-all hover:scale-105 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>
    </div>
  );
}
