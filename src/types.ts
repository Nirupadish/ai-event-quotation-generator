export interface QuoteItem {
  service: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Feasibility {
  status: "optimal" | "stretched" | "insufficient";
  probability: number;
  analysisCommentary: string;
}

export interface RecommendedPackage {
  name: string;
  reasoning: string;
}

export interface AIOptimization {
  title: string;
  description: string;
  estimatedSaving: number;
  actionKey: string;
}

export interface Quotation {
  feasibility: Feasibility;
  quotationId: string;
  dateGenerated: string;
  requirementsSummary: string;
  items: QuoteItem[];
  recommendedPackage: RecommendedPackage;
  aiOptimizations: AIOptimization[];
  terms: string[];
  closingNote: string;
}

export interface InputMetrics {
  clientName: string;
  eventType: string;
  eventDate: string;
  venue: string;
  guests: number;
  budget: number;
  services: string[];
  packageType: string;
  additionalRequirements: string;
  currencyCode: string;
  taxRate: number;
  discountRate: number;
}

export const AVAILABLE_CURRENCIES = [
  { code: "INR", symbol: "₹" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "AED", symbol: "د.إ" },
  { code: "GBP", symbol: "£" }
];

export const AVAILABLE_SERVICES = [
  { id: "Catering", label: "Catering", icon: "Utensils" },
  { id: "Decoration", label: "Decoration", icon: "Sparkles" },
  { id: "Photography", label: "Photography & Video", icon: "Camera" },
  { id: "DJ & Entertainment", label: "DJ & Entertainment", icon: "Music" },
  { id: "Lighting", label: "Lighting setup", icon: "Lightbulb" },
  { id: "Stage Setup", label: "Stage Setup", icon: "Layers" },
  { id: "Seating Arrangement", label: "Seating Arrangement", icon: "Armchair" },
  { id: "Security", label: "Event Security", icon: "Shield" },
  { id: "Guest Management", label: "Guest Management", icon: "Contact" },
  { id: "Accommodation", label: "Guest Accommodation", icon: "Hotel" },
  { id: "Transportation", label: "Premium Transportation", icon: "Car" },
  { id: "Invitation Design", label: "Invitation Design", icon: "Mail" },
  { id: "Live Streaming", label: "High-def Live Streaming", icon: "Play" }
];

export const PACKAGE_TIERS = [
  { name: "Basic Package", value: "Basic", desc: "Essential setups & reliable support" },
  { name: "Standard Package", value: "Standard", desc: "Elegant defaults & smooth operations" },
  { name: "Premium Package", value: "Premium", desc: "Top tier catering, design & live support" },
  { name: "Luxury Package", value: "Luxury", desc: "No-compromise boutique bespoke design" }
];

export const EVENT_TYPES = [
  "Wedding",
  "Corporate Gala",
  "Product Launch",
  "Birthday Milestone",
  "Private Anniversary",
  "Conference / Seminar",
  "Fashion Showcase",
  "Charity Auction"
];
