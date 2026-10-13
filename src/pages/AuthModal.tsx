import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { UserRole } from '../types';
import { X, Sprout, ShoppingCart, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const { login, register, switchUserDemo } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [role, setRole] = useState<UserRole>('farmer');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('password123');
  const [location, setLocation] = useState('');
  const [farmName, setFarmName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, role);
      } else if (mode === 'register') {
        if (!name || !email) {
          throw new Error('Please fill in your name and email address.');
        }
        await register({
          name,
          email,
          phone: phone || '+91 98000 00000',
          role,
          location: location || (role === 'farmer' ? 'Guntur, Andhra Pradesh' : 'Hyderabad'),
          farmName: farmName || (role === 'farmer' ? `${name}'s Natural Farm` : undefined),
        });
      } else {
        // Forgot password simulation
        setForgotSuccess(true);
        setLoading(false);
        return;
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoPick = async (demoId: string) => {
    setLoading(true);
    try {
      await switchUserDemo(demoId);
      onClose();
      if (onSuccess) onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden relative">
        {/* Header close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Brand header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mb-3 shadow-inner">
              <Sprout className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 font-heading">
              {mode === 'login' ? 'Sign In to AgroConnect' : mode === 'register' ? 'Create an Account' : 'Reset Password'}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Direct, transparent farm-to-market trading & AI agronomy
            </p>
          </div>

          {/* Quick Demo Picker Pills */}
          {mode === 'login' && (
            <div className="mb-6 p-3 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-2 flex items-center justify-between">
                <span>⚡ 1-Click Demo Profiles</span>
                <span className="text-[10px] text-emerald-700 font-semibold">No password needed</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {DEMO_USERS.slice(0, 4).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleQuickDemoPick(d.id)}
                    className="p-2 text-left rounded-xl bg-white border border-stone-200 hover:border-emerald-500 hover:shadow-xs transition-all flex flex-col"
                  >
                    <span className="font-bold text-stone-800 text-xs">{d.name}</span>
                    <span className="text-[10px] text-emerald-700 capitalize font-medium">
                      {d.role} • {d.location}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          {forgotSuccess ? (
            <div className="py-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-stone-900">Password Reset Link Sent</h3>
              <p className="text-xs text-stone-500">
                A verification link has been simulated for {email}. You can sign in using your existing credentials.
              </p>
              <button
                type="button"
                onClick={() => {
                  setForgotSuccess(false);
                  setMode('login');
                }}
                className="mt-2 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selector */}
              {mode !== 'forgot' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                    Select Your Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('farmer')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                        role === 'farmer'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <Sprout className="w-4 h-4 text-emerald-600" />
                      <span>Farmer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('buyer')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                        role === 'buyer'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4 text-emerald-600" />
                      <span>Buyer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                        role === 'admin'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <Shield className="w-4 h-4 text-emerald-600" />
                      <span>Admin</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Registration Extra Fields */}
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Balwinder Singh"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  {role === 'farmer' && (
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Farm / FPO Name
                      </label>
                      <input
                        type="text"
                        value={farmName}
                        onChange={(e) => setFarmName(e.target.value)}
                        placeholder="e.g. Singh Agro Farms"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98480 00000"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Location / District
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Nashik, MH"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    mode === 'login'
                      ? role === 'farmer'
                        ? 'ramesh@agroconnect.farm'
                        : 'aarav@greenmart.in'
                      : 'yourname@example.com'
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Password */}
              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-stone-700">
                      Password *
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[11px] font-semibold text-emerald-700 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-sm font-bold shadow-md shadow-emerald-950/10 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : mode === 'login' ? (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : mode === 'register' ? (
                  <>
                    <span>Create My Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>

              {/* Toggle Mode Footer */}
              <div className="text-center pt-2 text-xs text-stone-600">
                {mode === 'login' ? (
                  <p>
                    Don't have an AgroConnect account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="font-bold text-emerald-700 hover:underline"
                    >
                      Register Now
                    </button>
                  </p>
                ) : (
                  <p>
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="font-bold text-emerald-700 hover:underline"
                    >
                      Sign In Here
                    </button>
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
