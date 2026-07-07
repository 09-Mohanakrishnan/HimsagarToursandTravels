import { useState } from "react";
import { Monitor, Smartphone, Search, Globe } from "lucide-react";
import { cn } from "../../../lib/utils";

interface Props {
  previewData: {
    seoTitle: string;
    metaDescription: string;
    ogImage: string;
    canonicalUrl: string;
  };
  allPages: { key: string; label: string }[];
  onSelectPage: (key: string) => void;
  selectedKey: string;
}

function CharBadge({ len, ranges }: { len: number; ranges: { green: [number, number]; orange: [number, number][]; red: (n: number) => boolean } }) {
  const isGreen = len >= ranges.green[0] && len <= ranges.green[1];
  const isOrange = ranges.orange.some(([a, b]) => len >= a && len <= b);
  const isRed = ranges.red(len);
  return (
    <span className={cn(
      "text-[10px] font-bold px-1.5 py-0.5 rounded",
      isGreen ? "bg-emerald-100 text-emerald-700" : isOrange ? "bg-orange-100 text-orange-700" : isRed ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"
    )}>
      {len} chars
    </span>
  );
}

export default function SearchPreviewEnhanced({ previewData, allPages, onSelectPage, selectedKey }: Props) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const titleLen = previewData.seoTitle?.length || 0;
  const descLen = previewData.metaDescription?.length || 0;

  const titleRanges = {
    green: [50, 60] as [number, number],
    orange: [[45, 49], [61, 65]] as [number, number][],
    red: (n: number) => n > 65 || (n > 0 && n < 45)
  };

  const descRanges = {
    green: [140, 160] as [number, number],
    orange: [[130, 139], [161, 170]] as [number, number][],
    red: (n: number) => n > 170 || (n > 0 && n < 130)
  };

  return (
    <div className="space-y-6">
      {/* Page selector + Device toggle */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1">
            <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 block mb-2">Preview Page</label>
            <select
              value={selectedKey}
              onChange={(e) => onSelectPage(e.target.value)}
              className="w-full md:w-72 bg-slate-50 border border-gray-100 rounded-xl py-2.5 px-4 outline-none focus:border-brand-primary transition-all text-gray-700 text-sm font-medium"
            >
              {allPages.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          </div>
          <div className="flex gap-1 bg-slate-50 rounded-xl p-1 border border-gray-100">
            <button
              onClick={() => setDevice("desktop")}
              className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest font-black transition-all", device === "desktop" ? "bg-white text-brand-primary shadow-sm" : "text-gray-400")}
            >
              <Monitor size={12} /> Desktop
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest font-black transition-all", device === "mobile" ? "bg-white text-brand-primary shadow-sm" : "text-gray-400")}
            >
              <Smartphone size={12} /> Mobile
            </button>
          </div>
        </div>
      </div>

      {/* Character Counters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">Title Length</span>
            <CharBadge len={titleLen} ranges={titleRanges} />
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={cn("h-2 rounded-full transition-all", titleLen >= 50 && titleLen <= 60 ? "bg-emerald-500" : titleLen >= 45 && titleLen <= 65 ? "bg-orange-400" : "bg-red-500")}
              style={{ width: `${Math.min(100, (titleLen / 65) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">Recommended: 50–60 characters</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">Description Length</span>
            <CharBadge len={descLen} ranges={descRanges} />
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={cn("h-2 rounded-full transition-all", descLen >= 140 && descLen <= 160 ? "bg-emerald-500" : descLen >= 130 && descLen <= 170 ? "bg-orange-400" : "bg-red-500")}
              style={{ width: `${Math.min(100, (descLen / 170) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">Recommended: 140–160 characters</p>
        </div>
      </div>

      {/* Previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Preview */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-xs uppercase font-black tracking-widest text-gray-400 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
            <Search size={14} /> Google {device === "desktop" ? "Desktop" : "Mobile"}
          </h3>
          <div className={cn("bg-white rounded-lg", device === "mobile" ? "max-w-[320px]" : "max-w-full")}>
            <p className="text-[13px] text-[#202124] mb-1 font-sans truncate">{previewData.canonicalUrl}</p>
            <h4 className={cn("text-[#1a0dab] mb-1 font-sans cursor-pointer hover:underline", device === "desktop" ? "text-[20px] truncate" : "text-[18px] line-clamp-2")}>
              {previewData.seoTitle}
            </h4>
            <p className={cn("text-[#4d5156] font-sans leading-snug", device === "desktop" ? "text-[14px] line-clamp-2" : "text-[13px] line-clamp-3")}>
              {previewData.metaDescription}
            </p>
          </div>
        </div>

        {/* Social Preview */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-xs uppercase font-black tracking-widest text-gray-400 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
            <Globe size={14} /> Social Card
          </h3>
          <div className={cn("border border-gray-200 rounded-2xl overflow-hidden", device === "mobile" ? "max-w-[320px]" : "max-w-full")}>
            <div className="aspect-video bg-gray-100 relative">
              {previewData.ogImage && (
                <img src={previewData.ogImage} alt="" className="w-full h-full object-cover" onError={(e) => (e.target as any).style.display = 'none'} />
              )}
            </div>
            <div className="bg-slate-50 p-4 border-t border-gray-200">
              <p className="text-[12px] text-gray-500 font-sans mb-0.5 truncate">{previewData.canonicalUrl?.replace("https://", "")}</p>
              <h4 className="text-[14px] text-gray-900 font-bold font-sans line-clamp-1 mb-1">{previewData.seoTitle}</h4>
              <p className="text-[13px] text-gray-600 font-sans line-clamp-2">{previewData.metaDescription}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
