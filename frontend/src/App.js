// frontend/src/App.js
import React, { useRef, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TenantProvider, useTenant } from './context/TenantContext';
// NEW: Import the AllergenProvider and useAllergens hook
import { AllergenProvider, useAllergens } from './context/AllergenContext';
import Navbar from './components/Navbar/Navbar';
import ChatPage from './pages/ChatPage';
import CartaPage from './pages/CartaPage/CartaPage';
import ThemeApplicator from './components/Theme/ThemeApplicator';
import LanguageSelector from './components/LanguageSelector/LanguageSelector';
// NEW: Import the AllergenSelector component
import AllergenSelector from './components/AllergenSelector/AllergenSelector';
import { initialLanguage } from './i18n';
import './App.css';
import Analytics from './Analytics';

const tabPaths = ['/carta', '/chat'];
const SWIPE_THRESHOLD_X = 75;
const SWIPE_VERTICAL_TOLERANCE_FACTOR = 0.25;

function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(!initialLanguage);
  
  // NEW: Get allergen state
  const { isAllergenChoiceMade } = useAllergens();

  const handleLanguageSelected = () => setShowLanguageSelector(false);
  
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchEndXRef = useRef(0);
  const touchEndYRef = useRef(0);
  const disableTabSwipeRef = useRef(false);

  useEffect(() => {
    const PcontainerNode = containerRef.current;

    const handleTouchStart = (e) => {
      if (e.target.closest('[data-no-tab-swipe="true"]')) {
        disableTabSwipeRef.current = true;
      } else {
        disableTabSwipeRef.current = false;
      }

      if (!disableTabSwipeRef.current) {
        touchStartXRef.current = e.touches[0].clientX;
        touchStartYRef.current = e.touches[0].clientY;
        touchEndXRef.current = e.touches[0].clientX;
        touchEndYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (!disableTabSwipeRef.current) {
        touchEndXRef.current = e.touches[0].clientX;
        touchEndYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = () => {
      if (disableTabSwipeRef.current) {
        disableTabSwipeRef.current = false;
        return;
      }

      const deltaX = touchEndXRef.current - touchStartXRef.current;
      const deltaY = touchEndYRef.current - touchStartYRef.current;

      if (Math.abs(deltaX) > SWIPE_THRESHOLD_X && Math.abs(deltaY) < Math.abs(deltaX) * SWIPE_VERTICAL_TOLERANCE_FACTOR) {
        const currentIndex = tabPaths.indexOf(location.pathname);
        if (currentIndex === -1) return;

        let nextIndex;
        if (deltaX < 0) { 
          nextIndex = (currentIndex + 1) % tabPaths.length;
        } else { 
          nextIndex = (currentIndex - 1 + tabPaths.length) % tabPaths.length;
        }
        navigate(tabPaths[nextIndex]);
      }
    };

    if (PcontainerNode) {
      PcontainerNode.addEventListener('touchstart', handleTouchStart, { passive: true });
      PcontainerNode.addEventListener('touchmove', handleTouchMove, { passive: true });
      PcontainerNode.addEventListener('touchend', handleTouchEnd);

      return () => {
        PcontainerNode.removeEventListener('touchstart', handleTouchStart);
        PcontainerNode.removeEventListener('touchmove', handleTouchMove);
        PcontainerNode.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [navigate, location.pathname]);

  // --- MODIFIED RENDER LOGIC ---
  // 1. Show language selector if needed
  if (showLanguageSelector) {
    return <LanguageSelector onLanguageSelect={handleLanguageSelected} />;
  }
  
  // 2. After language is set, show allergen selector if choice hasn't been made
  if (!isAllergenChoiceMade) {
    return <AllergenSelector />;
  }

  // 3. Once all selections are made, show the main app
  return (
    <>
      <div className='nav-container'>
        <Navbar />
      </div>
      <div className="container" ref={containerRef}>
        <Routes>
          <Route path="/" element={<Navigate to="/chat" />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/carta" element={<CartaPage />} />
        </Routes>
      </div>
    </>
  );
}

function AppContent() {
  const { isLoading, error } = useTenant();
  const { t } = useTranslation();

  if (isLoading) {
    return <div className="fullscreen-message">{t('app.loading')}</div>;
  }

  if (error) {
    return <div className="fullscreen-message error">{t('app.error', { error: error })}</div>;
  }

  return <MainApp />;
}

function App() {
  return (
    <Router>
      <TenantProvider>
        {/* NEW: Wrap AppContent with AllergenProvider */}
        <AllergenProvider>
          <ThemeApplicator />
          <Analytics /> 
          <AppContent />
        </AllergenProvider>
      </TenantProvider>
    </Router>
  );
}

export default App;