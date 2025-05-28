// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import ChatPage from './pages/ChatPage';
import QuestionnairePage from './pages/QuestionnairePage';
import CartaPage from './pages/CartaPage/CartaPage'; // Import CartaPage
import './App.css';

// Define the order of tabs for swipe navigation
const tabPaths = ['/carta', '/chat', '/questionnaire'];
const SWIPE_THRESHOLD_X = 75; // Minimum horizontal distance for a swipe
// Adjusted: Vertical movement must be less than 75% of horizontal movement
const SWIPE_VERTICAL_TOLERANCE_FACTOR = 0.5; 

function AppContent() {
  const [language, setLanguage] = useState('Español');
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);

  // Refs to store touch start coordinates and movement
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchEndXRef = useRef(0);
  const touchEndYRef = useRef(0);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  useEffect(() => {
    const PcontainerNode = containerRef.current; 

    const handleTouchStart = (e) => {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      touchEndXRef.current = e.touches[0].clientX; 
      touchEndYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      touchEndXRef.current = e.touches[0].clientX;
      touchEndYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      const deltaX = touchEndXRef.current - touchStartXRef.current;
      const deltaY = touchEndYRef.current - touchStartYRef.current;

      if (
        Math.abs(deltaX) > SWIPE_THRESHOLD_X &&
        Math.abs(deltaY) < Math.abs(deltaX) * SWIPE_VERTICAL_TOLERANCE_FACTOR 
      ) {
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

      touchStartXRef.current = 0;
      touchStartYRef.current = 0;
      touchEndXRef.current = 0;
      touchEndYRef.current = 0;
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
          <Route path="/questionnaire" element={<QuestionnairePage currentLanguage={language} />} />
          <Route path="/carta" element={<CartaPage currentLanguage={language} />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;