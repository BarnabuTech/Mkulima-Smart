import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sprout, TrendingUp, Handshake, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50 overflow-x-hidden">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sprout className="text-emerald-600 w-8 h-8" />
          <span className="text-2xl font-bold text-stone-900 tracking-tight">Mkulima Smart</span>
        </div>
        <div className="hidden md:flex gap-8 items-center font-medium text-stone-600">
          <a href="#features" className="hover:text-emerald-600 transition-colors">How it Works</a>
          <a href="#about" className="hover:text-emerald-600 transition-colors">Our Vision</a>
          <Link to="/login" className="bg-emerald-600 text-white px-6 py-2.5 rounded-full hover:bg-emerald-700 transition-all shadow-md active:scale-95">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 lg:pt-24 lg:pb-32 px-6">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-6">
              Empowering 10,000+ Kenyan Farmers
            </span>
            <h1 className="text-5xl lg:text-7xl font-black text-stone-900 leading-[1.1] mb-8">
              Negotiate Better Prices for Your <span className="text-emerald-600">Produce.</span>
            </h1>
            <p className="text-lg lg:text-xl text-stone-600 leading-relaxed max-w-lg mb-10">
              Uza mazao yako kwa bei poa! Get fair price estimates and professional negotiation tips in Sheng or English. AI designed for the Kenyan market.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login" className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200">
                Start Negotiating Now <ArrowRight size={20} />
              </Link>
              <button className="bg-white text-stone-900 border-2 border-stone-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-stone-50 transition-all">
                Learn More
              </button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:justify-self-end"
          >
            <div className="w-full max-w-[500px] aspect-square rounded-3xl overflow-hidden shadow-2xl relative z-10 border-4 border-white">
              <img 
                src="https://images.unsplash.com/photo-1594488651833-11382f124294?q=80&w=2000&auto=format&fit=crop" 
                alt="African Farmer"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-2xl shadow-xl z-20 hidden md:block max-w-xs border border-stone-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-xs text-stone-500 font-medium">Market Outlook</p>
                  <p className="text-sm font-bold text-stone-900">Prices rising in Nakuru!</p>
                </div>
              </div>
              <p className="text-sm text-stone-600">
                Soko iko fiti leo. Weka bei ya juu kidogo juu ya demand ya maize imeongezeka.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white border-y border-stone-100 px-6">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold text-stone-900 mb-4">Built specifically for the Modern Farmer</h2>
            <p className="text-lg text-stone-600">We use advanced AI to analyze Kenyan markets and give you the edge in every sale.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "English & Sheng Support",
                desc: "Hatubagui lugha. Type however you want, Gemini understands your hustle.",
                icon: Handshake,
                color: "bg-blue-50 text-blue-600"
              },
              {
                title: "Live Market Logic",
                desc: "Get price estimates based on real-world trends across Kenyan counties.",
                icon: TrendingUp,
                color: "bg-orange-50 text-orange-600"
              },
              {
                title: "Fair & Secure",
                desc: "No middlemen. Just you and the AI helping you get what you deserve.",
                icon: ShieldCheck,
                color: "bg-emerald-50 text-emerald-600"
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl border border-stone-100 hover:shadow-xl transition-all"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.color}`}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">{feature.title}</h3>
                <p className="text-stone-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-stone-900 text-stone-400 px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Sprout className="text-emerald-500 w-6 h-6" />
            <span className="text-xl font-bold text-white">Mkulima Smart</span>
          </div>
          <p className="text-sm">© 2026 Mkulima Smart.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
