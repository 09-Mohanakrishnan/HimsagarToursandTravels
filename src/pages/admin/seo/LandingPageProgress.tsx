import { cn } from "../../../lib/utils";
import { BarChart3 } from "lucide-react";

interface PageData {
  pageKey: string;
  label: string;
  path: string;
  score: number;
  status: string;
  schema: boolean;
  canonical: string;
  ogImage: string;
  robots: string;
  updatedAt: string | null;
}

interface Props {
  pages: PageData[];
}

export default function LandingPageProgress({ pages }: Props) {
  if (!pages || pages.length === 0) return null;

  const sorted = [...pages].sort((a, b) => a.score - b.score);

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 border-b border-gray-100 flex items-center gap-3">
        <BarChart3 size={16} className="text-brand-primary" />
        <div>
          <h3 className="text-sm font-bold text-gray-800">Landing Page Progress</h3>
          <p className="text-xs text-gray-500">{pages.length} pages tracked</p>
        </div>
      </div>
      <div className="divide-y divide-gray-50">
        {sorted.map((page) => (
          <div key={page.pageKey} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800 truncate">{page.label}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest rounded flex-shrink-0",
                    page.status === "excellent" ? "bg-emerald-100 text-emerald-700" :
                    page.status === "good" ? "bg-blue-100 text-blue-700" :
                    page.status === "needs_attention" ? "bg-orange-100 text-orange-700" :
                    "bg-red-100 text-red-700"
                  )}>
                    {page.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{page.path}</p>
              </div>
              <span className={cn(
                "text-sm font-black flex-shrink-0 ml-4",
                page.score >= 90 ? "text-emerald-500" : page.score >= 70 ? "text-blue-500" : page.score >= 50 ? "text-orange-500" : "text-red-500"
              )}>{page.score}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  page.score >= 90 ? "bg-emerald-500" : page.score >= 70 ? "bg-blue-500" : page.score >= 50 ? "bg-orange-400" : "bg-red-500"
                )}
                style={{ width: `${page.score}%` }}
              />
            </div>
            <div className="flex gap-3 mt-2">
              <span className={cn("text-[9px] font-bold", page.schema ? "text-emerald-500" : "text-gray-300")}>Schema {page.schema ? "✓" : "✗"}</span>
              <span className={cn("text-[9px] font-bold", page.canonical ? "text-emerald-500" : "text-gray-300")}>Canonical {page.canonical ? "✓" : "✗"}</span>
              <span className={cn("text-[9px] font-bold", page.ogImage ? "text-emerald-500" : "text-gray-300")}>OG Image {page.ogImage ? "✓" : "✗"}</span>
              <span className={cn("text-[9px] font-bold", page.robots === "index, follow" ? "text-emerald-500" : "text-orange-400")}>Robots: {page.robots}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
