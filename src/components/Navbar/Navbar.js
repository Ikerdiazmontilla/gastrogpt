import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <h2>ChefGPT Restaurante</h2>
      <div>
        <Link to="/chat" className="nav-link">Chat</Link>
        <Link to="/questionnaire" className="nav-link">Cuestionario</Link>
      </div>
    </nav>
  );
};

export default Navbar;
