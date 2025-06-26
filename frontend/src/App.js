// frontend/src/App.js
import React, { useRef, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TenantProvider, useTenant } from './context/TenantContext';
// La importación de OrderProvider ha sido eliminada
import Navbar from './components/Navbar/Navbar';
import ChatPage from './pages/ChatPage';
import CartaPage from './pages/CartaPage/CartaPage';
import ThemeApplicator from './components/Theme/ThemeApplicator';
import LanguageSelector from './components/LanguageSelector/LanguageSelector';
// La importación de OrderSummary ha sido eliminada
import { initialLanguage } from './i18n';
import './App.css';
import Analytics from './Analytics';
// Rutas de las pestañas para la navegación con swipe
const tabPaths = ['/carta', '/chat'];
const SWIPE_THRESHOLD_X = 75;
const SWIPE_VERTICAL_TOLERANCE_FACTOR = 0.25;

function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(!initialLanguage);
  const handleLanguageSelected = () => setShowLanguageSelector(false);
  
  // Refs para el manejo del swipe entre pestañas
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchEndXRef = useRef(0);
  const touchEndYRef = useRef(0);
  const disableTabSwipeRef = useRef(false); // Bandera para deshabilitar swipe en elementos interactivos

  useEffect(() => {
    const PcontainerNode = containerRef.current;

    const handleTouchStart = (e) => {
      // Comprueba si el touch se inició en un elemento que no debería activar el swipe de pestañas
      if (e.target.closest('[data-no-tab-swipe="true"]')) {
        disableTabSwipeRef.current = true;
      } else {
        disableTabSwipeRef.current = false;
      }

      if (!disableTabSwipeRef.current) {
        touchStartXRef.current = e.touches[0].clientX;
        touchStartYRef.current = e.touches[0].clientY;
        touchEndXRef.current = e.touches[0].clientX; // Inicializa EndX también en start
        touchEndYRef.current = e.touches[0].clientY; // Inicializa EndY también en start
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

      // Detecta si es un swipe horizontal significativo, ignorando movimientos verticales menores
      if (Math.abs(deltaX) > SWIPE_THRESHOLD_X && Math.abs(deltaY) < Math.abs(deltaX) * SWIPE_VERTICAL_TOLERANCE_FACTOR) {
        const currentIndex = tabPaths.indexOf(location.pathname);
        if (currentIndex === -1) return; // Si no estamos en una ruta de pestaña, no hacer nada

        let nextIndex;
        if (deltaX < 0) { // Swipe a la izquierda
          nextIndex = (currentIndex + 1) % tabPaths.length;
        } else { // Swipe a la derecha
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
  }, [navigate, location.pathname]); // Dependencias del efecto

  // Si el selector de idioma debe mostrarse, renderizarlo.
  if (showLanguageSelector) {
    return <LanguageSelector onLanguageSelect={handleLanguageSelected} />;
  }

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
      {/* El componente OrderSummary ha sido eliminado */}
    </>
  );
}

// Componente que maneja la carga de la configuración del tenant y los errores.
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

// Componente principal de la aplicación.
function App() {
  return (
    <Router>
      {/* TenantProvider envuelve toda la aplicación para proporcionar la configuración del inquilino */}
      <TenantProvider>
        
        <ThemeApplicator /> {/* Aplica los estilos del tema del inquilino */}
        <Analytics /> 
        <AppContent />
        {/* El cierre de OrderProvider ha sido eliminado */}
      </TenantProvider>
    </Router>
  );
}

export default App;