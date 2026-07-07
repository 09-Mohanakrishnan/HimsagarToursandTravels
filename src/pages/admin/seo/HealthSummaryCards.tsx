import { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../../lib/utils";

interface SummaryCard {
  label: string;
  value: number;
  issueKey: string;
  color: "red" | "orange" | "gray" | "emerald";
}

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
  healthData: any;
  onEditPage: (pageKey: string) => void;
}

const issueLabels: Record<string, string> = {
  title_too_generic: "Generic Title",
  title_too_long: "Title Too Long",
  title_too_short: "Title Too Short",
  missing_description: "Missing Description",
  desc_too_long: "Description Too Long",
  desc_too_short: "Description Too Short",
  missing_og_image: "Missing OG Image",
  missing_twitter_image: "Missing Twitter Image",
  missing_schema: "Missing Schema",
  missing_canonical: "Missing Canonical",
  missing_keywords: "Missing Keywords",
  noindex: "Non-Indexable",
  duplicate_title: "Duplicate Title",
  duplicate_description: "Duplicate Description"
};

export default function HealthSummaryCards({ healthData, onEditPage }: Props) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  if (!healthData?.summary) return null;

  const { summary, pages, duplicates } = healthData;

  const cards: SummaryCard[] = [
    { label: "SEO Score", value: healthData.score, issueKey: "__score__", color: healthData.score > 80 ? "emerald" : healthData.score > 50 ? "orange" : "red" },
    { label: "Missing Titles", value: summary.missingTitles, issueKey: "title_too_generic", color: summary.missingTitles > 0 ? "red" : "emerald" },
    { label: "Missing Descriptions", value: summary.missingDesc, issueKey: "missing_description", color: summary.missingDesc > 0 ? "red" : "emerald" },
    { label: "Duplicate Titles", value: summary.duplicateTitles, issueKey: "duplicate_title", color: summary.duplicateTitles > 0 ? "orange" : "emerald" },
    { label: "Duplicate Descriptions", value: summary.duplicateDescs, issueKey: "duplicate_description", color: summary.duplicateDescs > 0 ? "orange" : "emerald" },
    { label: "Missing Canonical", value: summary.missingCanonical, issueKey: "missing_canonical", color: summary.missingCanonical > 0 ? "red" : "emerald" },
    { label: "Missing OG Images", value: summary.missingOgImage, issueKey: "missing_og_image", color: summary.missingOgImage > 0 ? "orange" : "emerald" },
    { label: "Missing Twitter Images", value: summary.missingTwitterImage, issueKey: "missing_twitter_image", color: summary.missingTwitterImage > 0 ? "orange" : "emerald" },
    { label: "Missing Schema", value: summary.missingSchema, issueKey: "missing_schema", color: summary.missingSchema > 0 ? "orange" : "emerald" },
    { label: "Missing Keywords", value: summary.missingKeywords, issueKey: "missing_keywords", color: summary.missingKeywords > 0 ? "gray" : "emerald" },
    { label: "Non-Indexable", value: summary.nonIndexable, issueKey: "noindex", color: summary.nonIndexable > 0 ? "red" : "emerald" },
    { label: "Title Too Long", value: summary.titleTooLong, issueKey: "title_too_long", color: summary.titleTooLong > 0 ? "orange" : "emerald" },
    { label: "Desc Too Long", value: summary.descTooLong, issueKey: "desc_too_long", color: summary.descTooLong > 0 ? "orange" : "emerald" },
  ];

  const colorMap = {
    red: "text-red-500",
    orange: "text-orange-500",
    gray: "text-gray-500",
    emerald: "text-emerald-500"
  };

  const getAffectedPages = (issueKey: string): PageData[] => {
    if (!pages) return [];
    if (issueKey === "duplicate_title") {
      const keys = Object.values(duplicates?.titles || {}).flat() as string[];
      return pages.filter((p: PageData) => keys.includes(p.pageKey));
    }
    if (issueKey === "duplicate_description") {
      const keys = Object.values(duplicates?.descriptions || {}).flat() as string[];
      return pages.filter((p: PageData) => keys.includes(p.pageKey));
    }
    return pages.filter((p: PageData) => p.issues.includes(issueKey));
  };

  const getDuplicateGroup = (page: PageData, type: "title" | "description") => {
    const map = type === "title" ? duplicates?.titles : duplicates?.descriptions;
    const val = type === "title" ? page.title : page.description;
    if (!map || !map[val]) return [];
    return map[val].filter((k: string) => k !== page.pageKey);
  };

  const getRecommendedTitle = (page: PageData) => {
    const base = page.label.replace(/ Page$/, "");
    return `${base} | Spiritual Tour Packages | Himsagar Travels`;
  };

  const toggleCard = (issueKey: string) => {
    setExpandedCard(prev => prev === issueKey ? null : issueKey);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {cards.map((card) => {
          const isClickable = card.value > 0 && card.issueKey !== "__score__";
          const isExpanded = expandedCard === card.issueKey;
          return (
            <button
              key={card.issueKey}
              onClick={() => isClickable && toggleCard(card.issueKey)}
              disabled={!isClickable}
              className={cn(
                "bg-white p-5 rounded-2xl border shadow-sm text-left transition-all relative group",
                isClickable ? "cursor-pointer hover:border-brand-primary/40 hover:shadow-md" : "cursor-default",
                isExpanded ? "border-brand-primary/50 ring-2 ring-brand-primary/10" : "border-gray-100"
              )}
            >
              <h4 className="text-[9px] uppercase tracking-widest font-black text-gray-400 mb-1.5">{card.label}</h4>
              <div className="flex items-end justify-between">
                <span className={cn("text-3xl font-serif", colorMap[card.color])}>
                  {card.issueKey === "__score__" ? `${card.value}%` : card.value}
                </span>
                {isClickable && (
                  <span className="text-gray-300 group-hover:text-brand-primary transition-colors">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded Issue Report */}
      <AnimatePresence mode="wait">
        {expandedCard && (
          <motion.div
            key={expandedCard}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-gray-100 flex items-center gap-3">
                <AlertTriangle size={16} className="text-orange-500" />
                <h3 className="text-sm font-bold text-gray-800">
                  {issueLabels[expandedCard] || expandedCard} — Affected Pages
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400">Page</th>
                      <th className="text-left px-6 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400">Current Value</th>
                      {(expandedCard === "duplicate_title" || expandedCard === "duplicate_description") && (
                        <th className="text-left px-6 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400">Duplicate With</th>
                      )}
                      <th className="text-left px-6 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400">Issue</th>
                      <th className="text-left px-6 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400">Recommended Fix</th>
                      <th className="text-left px-6 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400">Priority</th>
                      <th className="text-right px-6 py-3 text-[9px] uppercase tracking-widest font-black text-gray-400">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getAffectedPages(expandedCard).map((page) => {
                      const currentVal = expandedCard.includes("title") ? page.title : expandedCard.includes("desc") || expandedCard === "missing_description" ? page.description : expandedCard === "missing_og_image" ? (page.ogImage || "—") : expandedCard === "missing_twitter_image" ? (page.twitterImage || "—") : expandedCard === "missing_schema" ? "No schema" : expandedCard === "missing_canonical" ? (page.canonical || "—") : expandedCard === "missing_keywords" ? (page.keywords || "—") : "—";
                      const charCount = expandedCard.includes("title") ? page.titleLength : expandedCard.includes("desc") || expandedCard === "missing_description" ? page.descLength : null;
                      const dupWith = (expandedCard === "duplicate_title") ? getDuplicateGroup(page, "title") : (expandedCard === "duplicate_description") ? getDuplicateGroup(page, "description") : [];
                      const priority = expandedCard.includes("duplicate") || expandedCard.includes("missing_description") || expandedCard === "title_too_generic" ? "high" : expandedCard.includes("missing") ? "medium" : "low";
                      const recFix = expandedCard === "title_too_generic" ? getRecommendedTitle(page) : expandedCard === "title_too_long" ? "Shorten to 50-60 chars" : expandedCard === "missing_description" ? "Write 140-160 char description" : expandedCard === "desc_too_long" ? "Shorten to 140-160 chars" : expandedCard.includes("duplicate") ? "Make unique" : expandedCard.includes("og_image") ? "Add 1200×630 image" : expandedCard === "missing_schema" ? "Add JSON-LD" : "Configure";

                      return (
                        <tr key={page.pageKey} className="border-b border-gray-50 hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-800 text-sm">{page.label}</div>
                            <div className="text-[11px] text-gray-400 font-mono mt-0.5">{page.path}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-600 text-xs max-w-[200px] truncate">{currentVal}</div>
                            {charCount !== null && <div className="text-[10px] text-gray-400 mt-0.5">{charCount} chars</div>}
                          </td>
                          {(expandedCard === "duplicate_title" || expandedCard === "duplicate_description") && (
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {dupWith.map((k: string) => (
                                  <span key={k} className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[9px] font-bold rounded">{k}</span>
                                ))}
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4">
                            <span className="text-xs text-gray-600">{issueLabels[expandedCard]}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded">{recFix}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded",
                              priority === "high" ? "bg-red-100 text-red-600" : priority === "medium" ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"
                            )}>{priority}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={(e) => { e.stopPropagation(); onEditPage(page.pageKey); }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary text-white rounded-lg text-[9px] uppercase tracking-widest font-black hover:bg-brand-accent transition-all"
                            >
                              <Edit3 size={10} /> Edit SEO
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
