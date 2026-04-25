import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "../types";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

export async function generateNegotiationStrategy(details: {
  crop_name: string;
  quantity: string;
  location: string;
  buyer_offer: string;
  urgency: string;
  transport_cost: string;
  language_preference: string;
  image_base64?: string;
  image_mime_type?: string;
}): Promise<AIResponse> {
  
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
  `;

  const promptText = `
    Farmer Details:
    - Crop: ${details.crop_name}
    - Quantity: ${details.quantity}
    - Location: ${details.location}
    - Buyer's Offer: ${details.buyer_offer || "Not provided"}
    - Urgency: ${details.urgency || "Normal"}
    - Transport Cost: ${details.transport_cost || "Unknown"}
    - Language Preference: ${details.language_preference || "Mixed English/Sheng"}
  `;

  const parts: any[] = [{ text: promptText }];
  
  if (details.image_base64 && details.image_mime_type) {
    parts.push({
      inlineData: {
        mimeType: details.image_mime_type,
        data: details.image_base64
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggested_price_range: { type: Type.STRING },
          fair_price: { type: Type.STRING },
          negotiation_tips: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          market_outlook: { type: Type.STRING },
          risk_note: { type: Type.STRING },
          confidence_level: { type: Type.STRING },
          short_summary: { type: Type.STRING },
          quality_grade: { type: Type.STRING },
          grading_analysis: { type: Type.STRING }
        },
        required: [
          "suggested_price_range", 
          "fair_price", 
          "negotiation_tips", 
          "market_outlook", 
          "risk_note", 
          "confidence_level", 
          "short_summary"
        ]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from Gemini");
  return JSON.parse(text) as AIResponse;
}
