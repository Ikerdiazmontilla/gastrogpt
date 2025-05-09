// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import ChatPage from './pages/ChatPage';
import QuestionnairePage from './pages/QuestionnairePage';
import CartaPage from './pages/CartaPage/CartaPage'; // Import CartaPage
import './App.css';
import { useState } from 'react';


function App() {
  const [language, setLanguage] = useState('Español');
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };
  return (
    <Router>
      <div className='nav-container'>
        <Navbar onLanguageChange={handleLanguageChange} currentLanguage={language}/>
      </div>
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/chat" />} />
          <Route path="/chat" element={<ChatPage currentLanguage={language}/>} />
          <Route path="/questionnaire" element={<QuestionnairePage currentLanguage={language} />} />
          {/* Add new route for CartaPage */}
          <Route path="/carta" element={<CartaPage currentLanguage={language} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;