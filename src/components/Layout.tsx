import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { User, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { 
  LayoutDashboard, 
  Handshake, 
  History, 
  LogOut, 
  Sprout,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  user: User | null;
}

export default function Layout({ user }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'New Negotiation', path: '/negotiate', icon: Handshake },
    { name: 'History', path: '/history', icon: History },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-emerald-900 text-white flex-col">
        <div className="p-6 flex items-center gap-3">
          <Sprout className="text-emerald-400 w-8 h-8" />
          <span className="font-bold text-xl tracking-tight text-white">Mkulima Smart</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                location.pathname === item.path 
                  ? "bg-emerald-800 text-white shadow-sm" 
                  : "text-emerald-100 hover:bg-emerald-800/50"
              )}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-emerald-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-4">
            <img 
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'Farmer'}`} 
              alt="Profile" 
              className="w-8 h-8 rounded-full border border-emerald-700"
            />
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{user?.displayName || 'Farmer'}</p>
                <span className="text-[10px] bg-emerald-700 px-1.5 py-0.5 rounded text-emerald-100 font-bold uppercase tracking-wider">Farmer</span>
              </div>
              <p className="text-xs text-emerald-300 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 text-emerald-100 hover:bg-emerald-800/50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden bg-emerald-900 text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Sprout className="text-emerald-400 w-6 h-6" />
          <span className="font-bold text-lg">Mkulima Smart</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-40 bg-emerald-900 pt-20 px-6"
          >
            <nav className="space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl text-xl",
                    location.pathname === item.path ? "bg-emerald-800" : ""
                  )}
                >
                  <item.icon size={24} />
                  <span>{item.name}</span>
                </Link>
              ))}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-4 p-4 w-full text-xl text-emerald-200"
              >
                <LogOut size={24} />
                <span>Sign Out</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 pb-12 md:pb-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
