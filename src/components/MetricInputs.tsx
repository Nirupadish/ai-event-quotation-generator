import React from "react";
import { 
  InputMetrics, 
  AVAILABLE_SERVICES, 
  PACKAGE_TIERS, 
  EVENT_TYPES, 
  AVAILABLE_CURRENCIES 
} from "../types";
import { 
  User, 
  MapPin, 
  Calendar, 
  Users, 
  Sparkles, 
  FileText, 
  DollarSign, 
  Activity,
  Plus
} from "lucide-react";

interface MetricInputsProps {
  metrics: InputMetrics;
  onChange: (metrics: InputMetrics) => void;
  onGenerate: () => void;
  loading: boolean;
}

export default function MetricInputs({ metrics, onChange, onGenerate, loading }: MetricInputsProps) {
  const handleFieldChange = (key: keyof InputMetrics, value: any) => {
    onChange({ ...metrics, [key]: value });
  };

  const toggleService = (serviceId: string) => {
    const updated = metrics.services.includes(serviceId)
      ? metrics.services.filter(s => s !== serviceId)
      : [...metrics.services, serviceId];
    handleFieldChange("services", updated);
  };

  const selectAllServices = () => {
    const all = AVAILABLE_SERVICES.map(s => s.id);
    handleFieldChange("services", all);
  };

  const clearServices = () => {
    handleFieldChange("services", []);
  };

  const currentCurrency = AVAILABLE_CURRENCIES.find(c => c.code === metrics.currencyCode) || AVAILABLE_CURRENCIES[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      <div>
        <h2 className="text-lg font-display font-bold tracking-tight text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          Event Quotation Designer
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Provide your event parameters below to design a personalized estimation sheet and check alignment.
        </p>
      </div>

      <div className="space-y-4">
        {/* Client Name */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Client / Organization Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg py-2 px-3 text-sm text-white placeholder-slate-600 outline-none transition"
            placeholder="Enter client or event name"
            value={metrics.clientName}
            onChange={(e) => handleFieldChange("clientName", e.target.value)}
          />
        </div>

        {/* Event Type & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              Event Type
            </label>
            <select
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg py-2 px-3 text-sm text-white outline-none transition cursor-pointer"
              value={metrics.eventType}
              onChange={(e) => handleFieldChange("eventType", e.target.value)}
            >
              <option value="" disabled>Choose Event Type</option>
              {EVENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Event Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg py-1.5 px-3 text-sm text-white outline-none transition cursor-pointer"
              value={metrics.eventDate}
              onChange={(e) => handleFieldChange("eventDate", e.target.value)}
            />
          </div>
        </div>

        {/* Location / Venue & Currency Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Venue Location / City <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg py-2 px-3 text-sm text-white placeholder-slate-600 outline-none transition"
              placeholder="e.g., Jubilee Hills, Hyderabad"
              value={metrics.venue}
              onChange={(e) => handleFieldChange("venue", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              Currency
            </label>
            <select
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg py-2 px-3 text-sm text-white outline-none transition cursor-pointer"
              value={metrics.currencyCode}
              onChange={(e) => handleFieldChange("currencyCode", e.target.value)}
            >
              {AVAILABLE_CURRENCIES.map(curr => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} ({curr.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Guest Count & Budget Slider */}
        <div className="space-y-4 bg-slate-950 border border-slate-800/80 rounded-xl p-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Guaranteed Guest Capacity
              </label>
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                {metrics.guests || 0} guests
              </span>
            </div>
            
            {/* Quick manual numeric input for exact guest count specification */}
            <input
              type="number"
              min="1"
              placeholder="Type capacity manually (e.g. 500)"
              className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg py-1.5 px-3 text-xs text-white outline-none transition shadow-inner font-mono text-blue-400 mb-2"
              value={metrics.guests === 0 ? "" : metrics.guests}
              onChange={(e) => handleFieldChange("guests", Number(e.target.value))}
            />

            <input
              type="range"
              min="10"
              max="2000"
              step="10"
              className="w-full accent-blue-500 cursor-pointer"
              value={metrics.guests || 10}
              onChange={(e) => handleFieldChange("guests", Number(e.target.value))}
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>10 guests</span>
              <span>500</span>
              <span>1000</span>
              <span>2000+ guests</span>
            </div>
          </div>

          <hr className="border-slate-800" />

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                Target Budget Limit
              </label>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {currentCurrency.symbol}{(metrics.budget || 0).toLocaleString()}
              </span>
            </div>
            <input
              type="number"
              className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg py-1.5 px-3 text-sm text-white outline-none transition shadow-inner font-mono text-emerald-400"
              value={metrics.budget === 0 ? "" : metrics.budget}
              onChange={(e) => handleFieldChange("budget", Number(e.target.value))}
              placeholder="Specify manual budget ceiling"
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              {[50000, 200000, 500000, 1500000, 5000055].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleFieldChange("budget", val)}
                  className={`text-[10px] px-2 py-1 rounded transition border cursor-pointer ${
                    metrics.budget === val
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                  }`}
                >
                  {currentCurrency.symbol}{val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Curated Package Config */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
            Target Package Tier
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PACKAGE_TIERS.map(tier => (
              <button
                key={tier.value}
                type="button"
                onClick={() => handleFieldChange("packageType", tier.value)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  metrics.packageType === tier.value
                    ? "bg-blue-500/10 border-blue-500 text-white shadow-md shadow-blue-500/5"
                    : "bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <div className="text-xs font-bold text-white">{tier.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{tier.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Curated Services Matrix Grid */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium text-slate-300">
              Curated Service Scope ({metrics.services.length} selected)
            </label>
            <div className="flex gap-2 text-[10px] text-blue-400">
              <button type="button" onClick={selectAllServices} className="hover:underline cursor-pointer">Select All</button>
              <span>•</span>
              <button type="button" onClick={clearServices} className="hover:underline cursor-pointer">Clear All</button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {AVAILABLE_SERVICES.map(s => {
              const selected = metrics.services.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleService(s.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition cursor-pointer ${
                    selected
                      ? "bg-blue-500/15 border-blue-500/80 text-blue-300 font-semibold"
                      : "bg-slate-950/80 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-300"
                  }`}
                >
                  <div className={`p-1 rounded-md ${selected ? "bg-blue-500/20 text-blue-300" : "bg-slate-900 text-slate-500"}`}>
                    <span className="text-xs">
                      {/* Placeholder representation since dynamic rendering of icons requires standard object indexing */}
                      {s.id === "Catering" && "🍽️"}
                      {s.id === "Decoration" && "✨"}
                      {s.id === "Photography" && "📷"}
                      {s.id === "DJ & Entertainment" && "🎵"}
                      {s.id === "Lighting" && "💡"}
                      {s.id === "Stage Setup" && "🧱"}
                      {s.id === "Seating Arrangement" && "🪑"}
                      {s.id === "Security" && "🛡️"}
                      {s.id === "Guest Management" && "📋"}
                      {s.id === "Accommodation" && "🏨"}
                      {s.id === "Transportation" && "🚗"}
                      {s.id === "Invitation Design" && "✉️"}
                      {s.id === "Live Streaming" && "🎥"}
                    </span>
                  </div>
                  <span className="truncate">{s.label}</span>
                </button>
              );
            })}
          </div>
          {metrics.services.length === 0 && (
            <p className="text-[10px] text-amber-400 mt-1">
              ⚠️ Please pick at least one core service category before analyzing.
            </p>
          )}
        </div>

        {/* Additional Requirements */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Special Instructions / Upgrades
          </label>
          <textarea
            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-600 outline-none transition resize-none h-16"
            placeholder="e.g., Prefers white roses decor, vegan catering tier, or double photography angles..."
            value={metrics.additionalRequirements}
            onChange={(e) => handleFieldChange("additionalRequirements", e.target.value)}
          />
        </div>

        {/* Global Taxes & Discounts */}
        <div className="grid grid-cols-2 gap-4 bg-slate-950/50 p-3 rounded-xl border border-slate-900">
          <div>
            <label className="block text-[10px] font-medium text-slate-400 mb-1">
              Estimated VAT/GST (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded py-1 px-2 text-xs font-mono text-slate-300"
              value={metrics.taxRate}
              onChange={(e) => handleFieldChange("taxRate", Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-400 mb-1">
              Preferred Discount (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded py-1 px-2 text-xs font-mono text-slate-300"
              value={metrics.discountRate}
              onChange={(e) => handleFieldChange("discountRate", Number(e.target.value))}
            />
          </div>
        </div>

        {/* Dynamic Action Button */}
        <button
          type="button"
          disabled={loading || metrics.services.length === 0}
          onClick={onGenerate}
          className={`w-full py-3.5 px-4 rounded-xl font-display font-medium text-sm tracking-wide transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
            loading
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/35 hover:-translate-y-0.5 active:translate-y-0 animate-pulse"
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-slate-300 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Drafting Custom Proposal...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Compile Bespoke Proposal</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
