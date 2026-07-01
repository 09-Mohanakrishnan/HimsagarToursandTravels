import { useState, useEffect } from "react";
import { ArrowRight, Compass, Instagram, ImageOff } from "lucide-react";

interface InstagramPost {
  id: string;
  caption: string;
  media_type: string;
  media_url: string;
  permalink: string;
  timestamp: string;
}

interface InstagramFeedProps {
  fallbackImages?: string[];
  instagramUrl?: string;
  maxPosts?: number;
  filterKeywords?: string;
  hideCaptions?: boolean;
}

export default function InstagramFeed({ fallbackImages, instagramUrl, maxPosts, filterKeywords, hideCaptions }: InstagramFeedProps) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const igProfileUrl = instagramUrl || "https://www.instagram.com/himsagar_travels?igsh=ZzF2MzdkOHZweHlp";

  useEffect(() => {
    fetch("/api/instagram/feed")
      .then(res => res.json())
      .then(data => {
        if (data.posts && data.posts.length > 0) {
          setPosts(data.posts);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const useFallback = error && fallbackImages && fallbackImages.length > 0;

  // Filter posts based on keywords and limit
  const filteredPosts = posts.filter(post => {
    if (!filterKeywords) return true;
    const keywords = filterKeywords.split(",").map(k => k.trim().toLowerCase()).filter(k => k);
    if (keywords.length === 0) return true;
    const caption = (post.caption || "").toLowerCase();
    return keywords.some(k => caption.includes(k));
  }).slice(0, maxPosts || 12);

  return (
    <section className="py-32 bg-white border-t border-gray-100 overflow-hidden flex flex-col">
      <div className="container mx-auto px-6 relative z-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <h4 className="text-brand-primary uppercase tracking-[0.4em] text-[10px] font-black mb-6">Visual Manifest</h4>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif font-black tracking-tighter text-gray-900">
              Instagram <br />Moments
            </h2>
          </div>
          <a
            href={igProfileUrl}
            target="_blank"
            rel="noreferrer"
            className="text-gray-400 font-bold hover:text-brand-primary transition-colors group flex items-center gap-2 pb-2 border-b border-gray-100 uppercase tracking-widest text-[10px]"
          >
            Follow @HimsagarTravels
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="w-full relative flex gap-4 overflow-hidden py-4 -rotate-1 md:-rotate-2 scale-105">
          <div className="flex shrink-0 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-52 h-52 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-[2rem] bg-gray-100 animate-pulse relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-shimmer" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State (no posts, no fallback) */}
      {!loading && error && !useFallback && (
        <div className="container mx-auto px-6">
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
            <ImageOff size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-serif text-lg mb-4">No Instagram posts available right now</p>
            <a
              href={igProfileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-accent transition-all"
            >
              <Instagram size={14} />
              Visit Our Instagram
            </a>
          </div>
        </div>
      )}

      {/* Success State: Live Instagram Posts or Fallback */}
      {!loading && (filteredPosts.length > 0 || useFallback) && (
        <div className="w-full relative flex gap-4 overflow-hidden py-4 -rotate-1 md:-rotate-2 scale-105">
          <div className="flex shrink-0 gap-4 animate-marquee hover:[animation-play-state:paused]">
            {!useFallback ? (
              // Live Posts (Rendered twice for seamless loop)
              [...filteredPosts, ...filteredPosts].map((post, i) => (
                <a
                  key={`${post.id}-${i}`}
                  href={post.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-52 h-52 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-[2rem] overflow-hidden group relative cursor-pointer block shrink-0 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow"
                >
                  <img
                    src={post.media_url}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt={post.caption?.slice(0, 80) || "Instagram post"}
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 md:p-6`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Instagram size={16} className="text-white" />
                      <span className="text-white text-[10px] md:text-xs uppercase tracking-widest font-bold">View on Instagram</span>
                    </div>
                    {!hideCaptions && post.caption && (
                      <p className="text-white/80 text-xs md:text-sm line-clamp-2 font-medium">{post.caption}</p>
                    )}
                  </div>
                  {/* Corner icon */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                    <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                      <Instagram size={18} className="text-brand-primary" />
                    </div>
                  </div>
                </a>
              ))
            ) : (
              // Fallback Images (Rendered twice for seamless loop)
              [...fallbackImages!, ...fallbackImages!].map((img, i) => (
                <a
                  href={igProfileUrl}
                  target="_blank"
                  rel="noreferrer"
                  key={`fallback-${i}`}
                  className="w-52 h-52 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-[2rem] overflow-hidden group relative cursor-pointer block shrink-0 border border-gray-100 shadow-sm"
                >
                  <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Himsagar Travels Instagram" loading="lazy" />
                  <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-primary shadow-xl">
                      <Compass size={24} />
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}
