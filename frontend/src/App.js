// frontend/src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { TenantProvider, useTenant } from './context/TenantContext';
import Navbar from './components/Navbar/Navbar';
import ChatPage from './pages/ChatPage';
import CartaPage from './pages/CartaPage/CartaPage';
import ThemeApplicator from './components/Theme/ThemeApplicator'; // Importamos el aplicador de tema
import './App.css';

const tabPaths = ['/carta', '/chat'];
const SWIPE_THRESHOLD_X = 75;
const SWIPE_VERTICAL_TOLERANCE_FACTOR = 0.75;

function MainApp() {
  const [language, setLanguage] = useState('Español');
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);

  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchEndXRef = useRef(0);
  const touchEndYRef = useRef(0);
  const disableTabSwipeRef = useRef(false);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

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
        if (deltaX < 0) { // Swiped Left
          nextIndex = (currentIndex + 1) % tabPaths.length;
        } else { // Swiped Right
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


  return (
    <>
      <div className='nav-container'>
        <Navbar onLanguageChange={handleLanguageChange} currentLanguage={language} />
      </div>
      <div className="container" ref={containerRef}>
        <Routes>
          <Route path="/" element={<Navigate to="/chat" />} />
          <Route path="/chat" element={<ChatPage currentLanguage={language} />} />
          <Route path="/carta" element={<CartaPage currentLanguage={language} />} />
        </Routes>
      </div>
    </>
  );
}

function AppContent() {
  const { isLoading, error } = useTenant();

  if (isLoading) {
    return <div className="fullscreen-message">Cargando restaurante...</div>;
  }

  if (error) {
    return <div className="fullscreen-message error">Error: {error}</div>;
  }

  return <MainApp />;
}


function App() {
  return (
    <Router>
      <TenantProvider>
        <ThemeApplicator /> {/* El aplicador de tema se pone aquí, dentro del Provider */}
        <AppContent />
      </TenantProvider>
    </Router>
  );
}

export default App;