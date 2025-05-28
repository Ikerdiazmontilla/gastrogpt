// <file path="frontend/src/App.js">
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import ChatPage from './pages/ChatPage';
import QuestionnairePage from './pages/QuestionnairePage';
import CartaPage from './pages/CartaPage/CartaPage';
import './App.css';

const tabPaths = ['/carta', '/chat', '/questionnaire'];
const SWIPE_THRESHOLD_X = 75; 
const SWIPE_VERTICAL_TOLERANCE_FACTOR = 0.75; 

function AppContent() {
  const [language, setLanguage] = useState('Español');
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);

  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchEndXRef = useRef(0);
  const touchEndYRef = useRef(0);
  const disableTabSwipeRef = useRef(false); // Ref to flag if tab swipe should be disabled

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  useEffect(() => {
    const PcontainerNode = containerRef.current; 

    const handleTouchStart = (e) => {
      // Check if the touch started on an element that should prevent tab swiping
      if (e.target.closest('[data-no-tab-swipe="true"]')) {
        disableTabSwipeRef.current = true;
      } else {
        disableTabSwipeRef.current = false;
      }

      // Only record start points for tab swiping if it's not disabled
      if (!disableTabSwipeRef.current) {
        touchStartXRef.current = e.touches[0].clientX;
        touchStartYRef.current = e.touches[0].clientY;
        touchEndXRef.current = e.touches[0].clientX; 
        touchEndYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      // Only update coordinates for tab swiping if it's not disabled
      if (!disableTabSwipeRef.current) {
        touchEndXRef.current = e.touches[0].clientX;
        touchEndYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = () => {
      // If the touch interaction was flagged to disable tab swipe (i.e., started on suggestions),
      // reset the flag and do not proceed with tab navigation.
      if (disableTabSwipeRef.current) {
        disableTabSwipeRef.current = false; // Reset for the next touch interaction
        // Also reset coordinates that might have been partially set if logic changes
        touchStartXRef.current = 0;
        touchStartYRef.current = 0;
        touchEndXRef.current = 0;
        touchEndYRef.current = 0;
        return;
      }

      // Proceed with tab navigation logic only if not disabled
      const deltaX = touchEndXRef.current - touchStartXRef.current;
      const deltaY = touchEndYRef.current - touchStartYRef.current;
      
      // Ensure there was actual movement recorded for tab swipe consideration
      // This prevents taps on the main container (not on suggestions) from being processed if threshold is low
      if (touchStartXRef.current === 0 && touchEndXRef.current === 0 && touchStartYRef.current === 0 && touchEndYRef.current === 0 && deltaX === 0 && deltaY === 0) {
         // This means coordinates were not set because disableTabSwipeRef was true at touchstart or some other edge case.
         // Or it was a tap that didn't move.
        return; 
      }


      if (
        Math.abs(deltaX) > SWIPE_THRESHOLD_X &&
        Math.abs(deltaY) < Math.abs(deltaX) * SWIPE_VERTICAL_TOLERANCE_FACTOR 
      ) {
        const currentIndex = tabPaths.indexOf(location.pathname);
        if (currentIndex === -1) { // Path not in swipeable tabs
             // Reset coordinates before returning
            touchStartXRef.current = 0;
            touchStartYRef.current = 0;
            touchEndXRef.current = 0;
            touchEndYRef.current = 0;
            disableTabSwipeRef.current = false;
            return;
        }

        let nextIndex;
        if (deltaX < 0) { // Swiped Left
          nextIndex = (currentIndex + 1) % tabPaths.length;
        } else { // Swiped Right
          nextIndex = (currentIndex - 1 + tabPaths.length) % tabPaths.length;
        }
        navigate(tabPaths[nextIndex]);
      }

      // Reset coordinates and the disable flag for the next touch interaction
      touchStartXRef.current = 0;
      touchStartYRef.current = 0;
      touchEndXRef.current = 0;
      touchEndYRef.current = 0;
      disableTabSwipeRef.current = false; 
    };

    if (PcontainerNode) {
      // Note: passive: true can sometimes make it harder to prevent default actions if needed later.
      // For this specific case where we're just *not acting* on our own JS navigation, it should be okay.
      PcontainerNode.addEventListener('touchstart', handleTouchStart, { passive: true });
      PcontainerNode.addEventListener('touchmove', handleTouchMove, { passive: true });
      PcontainerNode.addEventListener('touchend', handleTouchEnd); // touchend doesn't benefit much from passive

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