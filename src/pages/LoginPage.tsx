import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types';
import {
  Sprout,
  ShoppingBag,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  Sparkles,
} from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, switchUserDemo } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('ramesh@agroconnect.farm');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('farmer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, role);
      // Redirect to correct dashboard based on role
      if (role === 'farmer') onNavigate('farmer_dashboard');
      else if (role === 'buyer') onNavigate('buyer_dashboard');
      else onNavigate('admin_dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoId: string, demoRole: UserRole) => {
    setLoading(true);
    try {
      await switchUserDemo(demoId);
      if (demoRole === 'farmer') onNavigate('farmer_dashboard');
      else if (demoRole === 'buyer') onNavigate('buyer_dashboard');
      else onNavigate('admin_dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-xl shadow-stone-900/5">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner">
            <Sprout className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 font-heading">
            {t('auth.login_title', 'Sign In to AgroConnect')}
          </h1>
          <p className="text-xs text-stone-500">
            {t('auth.login_sub', 'Access your farmgate marketplace account & live agricultural data')}
          </p>
        </div>

        {/* 1-Click Interactive Demo Profiles */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-600">
            <span className="flex items-center gap-1 text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> {t('auth.demo_profiles_title', '1-Click Interactive Test Profiles:')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {DEMO_USERS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => handleQuickDemo(d.id, d.role as UserRole)}
                className="p-2 rounded-xl bg-white border border-stone-200 hover:border-emerald-500 hover:shadow-xs transition-all text-left flex flex-col"
              >
                <span className="font-bold text-stone-900">{d.name}</span>
                <span className="text-[10px] text-emerald-700 capitalize font-medium">
                  {d.role} • {d.location}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {forgotSent && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Password reset instructions simulated for {email}.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              {t('auth.role_label', 'Select Your Role')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRole('farmer');
                  setEmail('ramesh@agroconnect.farm');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  role === 'farmer'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Sprout className="w-4 h-4 text-emerald-600" />
                <span>{t('auth.role_farmer', 'Farmer')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('buyer');
                  setEmail('aarav@greenmart.in');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  role === 'buyer'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>{t('auth.role_buyer', 'Buyer')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('admin');
                  setEmail('admin@agroconnect.in');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  role === 'admin'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>{t('auth.role_admin', 'Admin')}</span>
              </button>
            </div>
          </div>

          {/* Email input */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t('auth.email_label', 'Email Address')} *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all font-medium text-stone-900"
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-stone-700">
                {t('auth.pass_label', 'Password')} *
              </label>
              <button
                type="button"
                onClick={() => setForgotSent(true)}
                className="text-[11px] font-semibold text-emerald-700 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600 font-medium text-stone-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-sm font-bold shadow-md shadow-emerald-950/10 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{t('auth.sign_in_btn', 'Sign In')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Switch to Register */}
          <div className="text-center pt-2 text-xs text-stone-600">
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="font-bold text-emerald-700 hover:underline"
            >
              {t('auth.no_account', 'New to AgroConnect? Register here')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
