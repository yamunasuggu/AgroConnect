import React, { useState, useEffect } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Sprout,
  Store,
  TrendingUp,
  Bot,
  LayoutDashboard,
  ShoppingBag,
  Bell,
  PlusCircle,
  LogOut,
  UserCheck,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ShieldAlert,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { Notification } from '../types';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: (initialMode?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onOpenAuth }) => {
  const { user, role, logout, switchUserDemo } = useAuth();
  const { currentLanguage, currentOption, setLanguage, availableLanguages, t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      api.getNotifications(user.id)
        .then((res) => setNotifications(res.notifications || []))
        .catch(() => {});
    }
  }, [user]);

  const unreadNotifs = notifications.filter((n) => !n.read);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {}
  };

  const getDashboardPage = () => {
    if (role === 'farmer') return 'farmer_dashboard';
    if (role === 'buyer') return 'buyer_dashboard';
    if (role === 'admin') return 'admin_dashboard';
    return 'marketplace';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Quick Demo Role Switcher Ribbon */}
      <div className="bg-stone-900 text-stone-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" /> Interactive Demo Role Switcher:
          </span>
          <span className="hidden md:inline text-stone-400">
            Switch perspective instantly with 1-click:
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {DEMO_USERS.map((demo) => {
            const isCurrent = user?.id === demo.id;
            return (
              <button
                key={demo.id}
                onClick={() => switchUserDemo(demo.id)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all shrink-0 flex items-center gap-1 ${
                  isCurrent
                    ? 'bg-emerald-500 text-white font-bold ring-2 ring-emerald-300'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
                }`}
              >
                <span>{demo.name.split(' ')[0]}</span>
                <span className="opacity-75 uppercase text-[9px]">({demo.role})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-stone-900 font-heading">
                Agro<span className="text-emerald-600">Connect</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-stone-400 -mt-1">
                Farm-to-Market
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentPage === 'home'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              {t('nav.home')}
            </button>
            <button
              onClick={() => onNavigate('marketplace')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                currentPage === 'marketplace'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Store className="w-4 h-4" /> {t('nav.marketplace')}
            </button>
            <button
              onClick={() => onNavigate('prices')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                currentPage === 'prices'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> {t('nav.prices')}
            </button>
            <button
              onClick={() => onNavigate('assistant')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 relative ${
                currentPage === 'assistant'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Bot className="w-4 h-4 text-emerald-600" /> {t('nav.assistant')}
              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                AI
              </span>
            </button>
            {user && (
              <button
                onClick={() => onNavigate('orders')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  currentPage === 'orders'
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> {t('nav.orders')}
              </button>
            )}
            {user && (
              <button
                onClick={() => onNavigate(getDashboardPage())}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  currentPage.includes('dashboard')
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> {t('nav.dashboard')}
              </button>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Prominent State-Wise Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="px-2.5 py-1.5 rounded-xl border border-stone-200 hover:border-emerald-500 bg-stone-50 hover:bg-white text-xs font-bold text-stone-800 flex items-center gap-1.5 transition-all shadow-2xs"
                title="Select State Language"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentOption.flag}</span>
                <span className="hidden sm:inline">{currentOption.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {showLangDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 animate-in fade-in zoom-in-95 max-h-72 overflow-y-auto divide-y divide-stone-100">
                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50/60 rounded-lg mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> {t('nav.select_language')}
                  </div>
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLangDropdown(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between text-xs transition-colors ${
                        currentLanguage === lang.code
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'hover:bg-stone-50 text-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{lang.flag}</span>
                        <div>
                          <div className="font-bold">{lang.nativeName} ({lang.englishName})</div>
                          <div className={`text-[10px] ${currentLanguage === lang.code ? 'text-emerald-100' : 'text-stone-400'}`}>
                            {lang.states}
                          </div>
                        </div>
                      </div>
                      {currentLanguage === lang.code && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {role === 'farmer' && (
              <button
                onClick={() => onNavigate('add_crop')}
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-transform active:scale-95"
              >
                <PlusCircle className="w-4 h-4" /> {t('nav.list_crop')}
              </button>
            )}

            {/* Notifications Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifs.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                      {unreadNotifs.length}
                    </span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-stone-200 p-3 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2">
                      <span className="font-bold text-xs text-stone-900">Notifications</span>
                      <span className="text-[10px] text-stone-400">{notifications.length} alerts</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-stone-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              handleMarkRead(n.id);
                              if (n.link) onNavigate(n.link.replace('/', ''));
                              setShowNotifDropdown(false);
                            }}
                            className={`p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                              n.read ? 'bg-stone-50 text-stone-600' : 'bg-emerald-50/70 border border-emerald-100 text-emerald-950 font-medium'
                            }`}
                          >
                            <div className="font-semibold">{n.title}</div>
                            <div className="text-[11px] text-stone-500 mt-0.5 line-clamp-2">{n.message}</div>
                            <div className="text-[10px] text-stone-400 mt-1">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Auth Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-emerald-300"
                  />
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-stone-900 leading-tight truncate max-w-[120px]">
                      {user.name}
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-700 capitalize flex items-center gap-0.5">
                      <UserCheck className="w-2.5 h-2.5" /> {user.role}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-stone-400 hidden sm:block" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-900">{user.name}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onNavigate(getDashboardPage());
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4 text-stone-400" /> My Dashboard
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('orders');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 text-stone-400" /> My Orders
                    </button>

                    {role === 'farmer' && (
                      <button
                        onClick={() => {
                          onNavigate('farmer_profile', { farmerId: user.id });
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                      >
                        <UserCheck className="w-4 h-4 text-stone-400" /> Public Farmer Profile
                      </button>
                    )}

                    <div className="border-t border-stone-100 my-1" />

                    <button
                      onClick={() => {
                        logout();
                        setShowUserDropdown(false);
                        onNavigate('home');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> {t('nav.sign_out')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3.5 py-2 text-xs font-bold text-stone-700 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  {t('nav.login')}
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-transform active:scale-95"
                >
                  {t('nav.register')}
                </button>
              </div>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-2 pb-6 space-y-2">
          {/* Mobile Language Switcher */}
          <div className="p-3 bg-stone-50 rounded-2xl mb-2">
            <div className="text-[10px] font-bold uppercase text-stone-500 mb-1.5 flex items-center gap-1">
              <Globe className="w-3 h-3 text-emerald-600" /> {t('nav.select_language')}:
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {availableLanguages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`p-2 rounded-xl text-left flex items-center gap-1.5 transition-all ${
                    currentLanguage === l.code
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-white border border-stone-200 text-stone-700'
                  }`}
                >
                  <span>{l.flag}</span>
                  <span className="truncate">{l.nativeName}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg hover:bg-stone-50"
          >
            {t('nav.home')}
          </button>
          <button
            onClick={() => {
              onNavigate('marketplace');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg hover:bg-stone-50"
          >
            {t('nav.marketplace')}
          </button>
          <button
            onClick={() => {
              onNavigate('prices');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg hover:bg-stone-50"
          >
            {t('nav.prices')}
          </button>
          <button
            onClick={() => {
              onNavigate('assistant');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg hover:bg-stone-50 text-emerald-700 font-bold"
          >
            {t('nav.assistant')}
          </button>
          {user && (
            <button
              onClick={() => {
                onNavigate(getDashboardPage());
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg hover:bg-stone-50 text-emerald-800"
            >
              My Dashboard ({user.role})
            </button>
          )}
          {user ? (
            <button
              onClick={() => {
                onNavigate('orders');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg hover:bg-stone-50"
            >
              Orders Tracking
            </button>
          ) : (
            <div className="pt-2 border-t border-stone-100 flex gap-2">
              <button
                onClick={() => {
                  onNavigate('login');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-center text-xs font-bold text-stone-700 border border-stone-300 rounded-xl"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  onNavigate('register');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-center text-xs font-bold text-white bg-emerald-600 rounded-xl"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
