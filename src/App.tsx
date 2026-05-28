import React, { useState, useEffect } from "react";
import { 
  InputMetrics, 
  Quotation, 
  QuoteItem,
  AVAILABLE_CURRENCIES, 
  AVAILABLE_SERVICES 
} from "./types";
import MetricInputs from "./components/MetricInputs";
import AIRecommendations from "./components/AIRecommendations";
import { 
  Download, 
  Share2, 
  Edit2, 
  Check, 
  Plus, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  TrendingDown, 
  MessageSquare, 
  Mail, 
  DollarSign, 
  FileText, 
  AlertCircle,
  Copy,
  Sliders,
  ExternalLink,
  Crown,
  MapPin,
  Clock,
  Sparkles,
  Utensils,
  Music,
  Camera,
  Lightbulb,
  Layers,
  Armchair,
  Shield,
  Users,
  Hotel,
  Car,
  Video,
  Activity
} from "lucide-react";

const getServiceIcon = (serviceName: string) => {
  const normalizedSvc = AVAILABLE_SERVICES.find(s => s.id === serviceName)?.id || serviceName;
  switch (normalizedSvc) {
    case "Catering":
      return <Utensils className="w-4 h-4 text-amber-500" />;
    case "Decoration":
      return <Sparkles className="w-4 h-4 text-indigo-500" />;
    case "Photography":
      return <Camera className="w-4 h-4 text-blue-500" />;
    case "DJ & Entertainment":
      return <Music className="w-4 h-4 text-fuchsia-400" />;
    case "Lighting":
      return <Lightbulb className="w-4 h-4 text-yellow-500" />;
    case "Stage Setup":
      return <Layers className="w-4 h-4 text-cyan-500" />;
    case "Seating Arrangement":
      return <Armchair className="w-4 h-4 text-orange-400" />;
    case "Security":
      return <Shield className="w-4 h-4 text-rose-500" />;
    case "Guest Management":
      return <Users className="w-4 h-4 text-emerald-500" />;
    case "Accommodation":
      return <Hotel className="w-4 h-4 text-teal-500" />;
    case "Transportation":
      return <Car className="w-4 h-4 text-rose-400" />;
    case "Invitation Design":
      return <Mail className="w-4 h-4 text-pink-400" />;
    case "Live Streaming":
      return <Video className="w-4 h-4 text-purple-500" />;
    default:
      return <Activity className="w-4 h-4 text-slate-400" />;
  }
};

