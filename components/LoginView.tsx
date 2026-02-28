import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, AlertTriangle, Loader2 } from 'lucide-react';

const LoginView: React.FC = () => {
  const { login, loading, authError } = useAuth();

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-300 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-200 rounded-full blur-[150px]"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/50 relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-b from-emerald-900 to-emerald-950 p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

          <div className="relative z-10 flex flex-col items-center">
            <img
              src="https://storage.googleapis.com/aivoks_website_almacenamiento/ALEX/Cruzremodel%20app/Cruz%20remodel%20logo.png"
              alt="Cruz Remodel Logo"
              className="h-24 w-auto object-contain mb-4 drop-shadow-lg"
            />
            <h1 className="text-3xl font-bold text-white font-serif tracking-wide mt-2">Cruz Remodel</h1>
            <p className="text-emerald-200 text-sm tracking-widest uppercase mt-2 font-medium">Professional CRM</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-10">
          {authError && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-start text-sm shadow-sm">
              <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <span className="font-medium">{authError}</span>
            </div>
          )}

          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-slate-800">Welcome Back</h2>
              <p className="text-slate-500 text-sm">
                Access your dashboard securely with Google.
              </p>
            </div>

            <button
              onClick={login}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 text-slate-700 font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin text-emerald-600" />
              ) : (
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5 group-hover:scale-110 transition-transform"
                />
              )}
              <span className="group-hover:text-emerald-800 transition-colors">{loading ? 'Verifying...' : 'Sign in with Google'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-xs text-slate-400 flex items-center justify-center font-medium">
            <Lock size={12} className="mr-1.5" /> Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;