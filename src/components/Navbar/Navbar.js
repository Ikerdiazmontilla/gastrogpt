// import {ReactComponent as ChatImg} from '../../assets/chat-svgrepo-com.svg'
// import {ReactComponent as QuestionnaireImg} from '../../assets/question-circle-svgrepo-com.svg'
// import secondNavbar from './secondNavbar';
import React from 'react';
import { NavLink } from 'react-router-dom'; 
import styles from './Navbar.module.css';

const Navbar = () => {
  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.firstGroup}> {/* 2. Corrected class to className */}
          <h2> <a href='/chat'> GastroGPT</a></h2>
          <select className={styles.selectLanguage}>
            <option>Español</option>
            <option>English</option>
          </select>
        </div>
        <div className={styles.secondNavGroup}>
          <NavLink
            to="/carta"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            📖 Carta
          </NavLink>
          <NavLink
            to="/chat"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            💬 Chat
          </NavLink>
          <NavLink
            to="/questionnaire"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            🍔Menu rápido
          </NavLink>
        </div>
      </nav>
    </>
  );
};

export default Navbar;