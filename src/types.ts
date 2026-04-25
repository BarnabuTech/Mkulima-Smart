export enum ConfidenceLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface AIResponse {
  suggested_price_range: string;
  fair_price: string;
  negotiation_tips: string[];
  market_outlook: string;
  risk_note: string;
  confidence_level: ConfidenceLevel;
  short_summary: string;
  quality_grade?: string; // e.g., "Grade A / Premium"
  grading_analysis?: string; // AI's observation of the crop photo
}

export interface Negotiation {
  id?: string;
  crop_name: string;
  quantity: string;
  location: string;
  buyer_offer: string;
  urgency: string;
  transport_cost: string;
  language_preference: string;
  image_url?: string;
  ai_response: AIResponse;
  createdAt: any; // Firestore Timestamp
}
