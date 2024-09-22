import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import ChatPage from './pages/ChatPage';
import QuestionnairePage from './pages/QuestionnairePage';
import './App.css';

function App() {
  return (
    <Router>
      <div className='nav-container'>
        <Navbar />
      </div>
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/chat" />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/questionnaire" element={<QuestionnairePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
