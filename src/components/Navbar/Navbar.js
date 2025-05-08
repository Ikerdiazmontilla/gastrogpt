import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css'; // Changed import
// import {ReactComponent as ChatImg} from '../../assets/chat-svgrepo-com.svg'
// import {ReactComponent as QuestionnaireImg} from '../../assets/question-circle-svgrepo-com.svg'
import secondNavbar from './secondNavbar';

const Navbar = () => {
  return (
    <>
    <nav className={styles.navbar}>
      <div class={styles.firstGroup}>
        <h2> <a href='/chat'> GastroGPT</a></h2>
        <select className={styles.selectLanguage}>
          <option>Español</option>
          <option>English</option>
        </select>
      </div>
      <div className={styles.secondNavGroup}>
        <Link to="/carta" className={styles.navLink}>
          Carta
        </Link>
        <Link to="/chat" className={styles.navLink}>
          Chat
        </Link>
        <Link to="/questionnaire" className={styles.navLink}>
          Menu rápido
        </Link>

    </div>
    </nav>
    </>
  );
};

export default Navbar;