import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Negotiation } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Search, 
  Filter, 
  ChevronRight,
  TrendingUp,
  Calendar,
  Layers,
  MapPin,
  X
} from 'lucide-react';
import { format } from 'date-fns';

export default function HistoryPage() {
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNegotiation, setSelectedNegotiation] = useState<Negotiation | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, `users/${auth.currentUser.uid}/negotiations`),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Negotiation));
        setNegotiations(data);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const filtered = negotiations.filter(n => 
    n.crop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-10 space-y-8 relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-stone-900 mb-2">My History</h1>
          <p className="text-stone-500">Historia yako yote ya biashara iko hapa.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text" 
              placeholder="Search crops or locations..."
              className="bg-white border-stone-100 border-2 pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-emerald-500 transition-all text-sm w-full md:w-64"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-white border-stone-100 border-2 p-2.5 rounded-xl text-stone-500 hover:text-emerald-600 transition-all">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-600"></div>
          <p className="text-stone-400">Loading your hustle legacy...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-stone-100">
           <History size={48} className="mx-auto text-stone-200 mb-4" />
           <p className="text-stone-400 font-medium font-lg">No records found matching your search.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((neg) => (
            <motion.div
              layoutId={neg.id}
              key={neg.id}
              onClick={() => setSelectedNegotiation(neg)}
              className="group bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  {neg.crop_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">{neg.crop_name}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500 mt-1">
                    <span className="flex items-center gap-1"><Layers size={14} /> {neg.quantity}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {neg.location}</span>
                    <span className="flex items-center gap-1 font-medium text-emerald-600"><TrendingUp size={14} /> {neg.ai_response.fair_price}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Date Created</p>
                  <p className="text-sm font-medium text-stone-600 flex items-center gap-2">
                    <Calendar size={14} />
                    {neg.createdAt?.seconds ? format(new Date(neg.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Recent'}
                  </p>
                </div>
                <ChevronRight className="text-stone-300 group-hover:text-emerald-500 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedNegotiation && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNegotiation(null)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div
              layoutId={selectedNegotiation.id}
              className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 bg-emerald-600 text-white flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-black">{selectedNegotiation.crop_name} Report</h2>
                  <p className="text-emerald-100 font-medium">Negotiation Details and AI Analysis</p>
                </div>
                <button 
                  onClick={() => setSelectedNegotiation(null)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                >
                  <X />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Quantity" value={selectedNegotiation.quantity} />
                  <DetailItem label="Location" value={selectedNegotiation.location} />
                  <DetailItem label="Buyer Offer" value={selectedNegotiation.buyer_offer} />
                  <DetailItem label="Fair Price" value={selectedNegotiation.ai_response.fair_price} colored />
                  {selectedNegotiation.ai_response.quality_grade && (
                    <div className="col-span-2">
                       <DetailItem label="AI Quality Grade" value={selectedNegotiation.ai_response.quality_grade} colored />
                    </div>
                  )}
                </div>

                {selectedNegotiation.ai_response.grading_analysis && (
                  <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                    <h4 className="font-bold text-emerald-900 text-sm uppercase mb-2 flex items-center gap-2">
                      Grading Analysis
                    </h4>
                    <p className="text-emerald-800 text-sm leading-relaxed">
                      {selectedNegotiation.ai_response.grading_analysis}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="font-bold text-stone-900 text-lg">AI Recommendations</h4>
                  <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 italic text-stone-600 text-lg leading-relaxed">
                    "{selectedNegotiation.ai_response.short_summary}"
                  </div>
                  <div className="space-y-3">
                    {selectedNegotiation.ai_response.negotiation_tips.map((tip, i) => (
                      <p key={i} className="text-sm text-stone-600 flex gap-3">
                        <span className="text-emerald-600 font-bold">•</span>
                        {tip}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
                  <p className="text-xs font-bold text-orange-600 uppercase mb-2">Market Outlook</p>
                  <p className="text-sm font-medium text-stone-800">{selectedNegotiation.ai_response.market_outlook}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ label, value, colored }: any) {
  return (
    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
      <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1">{label}</p>
      <p className={`text-lg font-bold ${colored ? 'text-emerald-600' : 'text-stone-900'}`}>{value || 'N/A'}</p>
    </div>
  );
}