export default function App() {
  // Configured default empty input states as requested (no pre-filled mock values)
  const [metrics, setMetrics] = useState<InputMetrics>({
    clientName: "",
    eventType: "Wedding",
    eventDate: "",
    venue: "",
    guests: 100,
    budget: 250000,
    services: [],
    packageType: "Standard",
    additionalRequirements: "",
    currencyCode: "INR",
    taxRate: 18,
    discountRate: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  
  // Clean offline original copy to restore if edited
  const [originalQuotation, setOriginalQuotation] = useState<Quotation | null>(null);
  
  // State for interactive inline editing of PDF Quote Sheet
  const [isEditMode, setIsEditMode] = useState(false);
  const [appliedOptimizationKeys, setAppliedOptimizationKeys] = useState<string[]>([]);
  
  // Custom manual adjustment line items added/modified by user
  const [editedItems, setEditedItems] = useState<QuoteItem[]>([]);
  const [customDiscounts, setCustomDiscounts] = useState<{ label: string; amount: number }[]>([]);

  // System alert / feedback states
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "info" | "warning"; text: string } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // We do NOT auto-trigger initial sample generation anymore, let the user enter details!
  useEffect(() => {
    // Initial mount is intentionally clean and blank
  }, []);

  const triggerAlert = (text: string, type: "success" | "info" | "warning" = "success") => {
    setAlertMsg({ text, type });
    setTimeout(() => {
      setAlertMsg(null);
    }, 4000);
  };

  const generateQuotation = async () => {
    setLoading(true);
    setError(null);
    setIsEditMode(false);
    setAppliedOptimizationKeys([]);
    setCustomDiscounts([]);

    try {
      const response = await fetch("/api/quotation/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metrics)
      });

      if (!response.ok) {
        throw new Error("Failure generating customized proposal. Review parameters and try again.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setQuotation(data.quotation);
      setOriginalQuotation(data.quotation);
      setEditedItems(data.quotation.items);
      triggerAlert("New intelligent Sales Quotation generated successfully!", "success");
    } catch (err: any) {
      setError(err.message || "An unexpected system transition occurred.");
    } finally {
      setLoading(false);
    }
  };

  const currentCurrency = AVAILABLE_CURRENCIES.find(c => c.code === metrics.currencyCode) || AVAILABLE_CURRENCIES[0];

  // Apply Cost Optimization dynamically from AI panel
  const handleApplyOptimization = (opt: any) => {
    if (appliedOptimizationKeys.includes(opt.actionKey)) return;

    setAppliedOptimizationKeys(prev => [...prev, opt.actionKey]);
    
    // Add as a dynamic system discount
    setCustomDiscounts(prev => [
      ...prev,
      { label: `AI Optimization: ${opt.title}`, amount: opt.estimatedSaving }
    ]);

    triggerAlert(`Applied optimization: ${opt.title}. Adjusted final cost dynamically!`, "success");
  };

  // Restores original quotation parameters
  const handleResetQuotation = () => {
    if (originalQuotation) {
      setEditedItems(originalQuotation.items);
      setCustomDiscounts([]);
      setAppliedOptimizationKeys([]);
      setIsEditMode(false);
      triggerAlert("Reverted back to full AI-engineered default parameters.");
    }
  };

  // Update specific field in table editable item
  const handleItemFieldChange = (index: number, key: keyof QuoteItem, value: any) => {
    const updated = [...editedItems];
    if (key === "quantity" || key === "unitPrice") {
      const val = Number(value) || 0;
      updated[index] = {
        ...updated[index],
        [key]: val,
        total: Math.round((key === "quantity" ? val : updated[index].quantity) * (key === "unitPrice" ? val : updated[index].unitPrice))
      };
    } else {
      updated[index] = {
        ...updated[index],
        [key]: value
      };
    }
    setEditedItems(updated);
  };

  // Add a new custom custom row to the layout
  const handleAddNewRow = () => {
    const newRow: QuoteItem = {
      service: "Custom Upgrade",
      description: "Additional operational spec or bespoke client custom request.",
      quantity: 1,
      unitPrice: 5000,
      total: 5000
    };
    setEditedItems(prev => [...prev, newRow]);
    triggerAlert("Bespoke custom specification added to line-item log.");
  };

  // Remove a row from quotation
  const handleRemoveRow = (index: number) => {
    const term = editedItems[index].service;
    setEditedItems(prev => prev.filter((_, i) => i !== index));
    triggerAlert(`Removed "${term}" from active parameters.`);
  };

  // Print PDF Trigger using perfect print utility classes
  const handlePrintQuotation = () => {
    window.print();
  };

  // Calculate totals realistically on the client-side for immediate responsive values
  const itemsSubtotal = editedItems.reduce((acc, curr) => acc + curr.total, 0);
  const optimizationDiscountSum = customDiscounts.reduce((acc, curr) => acc + curr.amount, 0);
  const rateDiscountVal = Math.round(itemsSubtotal * (metrics.discountRate / 100));
  const totalDiscounts = optimizationDiscountSum + rateDiscountVal;
  
  const subtotalAfterDiscounts = Math.max(0, itemsSubtotal - totalDiscounts);
  const taxAmount = Math.round(subtotalAfterDiscounts * (metrics.taxRate / 100));
  const grandTotal = subtotalAfterDiscounts + taxAmount;

  // Feasibility status badge styles
  const getFeasibilityColor = (status: string) => {
    switch (status) {
      case "optimal":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      case "stretched":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case "insufficient":
        return "bg-rose-500/10 border-rose-500/30 text-rose-400";
      default:
        return "bg-slate-500/10 border-slate-500/30 text-slate-400";
    }
  };

  // Social / Email Share simulated action
  const formatShareMessage = (channel: 'whatsapp' | 'email') => {
    const message = `Check out this digital professional quotation EV-${quotation?.quotationId || "PREVIEW"} for ${metrics.clientName}'s ${metrics.eventType}.\nTotal Estimate: ${currentCurrency.symbol}${grandTotal.toLocaleString()}\nVenue: ${metrics.venue}\nDate: ${metrics.eventType}`;
    if (channel === 'whatsapp') {
      return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    } else {
      return `mailto:?subject=${encodeURIComponent("Corporate Event Proposal Estimate")}&body=${encodeURIComponent(message)}`;
    }
  };

  const handleCopyClipboard = () => {
    const summary = `Proposal ID: EV-${quotation?.quotationId}\nClient: ${metrics.clientName}\nEvent: ${metrics.eventType}\nGrand Total: ${currentCurrency.symbol}${grandTotal.toLocaleString()}`;
    navigator.clipboard.writeText(summary);
    triggerAlert("Summary copied to system clipboard!", "success");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col antialiased">
      {/* Top Banner Action Panel - Handcrafted unified design to blend with the sidebar and application */}
      <header className="no-print h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 lg:px-8 shadow-md sticky top-0 z-40 text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-display font-black text-sm shadow-inner">
            P
          </div>
          <div>
            <h1 className="font-display font-medium text-white text-sm tracking-tight flex items-center gap-1.5">
              Premier Creative Studio
              <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                Bespoke Planner
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Handcrafted event design & budget planners</p>
          </div>
        </div>

        {/* Global Feedback notifications */}
        {alertMsg && (
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border bg-emerald-950/40 border-emerald-800/60 text-emerald-300 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{alertMsg.text}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {quotation && (
            <>
              <button 
                type="button"
                onClick={handleResetQuotation}
                className="px-3.5 py-2 border border-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-800/80 transition-colors flex items-center gap-1.5 text-slate-300 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>
              
              <button 
                type="button"
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-3.5 py-2 border rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isEditMode 
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
                    : "border-slate-800 hover:bg-slate-800/80 text-slate-300"
                }`}
              >
                {isEditMode ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5 text-slate-400" />}
                <span>{isEditMode ? "Finish Editing" : "Editable Quote"}</span>
              </button>

              <button 
                type="button"
                onClick={() => setShowShareModal(true)}
                className="px-3.5 py-2 border border-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-800/80 transition-colors flex items-center gap-1.5 text-slate-300 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Share</span>
              </button>
            </>
          )}

          <button 
            type="button"
            onClick={handlePrintQuotation}
            disabled={!quotation}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold active:scale-95 transition flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-40 disabled:hover:bg-blue-605"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </header>

      {/* Main Grid Section */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Input Sidebar Panel */}
        <aside className="no-print w-full lg:w-96 bg-slate-950 text-slate-300 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-900 max-h-none lg:max-h-[calc(100vh-64px)] overflow-y-auto p-5 space-y-6">
          <MetricInputs 
            metrics={metrics}
            onChange={setMetrics}
            onGenerate={generateQuotation}
            loading={loading}
          />

          {quotation && (
            <AIRecommendations 
              suggestions={quotation.aiOptimizations}
              onApply={handleApplyOptimization}
              appliedKeys={appliedOptimizationKeys}
              currencySymbol={currentCurrency.symbol}
            />
          )}

          {/* Quick Stats Panel */}
          <div className="bg-slate-900/40 p-4 border border-slate-900/80 rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Cost Estimation Summary</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Target Range</span>
                <span className="font-mono text-white">{currentCurrency.symbol}{metrics.budget.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Predicted Setup Cost</span>
                <span className={`font-semibold font-mono ${grandTotal > metrics.budget ? "text-amber-400" : "text-emerald-400"}`}>
                  {currentCurrency.symbol}{grandTotal.toLocaleString()}
                </span>
              </div>

              {/* Visual mini track bar */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span>Deviation Margin</span>
                  <span>
                    {grandTotal > metrics.budget 
                      ? `+${Math.round(((grandTotal - metrics.budget) / metrics.budget) * 100)}%`
                      : `-${Math.round(((metrics.budget - grandTotal) / metrics.budget) * 100)}% under`
                    }
                  </span>
                </div>
                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      grandTotal > metrics.budget ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, (grandTotal / metrics.budget) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-[10px] text-slate-600 font-mono text-center pt-2">
            Premier Events Co. • Handcrafted & Verified
          </div>
        </aside>

        {/* Right Preview Document Panel */}
        <main className="flex-1 p-4 lg:p-8 flex flex-col justify-start items-center overflow-y-auto bg-slate-100">
          {error && (
            <div className="no-print w-full max-w-3xl bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-start gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Quotation Engine Diagnostic Stalled</h4>
                <p className="text-xs text-rose-700 mt-1">{error}</p>
                <button 
                  onClick={generateQuotation} 
                  className="mt-2 text-xs font-bold text-rose-900 underline hover:text-rose-950 cursor-pointer"
                >
                  Retry Analysis Stack
                </button>
              </div>
            </div>
          )}

          {/* Quick helper tip banner */}
          {quotation && !isEditMode && (
            <div className="no-print w-full max-w-3xl bg-blue-50 border border-blue-100 text-blue-800 p-3.5 rounded-xl flex items-center justify-between mb-4 shadow-3xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <p className="text-xs font-medium">
                  <strong>Tip:</strong> Need to customize prices, names, or add additional line items? Click the <strong>"Editable Quote"</strong> button in the header bar.
                </p>
              </div>
              <button 
                onClick={() => setIsEditMode(true)}
                className="text-xs font-bold bg-blue-600 text-white px-2.5 py-1 rounded-md hover:bg-blue-700 transition cursor-pointer"
              >
                Configure
              </button>
            </div>
          )}

          {/* Live Mobile alert banner */}
          {alertMsg && (
            <div className="md:hidden no-print w-full max-w-3xl bg-slate-900 text-white p-3 rounded-lg text-center text-xs font-medium mb-4">
              {alertMsg.text}
            </div>
          )}

          {/* Master Quotation Document Sheet A4 */}
          {quotation ? (
            <div className="print-container bg-white w-full max-w-3xl min-h-[920px] shadow-xl hover:shadow-2xl transition-all duration-300 p-6 sm:p-10 border border-slate-100 rounded-sm relative text-slate-800 flex flex-col justify-between">
              
              {/* Draft Watermark in edit mode */}
              {isEditMode && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none -rotate-12 pointer-events-none opacity-[0.035] text-slate-900 font-display font-black text-6xl sm:text-8xl tracking-widest uppercase text-center space-y-2">
                  <div>Draft</div>
                  <div className="text-3xl sm:text-4xl">Editing Active</div>
                </div>
              )}

              <div>
                {/* Header Branding Panel */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 pb-6 mb-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center font-display text-white text-[10px] font-extrabold pr-0.5">
                        PE
                      </div>
                      <span className="font-display font-extrabold text-base tracking-tighter text-slate-950">
                        PREMIER EVENTS CO.
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Quotation ID: <span className="font-semibold text-slate-600">#EV-2026-{quotation.quotationId.split("-")[2] || "9482"}</span> • Hand-Craftated Estimate
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Date Generated: <span className="text-slate-600">{quotation.dateGenerated}</span>
                    </p>
                  </div>

                  <div className="text-right text-[10px] text-slate-500 font-mono leading-relaxed space-y-0.5">
                    <p className="font-bold text-slate-800">PREMIER HEADQUARTERS</p>
                    <p>12/4 Jubilee Hills Executive Park, Hyderabad</p>
                    <p>contact@premierevents.in</p>
                    <p>+91 98877 66554</p>
                  </div>
                </div>

                {/* Client Profile and Alignment Banner Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Profile</h4>
                    <p className="text-sm font-bold text-slate-950">{metrics.clientName || "Bespoke Event Customer"}</p>
                    
                    <div className="text-xs text-slate-600 space-y-1 pt-1 font-mono">
                      <p className="flex items-center gap-1">
                        <span className="text-slate-400">📅 Date:</span> <span>{metrics.eventDate ? new Date(metrics.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "Upon Consultation"}</span>
                      </p>
                      <p className="flex items-center gap-1 flex-wrap">
                        <span className="text-slate-400">📍 Venue:</span> <span>{metrics.venue || "To be decided"}</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <span className="text-slate-400">👥 Guests:</span> <span className="font-semibold text-slate-900">{metrics.guests || 0} capacity</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <span className="text-slate-400">🏷️ Event:</span> <span className="capitalize">{metrics.eventType}</span>
                      </p>
                    </div>
                  </div>

                  {/* recommended package & feasibility alignment index card */}
                  <div className="bg-[#FAFBFD] p-4 rounded-xl border border-blue-50/80 space-y-3.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 bg-blue-50 px-2 py-0.5 rounded-full w-max text-blue-700 font-mono text-[9px] font-bold">
                        <Crown className="w-2.5 h-2.5" />
                        <span>Recommended Custom Match</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 italic">
                        {quotation.recommendedPackage.name} Level
                      </p>
                      <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                        {quotation.recommendedPackage.reasoning}
                      </p>
                    </div>

                    <div className="border-t border-slate-100/80 pt-2 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">Budget Alignment</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border ${getFeasibilityColor(quotation.feasibility.status)}`}>
                            {quotation.feasibility.status}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-600">
                             ({quotation.feasibility.probability}% alignment)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Requirements Summary */}
                <div className="bg-slate-50/50 p-3.5 rounded-lg border border-slate-100 mb-6 text-xs text-slate-600 leading-relaxed italic">
                  <span className="font-semibold text-slate-800 not-italic block text-[10px] uppercase tracking-wider mb-0.5">Operational Overview</span>
                  "{quotation.requirementsSummary}"
                </div>

                {/* Primary Quote Table */}
                <div className="mb-6 space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detailed Curated Line-Items</h5>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={handleAddNewRow}
                        className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Custom Line</span>
                      </button>
                    )}
                  </div>

                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
                          <th className="py-2.5 px-3 font-semibold w-1/4">Service Category</th>
                          <th className="py-2.5 px-3 font-semibold w-2/5">Descriptive Specification / Deliverables</th>
                          <th className="py-2.5 px-3 font-semibold text-right w-1/12">Qty</th>
                          <th className="py-2.5 px-3 font-semibold text-right w-1/6">Unit Rate ({currentCurrency.symbol})</th>
                          <th className="py-2.5 px-3 font-semibold text-right w-1/6">Total ({currentCurrency.symbol})</th>
                          {isEditMode && <th className="py-2.5 px-2 text-center w-10"></th>}
                        </tr>
                      </thead>
                      <tbody className="text-xs text-slate-700 divide-y divide-slate-50">
                        {editedItems.map((item, index) => (
                          <tr key={index} className="hover:bg-slate-50/40 transition">
                            <td className="py-2 px-3 font-medium text-slate-900">
                              <div className="flex items-center gap-2.5">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200/60 shadow-xs">
                                  {getServiceIcon(item.service)}
                                </div>
                                <div className="flex-grow">
                                  {isEditMode ? (
                                    <input
                                      type="text"
                                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded px-2 py-1 text-xs text-slate-900 font-semibold"
                                      value={item.service}
                                      onChange={(e) => handleItemFieldChange(index, "service", e.target.value)}
                                    />
                                  ) : (
                                    <span className="text-slate-900 font-medium tracking-tight text-xs">{item.service}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-slate-500 font-light leading-relaxed">
                              {isEditMode ? (
                                <textarea
                                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded px-2 py-1 text-xs text-slate-600 resize-none h-12"
                                  value={item.description}
                                  onChange={(e) => handleItemFieldChange(index, "description", e.target.value)}
                                />
                              ) : (
                                item.description
                              )}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {isEditMode ? (
                                <input
                                  type="number"
                                  min="1"
                                  className="w-16 bg-slate-50 border border-slate-200 focus:bg-white rounded px-1.5 py-1 text-xs text-right font-mono"
                                  value={item.quantity}
                                  onChange={(e) => handleItemFieldChange(index, "quantity", e.target.value)}
                                />
                              ) : (
                                <span className="font-mono">{item.quantity}</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right font-mono">
                              {isEditMode ? (
                                <input
                                  type="number"
                                  className="w-24 bg-slate-50 border border-slate-200 focus:bg-white rounded px-1.5 py-1 text-xs text-right font-mono"
                                  value={item.unitPrice}
                                  onChange={(e) => handleItemFieldChange(index, "unitPrice", e.target.value)}
                                />
                              ) : (
                                <span>{item.unitPrice.toLocaleString()}</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                              {item.total.toLocaleString()}
                            </td>
                            {isEditMode && (
                              <td className="py-2 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRow(index)}
                                  className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1 rounded transition cursor-pointer"
                                  title="Delete item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}

                        {editedItems.length === 0 && (
                          <tr>
                            <td colSpan={isEditMode ? 6 : 5} className="py-12 text-center text-slate-400 text-xs italic">
                              No services currently assigned. Please add standard line items or check input filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Active bespoke recommendations/discounts */}
                {customDiscounts.length > 0 && (
                  <div className="mb-6 p-4 border border-slate-100 bg-slate-50/60 rounded-xl flex items-start gap-3">
                    <div className="w-5 h-5 flex-shrink-0 bg-slate-900 rounded-full flex items-center justify-center text-white font-sans font-bold text-[10px]">
                      PR
                    </div>
                    <div className="space-y-1.5 flex-grow">
                      <h5 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Applied Proposal Recommendations</h5>
                      <div className="space-y-1 text-slate-700 text-[11px] font-mono pr-2">
                        {customDiscounts.map((discount, dIdx) => (
                           <div key={dIdx} className="flex justify-between items-center text-slate-700">
                             <span>🗸 {discount.label}</span>
                             <span className="font-semibold text-slate-900">-{currentCurrency.symbol}{discount.amount.toLocaleString()}</span>
                           </div>
                        ))}
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        setCustomDiscounts([]);
                        setAppliedOptimizationKeys([]);
                        triggerAlert("Cleared custom discount metrics.");
                      }}
                      className="text-[9px] text-slate-500 hover:text-slate-800 hover:underline cursor-pointer self-start font-semibold uppercase"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Subtotal, tax totals column & Terms Summary */}
              <div className="border-t border-slate-350 pt-5 mt-4 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                  {/* Left block notes and duration parameters */}
                  <div className="space-y-2 max-w-sm">
                    <h5 className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Premium Event Protocols & Terms</h5>
                    <ul className="text-[10px] text-slate-500 space-y-1 font-sans list-disc list-inside leading-relaxed">
                      {quotation.terms.map((term, tIdx) => (
                        <li key={tIdx} className="line-clamp-2">{term}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Right block dynamic calculations summary */}
                  <div className="w-full sm:w-64 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-slate-500">
                      <span>Item Subtotal:</span>
                      <span className="text-slate-800">{currentCurrency.symbol}{itemsSubtotal.toLocaleString()}</span>
                    </div>

                    {totalDiscounts > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Applied Discounts:</span>
                        <span>-{currentCurrency.symbol}{totalDiscounts.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-500">
                      <span>GST / VAT ({metrics.taxRate}%):</span>
                      <span className="text-slate-800">{currentCurrency.symbol}{taxAmount.toLocaleString()}</span>
                    </div>

                    <hr className="border-slate-100" />

                    <div className="flex justify-between text-base font-bold text-slate-950 pt-1.5">
                      <span className="font-display font-black">Grand Total:</span>
                      <span className="font-mono text-lg">{currentCurrency.symbol}{grandTotal.toLocaleString()}</span>
                    </div>

                    <div className="text-[9px] text-slate-400 uppercase tracking-wider text-right pt-1 font-sans font-medium">
                      Estimate in {metrics.currencyCode}
                    </div>
                  </div>
                </div>

                {/* Closing note */}
                <div className="border-t border-slate-100 pt-4 text-center">
                  <p className="text-[10px] text-slate-500 italic">
                    "{quotation.closingNote}"
                  </p>
                  <p className="text-[8px] text-slate-400 mt-2 font-mono uppercase tracking-widest">
                    Crafted with care by Premier Events Creative Team
                  </p>
                </div>
              </div>

            </div>
          ) : (
            // Immersed Empty placeholder block
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white border border-dashed border-slate-200 rounded-2xl w-full max-w-3xl min-h-[500px]">
              <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4 animate-pulse">
                <Sliders className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="font-display font-bold text-slate-800 text-base">Generate Professional Event Proposals</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">
                Connect real-time client parameters and service bounds. Our system checks budget feasibility, recommends standard packages, and builds pristine estimate tables instantly.
              </p>
              
              <button 
                type="button"
                onClick={generateQuotation}
                disabled={loading}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                {loading ? "Constructing Intelligence Model..." : "Generate Proposal Sample"}
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Share Actions Modal */}
      {showShareModal && (
        <div className="no-print fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-100 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-display font-bold text-slate-950 text-sm">Distribute Event Quotation</h4>
                <p className="text-xs text-slate-500">Send estimate instantly to your customer.</p>
              </div>
              <button 
                type="button"
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <a 
                href={formatShareMessage('whatsapp')} 
                target="_blank" 
                rel="noreferrer"
                onClick={() => setShowShareModal(false)}
                className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100/70 text-emerald-800 rounded-xl text-xs font-semibold tracking-wide transition flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Transmit via WhatsApp</span>
                <ExternalLink className="w-3 h-3 text-emerald-600 ml-auto" />
              </a>

              <a 
                href={formatShareMessage('email')}
                onClick={() => setShowShareModal(false)}
                className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100/70 text-blue-850 rounded-xl text-xs font-semibold tracking-wide transition flex items-center gap-2"
              >
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Send Professional Email</span>
                <ExternalLink className="w-3 h-3 text-blue-600 ml-auto" />
              </a>

              <button 
                type="button" 
                onClick={() => {
                  handleCopyClipboard();
                  setShowShareModal(false);
                }}
                className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold tracking-wide transition flex items-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4 text-slate-600" />
                <span>Copy Summary Clipboard</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed font-light">
              Proposals are also saved to the regional cloud repository automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}




