import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './pages/AuthModal';
import { FloatingAIAssistant } from './components/FloatingAIAssistant';

import { HomePage } from './pages/HomePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { CropDetailsPage } from './pages/CropDetailsPage';
import { FarmerProfilePage } from './pages/FarmerProfilePage';
import { FarmerDashboardPage } from './pages/FarmerDashboardPage';
import { BuyerDashboardPage } from './pages/BuyerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AddCropPage } from './pages/AddCropPage';
import { OrdersPage } from './pages/OrdersPage';
import { MarketPricesPage } from './pages/MarketPricesPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

import { api } from './services/api';
import { Crop, MarketplaceStats } from './types';

function AppContent() {
  const { user, role } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [navigationParams, setNavigationParams] = useState<any>({});
  
  const [crops, setCrops] = useState<Crop[]>([]);
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const loadPlatformData = async () => {
    try {
      const [cropsRes, statsRes] = await Promise.all([
        api.getCrops(),
        api.getMarketStats(),
      ]);
      setCrops(cropsRes.crops || []);
      setStats(statsRes.stats || null);
    } catch (e) {
      console.error('Failed to load initial marketplace data', e);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadPlatformData();
  }, []);

  const handleNavigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setNavigationParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF6] text-[#1A2E1A]">
      {/* Top Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            crops={crops}
            stats={stats}
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentPage === 'marketplace' && (
          <MarketplacePage
            crops={crops}
            onSelectCrop={(crop) => handleNavigate('crop_details', { cropId: crop.id })}
            onQuickBuy={(crop) => handleNavigate('crop_details', { cropId: crop.id, autoBuy: true })}
            onRefresh={loadPlatformData}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'crop_details' && (
          <CropDetailsPage
            cropId={navigationParams.cropId}
            autoBuy={navigationParams.autoBuy}
            onBack={() => handleNavigate('marketplace')}
            onNavigate={handleNavigate}
            onOpenAuth={() => handleOpenAuth('login')}
          />
        )}

        {currentPage === 'farmer_profile' && (
          <FarmerProfilePage
            farmerId={navigationParams.farmerId}
            onBack={() => handleNavigate('marketplace')}
            onSelectCrop={(crop) => handleNavigate('crop_details', { cropId: crop.id })}
            onQuickBuy={(crop) => handleNavigate('crop_details', { cropId: crop.id, autoBuy: true })}
          />
        )}

        {currentPage === 'farmer_dashboard' && (
          <FarmerDashboardPage
            onNavigate={handleNavigate}
            onSelectCrop={(crop) => handleNavigate('crop_details', { cropId: crop.id })}
          />
        )}

        {currentPage === 'buyer_dashboard' && (
          <BuyerDashboardPage
            onNavigate={handleNavigate}
            onSelectCrop={(crop) => handleNavigate('crop_details', { cropId: crop.id })}
          />
        )}

        {currentPage === 'admin_dashboard' && <AdminDashboardPage />}

        {currentPage === 'add_crop' && (
          <AddCropPage
            onBack={() => handleNavigate('farmer_dashboard')}
            onSuccess={() => {
              loadPlatformData();
              handleNavigate('farmer_dashboard');
            }}
          />
        )}

        {currentPage === 'orders' && (
          <OrdersPage
            onNavigate={handleNavigate}
            onOpenAuth={() => handleOpenAuth('login')}
          />
        )}

        {currentPage === 'prices' && <MarketPricesPage />}

        {currentPage === 'assistant' && <AIAssistantPage />}

        {currentPage === 'login' && <LoginPage onNavigate={handleNavigate} />}

        {currentPage === 'register' && <RegisterPage onNavigate={handleNavigate} />}
      </main>

      {/* Omnipresent Floating & Side AI Assistant */}
      <FloatingAIAssistant onNavigate={handleNavigate} />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          loadPlatformData();
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
