import { AIResponse } from "../types";

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
  const res = await fetch("/api/negotiate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(details),
  });

  const text = await res.text();
  if (!res.ok) {
    let message = "Something went wrong. Tafadhali jaribu tena.";
    try {
      const parsed = JSON.parse(text) as any;
      if (parsed?.error?.message) message = parsed.error.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  try {
    return JSON.parse(text) as AIResponse;
  } catch {
    throw new Error("Server returned invalid JSON.");
  }
}
