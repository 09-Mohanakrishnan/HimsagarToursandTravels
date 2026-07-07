import { AlertCircle, Lightbulb, Edit3 } from "lucide-react";
import { cn } from "../../../lib/utils";

interface Recommendation {
  issue: string;
  reason: string;
  fix: string;
  priority: "high" | "medium" | "low";
  pageKey: string;
}

interface Props {
  recommendations: Recommendation[];
  onEditPage: (pageKey: string) => void;
}

export default function SEORecommendations({ recommendations, onEditPage }: Props) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <Lightbulb size={20} className="text-emerald-500" />
        </div>
        <h3 className="text-lg font-serif text-gray-800 mb-2">All Clear!</h3>
        <p className="text-sm text-gray-500">No SEO issues detected. Your pages are well optimized.</p>
      </div>
    );
  }

  const sorted = [...recommendations].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  const highCount = sorted.filter(r => r.priority === "high").length;
  const medCount = sorted.filter(r => r.priority === "medium").length;
  const lowCount = sorted.filter(r => r.priority === "low").length;

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lightbulb size={16} className="text-brand-primary" />
          <h3 className="text-sm font-bold text-gray-800">SEO Recommendations</h3>
        </div>
        <div className="flex items-center gap-3">
          {highCount > 0 && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-widest rounded">{highCount} High</span>}
          {medCount > 0 && <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[9px] font-black uppercase tracking-widest rounded">{medCount} Medium</span>}
          {lowCount > 0 && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-black uppercase tracking-widest rounded">{lowCount} Low</span>}
        </div>
      </div>
      <div className="divide-y divide-gray-50">
        {sorted.map((rec, i) => (
          <div key={i} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className={cn(
                "mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                rec.priority === "high" ? "bg-red-100" : rec.priority === "medium" ? "bg-orange-100" : "bg-gray-100"
              )}>
                <AlertCircle size={12} className={cn(
                  rec.priority === "high" ? "text-red-500" : rec.priority === "medium" ? "text-orange-500" : "text-gray-400"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-800">{rec.issue}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest rounded flex-shrink-0",
                    rec.priority === "high" ? "bg-red-100 text-red-600" : rec.priority === "medium" ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"
                  )}>{rec.priority}</span>
                </div>
                <p className="text-xs text-gray-500 mb-1.5">{rec.reason}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">Fix:</span>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{rec.fix}</span>
                </div>
              </div>
              <button
                onClick={() => onEditPage(rec.pageKey)}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary text-white rounded-lg text-[9px] uppercase tracking-widest font-black hover:bg-brand-accent transition-all"
              >
                <Edit3 size={10} /> Fix
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
