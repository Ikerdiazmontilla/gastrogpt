import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import {ReactComponent as ChatImg} from '../../assets/chat-svgrepo-com.svg'
import {ReactComponent as QuestionnaireImg} from '../../assets/question-circle-svgrepo-com.svg'

const Navbar = () => {
  return (
    <nav className="navbar">
      <h2> <a href='/chat'> GastroGPT</a></h2>
      <div>
        <Link to="/questionnaire" className="nav-link"><QuestionnaireImg className='svg questionnaire'/></Link>
        <Link to="/chat" className="nav-link"><ChatImg className='svg chat'/></Link>
      </div>
    </nav>
  );
};

export default Navbar;
