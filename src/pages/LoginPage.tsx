import { motion } from 'motion/react';
import { Sprout, LogIn } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-stone-100"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-2xl mb-4">
            <Sprout className="text-emerald-600 w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-stone-900 mb-2">Welcome Back</h1>
          <p className="text-stone-500">Sign in to manage your farm negotiations</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-4 bg-white border-2 border-stone-100 py-4 rounded-xl font-bold text-stone-700 hover:bg-stone-50 hover:border-stone-200 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-emerald-600"></div>
          ) : (
            <>
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Continue with Google
            </>
          )}
        </button>

        <div className="mt-8 text-center">
          <p className="text-sm text-stone-400">
            By continuing, you agree to our <a href="#" className="text-emerald-600 font-medium">Terms of Service</a>
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-50 text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-stone-400 hover:text-stone-600 text-sm font-medium transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
