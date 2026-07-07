import { Edit3, CheckCircle, AlertTriangle, XCircle, AlertCircle } from "lucide-react";
import { cn } from "../../../lib/utils";

interface PageData {
  pageKey: string;
  label: string;
  path: string;
  title: string;
  titleLength: number;
  description: string;
  descLength: number;
  canonical: string;
  ogImage: string;
  twitterImage: string;
  schema: boolean;
  robots: string;
  keywords: string;
  issues: string[];
  score: number;
  status: string;
  updatedAt: string | null;
}

interface Props {
  pages: PageData[];
  onEditPage: (pageKey: string) => void;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  excellent: { label: "Excellent", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  good: { label: "Good", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  needs_attention: { label: "Needs Attention", color: "bg-orange-100 text-orange-700", icon: AlertTriangle },
  critical: { label: "Critical", color: "bg-red-100 text-red-700", icon: XCircle }
};

function Check({ ok }: { ok: boolean }) {
  return ok
    ? <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle size={11} className="text-emerald-600" /></span>
    : <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center"><AlertCircle size={11} className="text-red-500" /></span>;
}

export default function SEOStatusTable({ pages, onEditPage }: Props) {
  if (!pages || pages.length === 0) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-800">Complete SEO Status</h3>
        <p className="text-xs text-gray-500 mt-0.5">{pages.length} pages analyzed</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400 whitespace-nowrap">Page</th>
              <th className="text-center px-3 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400">Score</th>
              <th className="text-left px-3 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400">Title</th>
              <th className="text-left px-3 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400">Description</th>
              <th className="text-center px-2 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400">Canon.</th>
              <th className="text-center px-2 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400">OG</th>
              <th className="text-center px-2 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400">Twitter</th>
              <th className="text-center px-2 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400">Schema</th>
              <th className="text-left px-3 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400">Robots</th>
              <th className="text-left px-3 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400">Status</th>
              <th className="text-right px-4 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => {
              const s = statusConfig[page.status] || statusConfig.needs_attention;
              const StatusIcon = s.icon;
              return (
                <tr key={page.pageKey} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-800 text-xs whitespace-nowrap">{page.label}</div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">{page.path}</div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={cn(
                      "text-sm font-black",
                      page.score >= 90 ? "text-emerald-500" : page.score >= 70 ? "text-blue-500" : page.score >= 50 ? "text-orange-500" : "text-red-500"
                    )}>{page.score}%</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs text-gray-600 max-w-[150px] truncate">{page.title}</div>
                    <div className="text-[10px] text-gray-400">{page.titleLength} chars</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs text-gray-600 max-w-[150px] truncate">{page.description}</div>
                    <div className="text-[10px] text-gray-400">{page.descLength} chars</div>
                  </td>
                  <td className="px-2 py-3 text-center"><Check ok={!!page.canonical} /></td>
                  <td className="px-2 py-3 text-center"><Check ok={!!page.ogImage} /></td>
                  <td className="px-2 py-3 text-center"><Check ok={!!page.twitterImage} /></td>
                  <td className="px-2 py-3 text-center"><Check ok={page.schema} /></td>
                  <td className="px-3 py-3">
                    <span className="text-[10px] text-gray-500 font-mono">{page.robots}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded whitespace-nowrap", s.color)}>
                      <StatusIcon size={10} /> {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onEditPage(page.pageKey)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-primary text-white rounded-lg text-[9px] uppercase tracking-widest font-black hover:bg-brand-accent transition-all"
                    >
                      <Edit3 size={10} /> Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
