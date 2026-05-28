import React from "react";
import { AIOptimization } from "../types";
import { Lightbulb, CheckCircle2, TrendingDown } from "lucide-react";

interface AIRecommendationsProps {
  suggestions: AIOptimization[];
  onApply: (suggestion: AIOptimization) => void;
  appliedKeys: string[];
  currencySymbol: string;
}

export default function AIRecommendations({ suggestions, onApply, appliedKeys, currencySymbol }: AIRecommendationsProps) {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-md">
        <div className="flex gap-3 items-center text-slate-400">
          <Lightbulb className="w-5 h-5 col-indigo-400" />
          <span className="text-xs">Enter event specifications to view custom budget advisory tips.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-slate-100 shadow-lg space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-display font-medium text-white flex items-center gap-2">
            <Lightbulb className="w-4.5 h-4.5 text-amber-400" />
            Budget Optimization Tips
          </h3>
          <p className="text-[10px] text-slate-400">Tactical ideas to match the quote with the desired target budget.</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] bg-slate-900 px-2 py-1 rounded-md text-emerald-400 font-mono">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Value Curation</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {suggestions.map((s, index) => {
          const isApplied = appliedKeys.includes(s.actionKey);
          return (
            <div 
              key={index} 
              className={`p-3.5 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                isApplied 
                  ? "bg-slate-900/60 border-emerald-950 text-slate-300"
                  : "bg-slate-900/30 border-slate-800 hover:border-slate-700 text-slate-100"
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                    {s.title}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed pr-2">
                    {s.description}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="block text-xs font-mono font-bold text-emerald-400">
                    -{currencySymbol}{s.estimatedSaving.toLocaleString()}
                  </span>
                  <span className="block text-[8px] text-slate-500 uppercase tracking-wider">Estimated</span>
                </div>
              </div>

              <div className="mt-3 flex justify-between items-center border-t border-slate-800/60 pt-2 text-[10px]">
                <span className="text-[9px] text-slate-500 capitalize">
                  Applies to: <strong className="text-slate-400">{s.actionKey} services</strong>
                </span>

                <button
                  type="button"
                  disabled={isApplied}
                  onClick={() => onApply(s)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                    isApplied
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Applied</span>
                    </>
                  ) : (
                    <span>Apply Adjustment</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
