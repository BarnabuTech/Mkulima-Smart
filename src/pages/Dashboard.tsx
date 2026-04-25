import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Negotiation } from '../types';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Handshake, 
  ArrowRight,
  Plus,
  Clock,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function Dashboard() {
  const [recentNegotiations, setRecentNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecent() {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, `users/${auth.currentUser.uid}/negotiations`),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Negotiation));
        setRecentNegotiations(data);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecent();
  }, []);

  return (
    <div className="p-6 lg:p-10 space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-stone-900">Mambo, {auth.currentUser?.displayName?.split(' ')[0]}!</h1>
          <p className="text-stone-500 font-medium">Here's what's happening in your market.</p>
        </div>
        <Link 
          to="/negotiate" 
          className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
        >
          <Plus size={20} />
          New Negotiation
        </Link>
      </header>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatsCard 
          title="Avg. Market Outlook" 
          value="Rising" 
          trend="up" 
          description="Demand is high for cereals." 
          icon={TrendingUp}
          color="emerald"
        />
        <StatsCard 
          title="Recent Fair Price" 
          value={recentNegotiations[0]?.ai_response.fair_price || "N/A"} 
          description={recentNegotiations[0]?.crop_name || "No recent activity"} 
          icon={Handshake}
          color="blue"
        />
        <StatsCard 
          title="Negotiation Streak" 
          value={recentNegotiations.length.toString()} 
          description="Total sessions this month." 
          icon={Clock}
          color="orange"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-900">Recent Negotiations</h2>
          <Link to="/history" className="text-emerald-600 text-sm font-semibold flex items-center gap-1 hover:underline">
            View All History <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-600"></div>
              <p className="text-stone-400 text-sm">Tunapakia historia yako...</p>
            </div>
          ) : recentNegotiations.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 mb-4">
                <Info size={32} />
              </div>
              <p className="text-stone-500 font-medium mb-4">Bado haujafanya negotiation yoyote.</p>
              <Link to="/negotiate" className="text-emerald-600 font-bold hover:underline">Anza negotiation ya kwanza →</Link>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-stone-50 text-stone-500 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Crop & Quantity</th>
                  <th className="px-6 py-4">Buyer Offer</th>
                  <th className="px-6 py-4">AI Suggested</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {recentNegotiations.map((neg) => (
                  <tr key={neg.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-stone-900">{neg.crop_name}</div>
                      <div className="text-xs text-stone-500">{neg.quantity} • {neg.location}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-stone-600">{neg.buyer_offer}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">{neg.ai_response.fair_price}</td>
                    <td className="px-6 py-4 text-xs text-stone-500">
                      {neg.createdAt?.seconds ? format(new Date(neg.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Recently'}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-stone-400 hover:text-emerald-600 p-2">
                         <Info size={18} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, trend, description, icon: Icon, color }: any) {
  const colors: any = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colors[color]}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {trend === 'up' ? '+12%' : '-4%'}
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-stone-500 mb-1">{title}</h3>
      <p className="text-2xl font-black text-stone-900 mb-2 truncate">{value}</p>
      <p className="text-xs text-stone-400 font-medium">{description}</p>
    </motion.div>
  );
}
