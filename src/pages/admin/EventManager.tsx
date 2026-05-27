import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit2, Camera, X, Check, ArrowLeft, MoreVertical, Loader2 } from "lucide-react";
import { TravelEvent } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

export default function EventManager() {
  const [events, setEvents] = useState<TravelEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Partial<TravelEvent> | null>(null);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [uploadingChapterIdx, setUploadingChapterIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      // Normalize _id -> id for MongoDB docs
      setEvents(data.map((e: any) => ({ ...e, id: e._id || e.id })));
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedEvent({ title: "", description: "", date: "", price: "", location: "", category: "Spiritual", images: [], itinerary: [], visual_journey: [], is_featured: false });
    setNewImagePreviews([]);
    setIsEditing(true);
  };

  const handleEdit = (event: TravelEvent) => {
    setSelectedEvent({ ...event });
    setNewImagePreviews([]);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tour?")) return;
    const token = localStorage.getItem("adminToken");
    const res = await fetch(`/api/admin/events/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("adminToken");
      window.location.href = "/admin/login";
      return;
    }
    fetchEvents();
  };

  const handleFileChange = () => {
    const files = fileInputRef.current?.files;
    if (!files) return;
    const previews: string[] = [];
    for (let i = 0; i < files.length; i++) {
      previews.push(URL.createObjectURL(files[i]));
    }
    setNewImagePreviews(previews);
  };

  const handleChapterImageUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingChapterIdx(idx);
    
    const formData = new FormData();
    formData.append("images", file);
    
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.urls && data.urls.length > 0) {
          const newJourney = [...(selectedEvent?.visual_journey || [])];
          newJourney[idx].image = data.urls[0];
          setSelectedEvent({ ...selectedEvent!, visual_journey: newJourney });
        }
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image");
    } finally {
      setUploadingChapterIdx(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("adminToken");
    const formData = new FormData();

    // Add all text fields
    formData.append("title", selectedEvent!.title || "");
    formData.append("description", selectedEvent!.description || "");
    formData.append("date", selectedEvent!.date || "");
    formData.append("price", selectedEvent!.price || "");
    formData.append("location", selectedEvent!.location || "");
    formData.append("category", selectedEvent!.category || "");
    formData.append("is_featured", String(selectedEvent!.is_featured || false));
    // Send existing images — field name must match server: "existing_images"
    formData.append("existing_images", JSON.stringify(selectedEvent!.images || []));
    formData.append("itinerary", JSON.stringify(selectedEvent!.itinerary || []));
    formData.append("visual_journey", JSON.stringify(selectedEvent!.visual_journey || []));

    // Attach new image files
    if (fileInputRef.current?.files) {
      for (let i = 0; i < fileInputRef.current.files.length; i++) {
        formData.append("images", fileInputRef.current.files[i]);
      }
    }

    const eventId = selectedEvent?.id || selectedEvent?._id;
    const url = eventId ? `/api/admin/events/${eventId}` : "/api/admin/events";
    const method = eventId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("adminToken");
        window.location.href = "/admin/login";
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      setIsEditing(false);
      setNewImagePreviews([]);
      fetchEvents();
    } catch (err) {
      alert("Save failed. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const categories = Array.from(new Set([
    "Spiritual", "Domestic", "International", "Adventure", "Cultural",
    ...events.map(e => e.category).filter(Boolean)
  ]));

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            <div className="flex justify-between items-center">
              <p className="text-gray-400 text-sm font-serif">
                {events.length} tour{events.length !== 1 ? "s" : ""} in database.
              </p>
              <button
                onClick={handleCreateNew}
                className="px-6 py-3 bg-brand-primary text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-brand-accent transition-all shadow-lg shadow-brand-primary/20"
              >
                <Plus size={16} /> Add New Tour
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(n => <div key={n} className="h-80 bg-gray-100 animate-pulse rounded-3xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => (
                  <div key={event.id} className="bg-white group rounded-3xl overflow-hidden flex flex-col border border-gray-100 hover:border-brand-primary/30 transition-all shadow-sm hover:shadow-md">
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={event.images[0] || "https://images.unsplash.com/photo-1540541338287-41700207dee6"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={event.title}
                      />
                      {event.is_featured && (
                        <span className="absolute top-3 left-3 px-3 py-1 bg-brand-primary text-white rounded-full text-[9px] font-black uppercase tracking-widest">Featured</span>
                      )}
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button onClick={() => handleEdit(event)} className="p-2 bg-white/90 backdrop-blur-md rounded-xl text-gray-700 hover:bg-brand-primary hover:text-white transition-all shadow-sm">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(event.id)} className="p-2 bg-white/90 backdrop-blur-md rounded-xl text-gray-700 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <p className="text-[9px] text-brand-primary uppercase tracking-[0.3em] font-black mb-1">{event.category}</p>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{event.title}</h3>
                      <p className="text-xs text-gray-400 mb-4">{event.location} · {event.date}</p>
                      <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                        <span className="text-xl font-black text-brand-primary">₹{event.price}</span>
                        <span className="text-[9px] uppercase tracking-widest text-gray-300 font-bold">{event.images.length} images</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setIsEditing(false)} className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-2xl font-serif text-gray-900">
                  {selectedEvent?.id ? "Edit Tour" : "Add New Tour"}
                </h2>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-0.5">
                  {selectedEvent?.id ? `ID: ${selectedEvent.id}` : "New entry"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
              {/* Core Info */}
              <div className="bg-white border border-gray-100 p-8 rounded-3xl space-y-6 shadow-sm">
                <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">Tour Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Tour Title *</label>
                    <input
                      required type="text"
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-brand-primary text-gray-800 font-medium transition-colors"
                      value={selectedEvent?.title || ""}
                      onChange={e => setSelectedEvent({ ...selectedEvent!, title: e.target.value })}
                      placeholder="e.g. Char Dham Yatra"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Category *</label>
                    <input
                      list="category-options"
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-brand-primary text-gray-800 font-medium transition-colors"
                      value={selectedEvent?.category || "Spiritual"}
                      onChange={e => setSelectedEvent({ ...selectedEvent!, category: e.target.value })}
                      placeholder="Select or type new category"
                    />
                    <datalist id="category-options">
                      {categories.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Description *</label>
                  <textarea
                    required rows={5}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-brand-primary resize-none text-gray-800 font-medium transition-colors"
                    value={selectedEvent?.description || ""}
                    onChange={e => setSelectedEvent({ ...selectedEvent!, description: e.target.value })}
                    placeholder="Describe the tour in detail..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Season / Date</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-brand-primary text-gray-800 font-medium transition-colors"
                      value={selectedEvent?.date || ""}
                      onChange={e => setSelectedEvent({ ...selectedEvent!, date: e.target.value })}
                      placeholder="May - Oct"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Price (₹)</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-brand-primary text-gray-800 font-medium transition-colors"
                      value={selectedEvent?.price || ""}
                      onChange={e => setSelectedEvent({ ...selectedEvent!, price: e.target.value })}
                      placeholder="55,000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Location</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-brand-primary text-gray-800 font-medium transition-colors"
                      value={selectedEvent?.location || ""}
                      onChange={e => setSelectedEvent({ ...selectedEvent!, location: e.target.value })}
                      placeholder="Uttarakhand, India"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer w-fit">
                  <div
                    onClick={() => setSelectedEvent({ ...selectedEvent!, is_featured: !selectedEvent?.is_featured })}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      selectedEvent?.is_featured ? "bg-brand-primary" : "bg-gray-200"
                    )}
                  >
                    <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all", selectedEvent?.is_featured ? "left-7" : "left-1")} />
                  </div>
                  <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Feature on Homepage</span>
                </label>
              </div>

              {/* Itinerary */}
              <div className="bg-white border border-gray-100 p-8 rounded-3xl space-y-6 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">Detailed Itinerary</h3>
                  <button 
                    type="button" 
                    onClick={() => {
                      const newItinerary = [...(selectedEvent?.itinerary || []), { day: (selectedEvent?.itinerary?.length || 0) + 1, title: "", description: "" }];
                      setSelectedEvent({ ...selectedEvent!, itinerary: newItinerary });
                    }}
                    className="text-xs font-black uppercase tracking-widest text-brand-primary flex items-center gap-2 hover:text-brand-accent transition-colors"
                  >
                    <Plus size={14} /> Add Day
                  </button>
                </div>
                
                <div className="space-y-4">
                  {selectedEvent?.itinerary?.map((dayObj, idx) => (
                    <div key={idx} className="p-6 border border-gray-100 rounded-2xl bg-slate-50 relative flex gap-6">
                      <div className="shrink-0 flex flex-col items-center gap-2">
                        <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Day</span>
                        <input 
                          type="number" 
                          value={dayObj.day} 
                          onChange={(e) => {
                            const newItinerary = [...selectedEvent.itinerary!];
                            newItinerary[idx].day = Number(e.target.value);
                            setSelectedEvent({ ...selectedEvent, itinerary: newItinerary });
                          }}
                          className="w-16 p-2 text-center border rounded-lg font-bold"
                        />
                      </div>
                      <div className="flex-1 space-y-3">
                        <input 
                          type="text" 
                          placeholder="Day Title (e.g. Arrival in Kathmandu)" 
                          value={dayObj.title}
                          onChange={(e) => {
                            const newItinerary = [...selectedEvent.itinerary!];
                            newItinerary[idx].title = e.target.value;
                            setSelectedEvent({ ...selectedEvent, itinerary: newItinerary });
                          }}
                          className="w-full p-3 border rounded-lg font-bold"
                        />
                        <textarea 
                          placeholder="Activities for the day..." 
                          value={dayObj.description}
                          onChange={(e) => {
                            const newItinerary = [...selectedEvent.itinerary!];
                            newItinerary[idx].description = e.target.value;
                            setSelectedEvent({ ...selectedEvent, itinerary: newItinerary });
                          }}
                          className="w-full p-3 border rounded-lg text-sm"
                          rows={3}
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          const newItinerary = [...selectedEvent.itinerary!];
                          newItinerary.splice(idx, 1);
                          setSelectedEvent({ ...selectedEvent, itinerary: newItinerary });
                        }}
                        className="text-gray-400 hover:text-red-500 absolute top-6 right-6"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {(!selectedEvent?.itinerary || selectedEvent.itinerary.length === 0) && (
                    <div className="text-center p-8 border border-dashed rounded-2xl text-gray-400 font-medium text-sm">
                      No itinerary days added yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Visual Journey */}
              <div className="bg-white border border-gray-100 p-8 rounded-3xl space-y-6 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">Visual Journey</h3>
                  <button 
                    type="button" 
                    onClick={() => {
                      const newJourney = [...(selectedEvent?.visual_journey || []), { image: "", title: "", description: "", location: "" }];
                      setSelectedEvent({ ...selectedEvent!, visual_journey: newJourney });
                    }}
                    className="text-xs font-black uppercase tracking-widest text-brand-primary flex items-center gap-2 hover:text-brand-accent transition-colors"
                  >
                    <Plus size={14} /> Add Chapter
                  </button>
                </div>
                
                <div className="space-y-4">
                  {selectedEvent?.visual_journey?.map((chapter, idx) => (
                    <div key={idx} className="p-6 border border-gray-100 rounded-2xl bg-slate-50 relative flex gap-6 flex-col md:flex-row">
                      <div className="shrink-0 flex flex-col items-center gap-2 w-full md:w-48">
                        <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest self-start">Image</span>
                        <div className="w-full aspect-video bg-gray-200 rounded-xl overflow-hidden relative border border-gray-100 flex items-center justify-center">
                          {chapter.image ? (
                            <img src={chapter.image} className="w-full h-full object-cover" alt="Journey" />
                          ) : (
                            <Camera size={24} className="text-gray-400" />
                          )}
                          {uploadingChapterIdx === idx && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Loader2 className="w-6 h-6 animate-spin text-white" />
                            </div>
                          )}
                        </div>
                        <label className="text-[10px] uppercase font-black tracking-widest text-brand-primary cursor-pointer hover:text-brand-accent transition-colors mt-1">
                          {chapter.image ? "Change Image" : "Upload Image"}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleChapterImageUpload(idx, e)} 
                          />
                        </label>
                        <input 
                          type="text" 
                          placeholder="Or paste image URL"
                          value={chapter.image}
                          onChange={(e) => {
                            const newJourney = [...selectedEvent.visual_journey!];
                            newJourney[idx].image = e.target.value;
                            setSelectedEvent({ ...selectedEvent, visual_journey: newJourney });
                          }}
                          className="w-full mt-2 p-2 border rounded-lg text-xs"
                        />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-3">
                          <input 
                            type="text" 
                            placeholder="Chapter Title" 
                            value={chapter.title}
                            onChange={(e) => {
                              const newJourney = [...selectedEvent.visual_journey!];
                              newJourney[idx].title = e.target.value;
                              setSelectedEvent({ ...selectedEvent, visual_journey: newJourney });
                            }}
                            className="flex-1 p-3 border rounded-lg font-bold"
                          />
                          <input 
                            type="text" 
                            placeholder="Location Tag" 
                            value={chapter.location}
                            onChange={(e) => {
                              const newJourney = [...selectedEvent.visual_journey!];
                              newJourney[idx].location = e.target.value;
                              setSelectedEvent({ ...selectedEvent, visual_journey: newJourney });
                            }}
                            className="w-1/3 p-3 border rounded-lg text-sm"
                          />
                        </div>
                        <textarea 
                          placeholder="Chapter Description..." 
                          value={chapter.description}
                          onChange={(e) => {
                            const newJourney = [...selectedEvent.visual_journey!];
                            newJourney[idx].description = e.target.value;
                            setSelectedEvent({ ...selectedEvent, visual_journey: newJourney });
                          }}
                          className="w-full p-3 border rounded-lg text-sm"
                          rows={3}
                        />
                      </div>
                      <div className="flex flex-col gap-2 absolute top-6 right-6">
                        <button 
                          type="button"
                          onClick={() => {
                            if (idx === 0) return;
                            const newJourney = [...selectedEvent.visual_journey!];
                            const temp = newJourney[idx - 1];
                            newJourney[idx - 1] = newJourney[idx];
                            newJourney[idx] = temp;
                            setSelectedEvent({ ...selectedEvent, visual_journey: newJourney });
                          }}
                          className={cn("text-gray-400 hover:text-brand-primary", idx === 0 && "opacity-30 cursor-not-allowed")}
                        >
                          ↑
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            if (idx === selectedEvent.visual_journey!.length - 1) return;
                            const newJourney = [...selectedEvent.visual_journey!];
                            const temp = newJourney[idx + 1];
                            newJourney[idx + 1] = newJourney[idx];
                            newJourney[idx] = temp;
                            setSelectedEvent({ ...selectedEvent, visual_journey: newJourney });
                          }}
                          className={cn("text-gray-400 hover:text-brand-primary", idx === selectedEvent.visual_journey!.length - 1 && "opacity-30 cursor-not-allowed")}
                        >
                          ↓
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            const newJourney = [...selectedEvent.visual_journey!];
                            newJourney.splice(idx, 1);
                            setSelectedEvent({ ...selectedEvent, visual_journey: newJourney });
                          }}
                          className="text-gray-400 hover:text-red-500 mt-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!selectedEvent?.visual_journey || selectedEvent.visual_journey.length === 0) && (
                    <div className="text-center p-8 border border-dashed rounded-2xl text-gray-400 font-medium text-sm">
                      No visual journey chapters added yet. If empty, the system will auto-generate them using standard images and highlights.
                    </div>
                  )}
                </div>
              </div>

              {/* Images */}
              <div className="bg-white border border-gray-100 p-8 rounded-3xl space-y-6 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">Images</h3>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-black uppercase tracking-widest text-brand-primary flex items-center gap-2 hover:text-brand-accent transition-colors">
                    <Camera size={14} /> Upload Images
                  </button>
                </div>

                <input type="file" multiple className="hidden" ref={fileInputRef} accept="image/*" onChange={handleFileChange} />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Existing images */}
                  {selectedEvent?.images?.map((img, idx) => (
                    <div key={`existing-${idx}`} className="relative aspect-video rounded-xl overflow-hidden group border border-gray-100">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setSelectedEvent({ ...selectedEvent!, images: selectedEvent?.images?.filter((_, i) => i !== idx) })}
                          className="p-2 bg-red-500 rounded-full text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* New image previews */}
                  {newImagePreviews.map((src, idx) => (
                    <div key={`new-${idx}`} className="relative aspect-video rounded-xl overflow-hidden border-2 border-brand-primary/30">
                      <img src={src} className="w-full h-full object-cover opacity-80" alt="" />
                      <div className="absolute bottom-1 right-1 bg-brand-primary text-white text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase">New</div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-300 hover:border-brand-primary/50 hover:text-brand-primary transition-all bg-slate-50"
                  >
                    <Plus size={20} />
                    <span className="text-[9px] uppercase font-black tracking-widest">Add Image</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-3 text-gray-400 uppercase tracking-widest font-black text-xs hover:text-gray-700 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-10 py-3 bg-brand-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-brand-accent transition-all flex items-center gap-3 disabled:opacity-60"
                >
                  {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Check size={14} /> Save Tour</>}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
