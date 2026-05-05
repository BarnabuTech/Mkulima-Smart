import { GoogleGenAI, Type } from "@google/genai";
import type { AIResponse } from "../types";

export type NegotiationRequest = {
  crop_name: string;
  quantity: string;
  location: string;
  buyer_offer?: string;
  urgency?: string;
  transport_cost?: string;
  language_preference?: string;
  image_base64?: string;
  image_mime_type?: string;
};

export type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const MAX_IMAGE_BASE64_CHARS = 3_000_000; // ~2.2MB decoded
const MODEL = "gemini-3-flash-preview";

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export async function negotiateWithGemini(
  body: Partial<NegotiationRequest>,
  apiKey: string
): Promise<AIResponse> {
  if (!isNonEmptyString(body.crop_name) || !isNonEmptyString(body.quantity) || !isNonEmptyString(body.location)) {
    throw new ApiError(400, "invalid_request", "Missing required fields: crop_name, quantity, location.");
  }

  if (body.image_base64 && !isNonEmptyString(body.image_mime_type)) {
    throw new ApiError(400, "invalid_request", "If image_base64 is provided, image_mime_type is required.");
  }

  if (isNonEmptyString(body.image_base64) && body.image_base64.length > MAX_IMAGE_BASE64_CHARS) {
    throw new ApiError(413, "payload_too_large", "Image is too large. Please upload a smaller photo.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
You are Mkulima Smart, an agricultural market negotiation assistant for Kenyan farmers.
Your job is to help farmers estimate fair prices for their produce, negotiate with buyers, and grade crop quality.

Grading Logic:
If a photo is provided, analyze the visual quality of the produce (freshness, bruising, color, size consistency).
Provide a "quality_grade" (e.g. "Grade A / Export Quality", "Grade B / Local Market", "Grade C / Processing")
and a brief "grading_analysis" of what you see. Use this grade to justify the fair price.

Response Requirements:
- Understand Sheng, English, and code-switched inputs.
- Be practical, clear, and locally relevant to the Kenyan market.
- Return valid JSON matching the schema.
- Avoid long explanations. Be short, sharp, and useful.
  `.trim();

  const promptText = `
Farmer Details:
- Crop: ${body.crop_name}
- Quantity: ${body.quantity}
- Location: ${body.location}
- Buyer's Offer: ${body.buyer_offer || "Not provided"}
- Urgency: ${body.urgency || "Normal"}
- Transport Cost: ${body.transport_cost || "Unknown"}
- Language Preference: ${body.language_preference || "Mixed English/Sheng"}
  `.trim();

  const parts: any[] = [{ text: promptText }];
  if (isNonEmptyString(body.image_base64) && isNonEmptyString(body.image_mime_type)) {
    parts.push({
      inlineData: {
        mimeType: body.image_mime_type,
        data: body.image_base64,
      },
    });
  }

  const response = await Promise.race([
    ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggested_price_range: { type: Type.STRING },
            fair_price: { type: Type.STRING },
            negotiation_tips: { type: Type.ARRAY, items: { type: Type.STRING } },
            market_outlook: { type: Type.STRING },
            risk_note: { type: Type.STRING },
            confidence_level: { type: Type.STRING },
            short_summary: { type: Type.STRING },
            quality_grade: { type: Type.STRING },
            grading_analysis: { type: Type.STRING },
          },
          required: [
            "suggested_price_range",
            "fair_price",
            "negotiation_tips",
            "market_outlook",
            "risk_note",
            "confidence_level",
            "short_summary",
          ],
        },
      },
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(Object.assign(new Error("timeout"), { name: "TimeoutError" })), 25_000)
    ),
  ]);

  const text = response.text;
  if (!text) {
    throw new ApiError(502, "empty_ai_response", "Empty response from AI.");
  }

  try {
    return JSON.parse(text) as AIResponse;
  } catch {
    throw new ApiError(502, "invalid_ai_json", "AI returned invalid JSON.");
  }
}

