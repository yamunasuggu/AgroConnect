import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, role?: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    role: string;
    location: string;
    farmName?: string;
  }) => Promise<void>;
  logout: () => void;
  switchUserDemo: (userId: string) => Promise<void>;
  switchRoleDemo: (targetRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Quick preset demo users
export const DEMO_USERS = [
  { id: 'farmer-1', name: 'Ramesh Patel', role: 'farmer', farm: 'Patel Natural Farms', location: 'Guntur' },
  { id: 'farmer-2', name: 'Sunita Devi', role: 'farmer', farm: 'Devi Organic Orchards', location: 'Nashik' },
  { id: 'buyer-1', name: 'Aarav Mehta', role: 'buyer', farm: 'GreenMart Wholesalers', location: 'Hyderabad' },
  { id: 'buyer-2', name: 'Meera Nambiar', role: 'buyer', farm: 'FreshTable Hospitality', location: 'Bengaluru' },
  { id: 'admin-1', name: 'Kavita Rao', role: 'admin', farm: 'Platform Admin', location: 'New Delhi' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const storedToken = localStorage.getItem('agroconnect_token');
        if (storedToken) {
          const res = await api.getMe();
          setUser(res.user);
        } else {
          // Default to Farmer Ramesh for immediate interactive preview
          await login('ramesh@agroconnect.farm', 'farmer');
        }
      } catch (err) {
        console.warn('Auth initialization fallback:', err);
        // Login default
        try {
          await login('ramesh@agroconnect.farm', 'farmer');
        } catch {}
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email: string, role?: string) => {
    const res = await api.login(email, role);
    localStorage.setItem('agroconnect_token', res.token);
    setUser(res.user);
  };

  const register = async (data: {
    name: string;
    email: string;
    phone: string;
    role: string;
    location: string;
    farmName?: string;
  }) => {
    const res = await api.register(data);
    localStorage.setItem('agroconnect_token', res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('agroconnect_token');
    setUser(null);
  };

  const switchUserDemo = async (userId: string) => {
    const emails: Record<string, string> = {
      'farmer-1': 'ramesh@agroconnect.farm',
      'farmer-2': 'sunita@agroconnect.farm',
      'buyer-1': 'aarav@greenmart.in',
      'buyer-2': 'meera@freshtable.com',
      'admin-1': 'admin@agroconnect.in',
    };
    const email = emails[userId] || 'ramesh@agroconnect.farm';
    await login(email);
  };

  const switchRoleDemo = async (targetRole: UserRole) => {
    if (targetRole === 'farmer') {
      await switchUserDemo('farmer-1');
    } else if (targetRole === 'buyer') {
      await switchUserDemo('buyer-1');
    } else {
      await switchUserDemo('admin-1');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        loading,
        login,
        register,
        logout,
        switchUserDemo,
        switchRoleDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
