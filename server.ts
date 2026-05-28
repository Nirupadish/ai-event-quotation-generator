import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini client setup
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required in secrets setup.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Check if Gemini API key is available
app.get("/api/config", (req, res) => {
  res.json({
    hasApiKey: !!process.env.GEMINI_API_KEY,
    appUrl: process.env.APP_URL || "http://localhost:3000"
  });
});

// Quotation generation endpoint (AI-powered with responsive schemas)
app.post("/api/quotation/generate", async (req, res) => {
  const {
    clientName,
    eventType,
    eventDate,
    venue,
    guests,
    budget,
    services, // array of strings
    packageType,
    additionalRequirements,
    currencySymbol = "₹",
    currencyCode = "INR",
    taxRate = 18,
    discountRate = 0
  } = req.body;

  // Input validation
  if (!clientName || !eventType || !eventDate || !venue || !guests || !budget) {
    return res.status(400).json({ error: "Missing required client or event metrics." });
  }

  // Ensure services contains at least something
  const selectedServices = services && services.length > 0 ? services : ["Catering", "Decoration", "Photography"];

  const hasApiKey = !!process.env.GEMINI_API_KEY;

  if (!hasApiKey) {
    // Elegant fallback mode so the application remains robust even if secret is missing on initial setup.
    // Generates realistic numbers based on budget, package type, etc.
    const estTotalBase = Number(budget) * 0.9;
    const itemShare = 1 / selectedServices.length;
    const fallbackItems = selectedServices.map((service: string, idx: number) => {
      const sharePrice = Math.round((estTotalBase * itemShare) * (0.85 + (idx % 3) * 0.15));
      return {
        service,
        description: `Full-service professional ${service.toLowerCase()} packages customized for ${guests} guests in ${venue}.`,
        quantity: guests,
        unitPrice: Math.round(sharePrice / guests),
        total: sharePrice
      };
    });

    const isFeasible = Number(budget) >= estTotalBase;
    const probability = isFeasible ? 85 : 45;

    return res.json({
      fallback: true,
      quotation: {
        feasibility: {
          status: isFeasible ? "optimal" : "stretched",
          probability,
          analysisCommentary: `[Simulated Model Result - API Key Missing] Based on standard operational metrics, a budget of ${currencySymbol}${Number(budget).toLocaleString()} for ${guests} guests is ${isFeasible ? "well-aligned" : "highly streamlined"}. Catering and general ambient styling can be accommodated easily.`
        },
        quotationId: `EV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        dateGenerated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        requirementsSummary: `The client requires a tailored ${eventType.toLowerCase()} setup for ${guests} guests at ${venue}, specifying a target package tier of '${packageType}' with a budget boundary of ${currencySymbol}${Number(budget).toLocaleString()}. Included services: ${selectedServices.join(", ")}.`,
        items: fallbackItems,
        recommendedPackage: {
          name: packageType || "Standard Theme",
          reasoning: `The ${packageType || "Standard"} tier presents the best balance of custom item curation and quality milestones within the defined caps.`
        },
        aiOptimizations: [
          {
            title: "Transition to Digital Invites",
            description: "Shift premium screen print invitations to rich-media custom RSVP micro-portals.",
            estimatedSaving: Math.round(Number(budget) * 0.03),
            actionKey: "invitation"
          },
          {
            title: "Menu Course Consolidation",
            description: "Consolidate double desserts into single premium interactive food-station models.",
            estimatedSaving: Math.round(Number(budget) * 0.08),
            actionKey: "catering"
          },
          {
            title: "Vendor Bundle Logistics",
            description: "Source lighting and photography packages from verified single-firm regional coordinators.",
            estimatedSaving: Math.round(Number(budget) * 0.05),
            actionKey: "photography"
          }
        ],
        terms: [
          "50% advance booking fee strictly required to lock final wedding date and vendor arrangements.",
          "Catering, decoration setups, and layout finalized 14 days before the scheduled date.",
          "Date modifications are valid up to 30 days prior, subject to venue availability.",
          "Any physical damages to rentals/equipment to be compensated at actual recovery costs."
        ],
        closingNote: "We look forward to rendering a truly grand and pristine celebration experience. Let's establish your timeline today!"
      }
    });
  }

  try {
    const ai = getGeminiClient();

    // Construct detailed structured prompt
    const prompt = `
Generate a highly detailed corporate event sales quotation recommendation as a Senior Event Budget Consultant.
The client parameters are:
- Client Name: ${clientName}
- Event Type: ${eventType}
- Event Date: ${eventDate}
- Venue Location: ${venue}
- Guest Count: ${guests}
- Budget: ${currencyCode} ${budget} (${currencySymbol})
- Selected Services: ${selectedServices.join(", ")}
- Preferred Package Level: ${packageType}
- Additional client instructions: ${additionalRequirements || "None provided"}

TASK INSTRUCTIONS:
1. Conduct budget feasibility: Calculate predicted cost based on guest counts and services in '${packageType}' tier. Evaluate whether client budget is Optimal (optimal), Stretched but doable (stretched), or Insufficient (insufficient). Provide exact conversion probability (0-100%) and a paragraph of analytical commentary.
2. Generate descriptive itemized quote items. You must output EXACTLY one line item per item in ${JSON.stringify(selectedServices)}. Make sure quantity * unitPrice matches the total exactly. Prices should adapt realistically to fit within or slightly challenge the client's budget of ${currencyCode} ${budget}.
3. Create a clean recommended package justification.
4. Highlight exactly 3 smart cost optimization/saving rules with specific title, savings amount, and descriptive paragraph.
5. Create realistic terms and conditions and a persuasive sales closing paragraph.

Ensure all prices and values are integers in standard currency units. Never include text outside the requested JSON format.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feasibility: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING, description: "One of 'optimal' (budget fits easily), 'stretched' (budget is tight), or 'insufficient' (unrealistic budget level)" },
                probability: { type: Type.INTEGER, description: "Conversion probability percentage, integer 0-100" },
                analysisCommentary: { type: Type.STRING, description: "Professional analytical paragraph assessment of budget feasibility" }
              },
              required: ["status", "probability", "analysisCommentary"]
            },
            quotationId: { type: Type.STRING, description: "Professional unique alphanumeric ID code" },
            dateGenerated: { type: Type.STRING, description: "Today's human-readable date" },
            requirementsSummary: { type: Type.STRING, description: "Executive summary paragraph of events requirements" },
            items: {
              type: Type.ARRAY,
              description: "Structured rows of services, exact pricing matched to service list",
              items: {
                type: Type.OBJECT,
                properties: {
                  service: { type: Type.STRING, description: "Must match a service name exactly" },
                  description: { type: Type.STRING, description: "Premium description detailing specifications, setup details, and deliverables" },
                  quantity: { type: Type.INTEGER, description: "Standard measurement multiplier (e.g. guest count, or 1 total, or hours)" },
                  unitPrice: { type: Type.INTEGER, description: "Price per structural unit" },
                  total: { type: Type.INTEGER, description: "Quantity multiplied by unitPrice" }
                },
                required: ["service", "description", "quantity", "unitPrice", "total"]
              }
            },
            recommendedPackage: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Recommended package level (e.g., Premium Package, Luxury Package, etc.)" },
                reasoning: { type: Type.STRING, description: "Corporate justification matched to their profile" }
              },
              required: ["name", "reasoning"]
            },
            aiOptimizations: {
              type: Type.ARRAY,
              description: "Must provide exactly 3 discrete actionable cost adjustment tips with specific saving calculations",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Short snappy title" },
                  description: { type: Type.STRING, description: "Explanation of why it cuts logistics cost" },
                  estimatedSaving: { type: Type.INTEGER, description: "Sensible saving amount as integer" },
                  actionKey: { type: Type.STRING, description: "Lower-cased service identifier related to this, e.g. 'catering', 'decoration', 'invitation'" }
                },
                required: ["title", "description", "estimatedSaving", "actionKey"]
              }
            },
            terms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly 4 realistic professional legal and reservation clauses"
            },
            closingNote: { type: Type.STRING, description: "Sales closer paragraph" }
          },
          required: ["feasibility", "quotationId", "dateGenerated", "requirementsSummary", "items", "recommendedPackage", "aiOptimizations", "terms", "closingNote"]
        }
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Empty text response received from AI model.");
    }

    const payload = JSON.parse(outputText.trim());
    res.json({ fallback: false, quotation: payload });

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({ error: error.message || "Internal server error during quotation generation." });
  }
});

// Configure Vite integration
async function main() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend server currently active on port ${PORT}`);
  });
}

main().catch(err => {
  console.error("Critical error starting Express-Vite backend:", err);
});
