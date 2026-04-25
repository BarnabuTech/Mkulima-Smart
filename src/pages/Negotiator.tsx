import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  MapPin, 
  Layers, 
  Banknote, 
  Zap, 
  Truck, 
  Languages,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  TrendingUp,
  History,
  Camera,
  X as CloseIcon,
  Award,
  Volume2
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { AIResponse, ConfidenceLevel } from '../types';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

import { generateNegotiationStrategy } from '../services/geminiService';

export default function Negotiator() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [formData, setFormData] = useState({
    crop_name: '',
    quantity: '',
    location: '',
    buyer_offer: '',
    urgency: 'Medium',
    transport_cost: '',
    language_preference: 'Mixed English/Sheng'
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setImageBase64(base64String.split(',')[1]); // Remove data:image/...;base64,
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    setImageMimeType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const speakResults = () => {
    if (!result) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textPayload = `
      Mkulima Smart Analysis: 
      Fair price for your ${formData.crop_name} is ${result.fair_price}. 
      Suggested price range is ${result.suggested_price_range}. 
      Market outlook: ${result.market_outlook}. 
      Summary: ${result.short_summary}
    `;

    const utterance = new SpeechSynthesisUtterance(textPayload);
    
    // Attempt to use a Swahili voice if available, otherwise fallback to default
    const voices = window.speechSynthesis.getVoices();
    const swVoice = voices.find(v => v.lang.startsWith('sw') || v.lang.includes('KE'));
    if (swVoice) utterance.voice = swVoice;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    setIsSpeaking(false);

    try {
      const data = await generateNegotiationStrategy({
        ...formData,
        image_base64: imageBase64 || undefined,
        image_mime_type: imageMimeType || undefined
      });
      setResult(data);

      // Save to Firestore
      if (auth.currentUser) {
        await addDoc(collection(db, `users/${auth.currentUser.uid}/negotiations`), {
          ...formData,
          image_url: imagePreview, // Storing locally for demo persistence
          ai_response: data,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Tafadhali jaribu tena. Check your Gemini API Key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="mb-10">
              <h1 className="text-3xl font-black text-stone-900 mb-2">New Negotiation</h1>
              <p className="text-stone-500">Toa details za bidhaa yako upate bei ya soko.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-stone-700 mb-2">
                    <Sprout size={16} className="text-emerald-500" />
                    Crop Name / Aina ya Mazao
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Maize, Potatoes, Tomatoes"
                    className="w-full bg-stone-50 border-stone-100 border-2 px-4 py-3 rounded-xl focus:border-emerald-500 outline-none transition-all placeholder:text-stone-300"
                    value={formData.crop_name}
                    onChange={e => setFormData({ ...formData, crop_name: e.target.value })}
                  />
                </div>

                {/* Quality Grading Upload */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-stone-700 mb-2">
                    <Camera size={16} className="text-emerald-500" />
                    Upload Photo (Optional) / AI Grading
                  </label>
                  {!imagePreview ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full aspect-video bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-stone-100 transition-all border-emerald-500/20"
                    >
                      <Camera size={32} className="text-stone-300 mb-2" />
                      <p className="text-xs font-bold text-stone-400">Click to snap or upload</p>
                      <p className="text-[10px] text-stone-300 mt-1">Get AI Quality Grading</p>
                    </div>
                  ) : (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-emerald-500/30">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <CloseIcon size={16} />
                      </button>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageChange}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-stone-700 mb-2">
                    <Layers size={16} className="text-emerald-500" />
                    Quantity / Wingi (e.g. 90kg bags)
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 50 bags of 90kg"
                    className="w-full bg-stone-50 border-stone-100 border-2 px-4 py-3 rounded-xl focus:border-emerald-500 outline-none transition-all placeholder:text-stone-300"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-stone-700 mb-2">
                    <MapPin size={16} className="text-emerald-500" />
                    Location / Mahali Soko Iko
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Wakulima Market, Nairobi"
                    className="w-full bg-stone-50 border-stone-100 border-2 px-4 py-3 rounded-xl focus:border-emerald-500 outline-none transition-all placeholder:text-stone-300"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-stone-700 mb-2">
                    <Banknote size={16} className="text-emerald-500" />
                    Buyer's Offer / Ofa ya Mnunuzi (Ksh)
                  </label>
                  <input
                    type="text"
                    placeholder="Unataka kuuziwa kwa pesa ngapi?"
                    className="w-full bg-stone-50 border-stone-100 border-2 px-4 py-3 rounded-xl focus:border-emerald-500 outline-none transition-all placeholder:text-stone-300"
                    value={formData.buyer_offer}
                    onChange={e => setFormData({ ...formData, buyer_offer: e.target.value })}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-stone-700 mb-2">
                    <Zap size={16} className="text-emerald-500" />
                    How fast must you sell? / Haraka kiasi gani?
                  </label>
                  <select
                    className="w-full bg-stone-50 border-stone-100 border-2 px-4 py-3 rounded-xl focus:border-emerald-500 outline-none transition-all"
                    value={formData.urgency}
                    onChange={e => setFormData({ ...formData, urgency: e.target.value })}
                  >
                    <option>Very High (Needs to move today)</option>
                    <option>Medium (Can wait a few days)</option>
                    <option>Low (No rush)</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-stone-700 mb-2">
                    <Truck size={16} className="text-emerald-500" />
                    Transport Cost / Gharama ya Usafiri
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5000 Ksh per trip"
                    className="w-full bg-stone-50 border-stone-100 border-2 px-4 py-3 rounded-xl focus:border-emerald-500 outline-none transition-all placeholder:text-stone-300"
                    value={formData.transport_cost}
                    onChange={e => setFormData({ ...formData, transport_cost: e.target.value })}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-stone-700 mb-2">
                    <Languages size={16} className="text-emerald-500" />
                    Preferred Language / Lugha Unayopenda
                  </label>
                  <select
                    className="w-full bg-stone-50 border-stone-100 border-2 px-4 py-3 rounded-xl focus:border-emerald-500 outline-none transition-all"
                    value={formData.language_preference}
                    onChange={e => setFormData({ ...formData, language_preference: e.target.value })}
                  >
                    <option>Mixed English/Sheng</option>
                    <option>Strictly Sheng</option>
                    <option>English only</option>
                    <option>Swahili</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Analysing Market...
                      </>
                    ) : (
                      <>
                        Generate Strategy
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-stone-900">Market Intelligence</h2>
                <p className="text-stone-500 font-medium">Hii hapa ni strategy yako ya leo.</p>
              </div>
              <button 
                onClick={() => setResult(null)}
                className="text-stone-400 hover:text-stone-600 font-bold flex items-center gap-2"
              >
                Go Back
              </button>
            </div>

            {/* Price Hero Section */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-emerald-600 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-emerald-100 font-bold uppercase tracking-widest text-xs mb-4">Estimated Fair Price</p>
                  <h3 className="text-6xl font-black mb-2">{result.fair_price}</h3>
                  <p className="text-xl text-emerald-100 mb-8 font-medium">Suggested Range: {result.suggested_price_range}</p>
                  <div className="flex flex-wrap items-center gap-4">
                     <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                       <CheckCircle2 size={20} />
                       <span className="font-bold">Confidence: {result.confidence_level}</span>
                     </div>
                     {result.quality_grade && (
                       <div className="flex items-center gap-2 bg-orange-400 px-4 py-2 rounded-full">
                         <Award size={20} />
                         <span className="font-bold">{result.quality_grade}</span>
                       </div>
                     )}
                  </div>
                </div>
                <Sprout className="absolute -right-20 -bottom-20 w-80 h-80 text-white/10 rotate-12" />
              </div>

              <div className="bg-orange-50 p-8 rounded-[40px] border border-orange-100 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6">
                    <TrendingUp size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-stone-900 mb-2">Market Outlook</h4>
                  <p className="text-stone-600 leading-relaxed text-sm">{result.market_outlook}</p>
                </div>
                <div className="mt-8 pt-6 border-t border-orange-100/50">
                   <p className="text-xs font-bold text-orange-400 uppercase mb-1">Risk Assessment</p>
                   <p className="text-stone-700 font-medium text-sm">{result.risk_note}</p>
                </div>
              </div>
            </div>

            {/* AI Grading Analysis & Tips */}
            <div className="grid md:grid-cols-2 gap-8">
               <div className="space-y-6">
                 {result.grading_analysis && (
                   <div className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-sm">
                      <h4 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                        <Camera className="text-emerald-500" />
                        AI Quality Analysis
                      </h4>
                      <p className="text-stone-600 leading-relaxed">{result.grading_analysis}</p>
                   </div>
                 )}
                 <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
                    <h4 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                      <Lightbulb className="text-amber-500" />
                      How to Negotiate
                    </h4>
                    <ul className="space-y-4">
                      {result.negotiation_tips.map((tip, i) => (
                        <li key={i} className="flex gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                          <div className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                            {i + 1}
                          </div>
                          <p className="text-stone-700 font-medium leading-relaxed">{tip}</p>
                        </li>
                      ))}
                    </ul>
                 </div>
               </div>

               <div className="space-y-6">
                 <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-xl font-bold text-stone-900">Summary / Muhtasari</h4>
                      <button 
                        onClick={speakResults}
                        className={cn(
                          "p-2 rounded-full transition-all",
                          isSpeaking ? "bg-emerald-500 text-white animate-pulse" : "bg-stone-100 text-stone-500 hover:bg-emerald-100 hover:text-emerald-600"
                        )}
                        title="Read Results Aloud"
                      >
                        <Volume2 size={20} />
                      </button>
                    </div>
                    <p className="text-stone-600 leading-relaxed text-lg italic">"{result.short_summary}"</p>
                 </div>
                 
                 <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 border-dashed">
                    <div className="flex gap-4">
                      <ShieldCheck className="text-emerald-600 shrink-0 mt-1" />
                      <div>
                        <p className="font-bold text-emerald-900 mb-1">Ready to deal?</p>
                        <p className="text-sm text-emerald-700">Tafadhali kumbuka hii ni estimates. Always check physically before finalising high value deals.</p>
                      </div>
                    </div>
                 </div>

                 <button 
                  onClick={() => navigate('/history')}
                  className="w-full flex items-center justify-center gap-3 bg-stone-900 text-white py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all"
                 >
                   <History size={20} />
                   View in History
                 </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
