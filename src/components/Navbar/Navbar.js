// src/components/Navbar/Navbar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';
import { navbarTranslations } from '../../data/translations'; // Translations

const Navbar = ({ onLanguageChange, currentLanguage }) => {
  const handleLanguageSelect = (event) => {
    const selectedValue = event.target.value;
    onLanguageChange(selectedValue);
  };

  const T = navbarTranslations[currentLanguage] || navbarTranslations['Español'];

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.firstGroup}>
          {/* Link to /chat which redirects to / if it's the home */}
          <h2> <NavLink to="/chat" style={{color: 'white'}}> GastroGPT</NavLink></h2>
          <select
            className={styles.selectLanguage}
            value={currentLanguage}
            onChange={handleLanguageSelect}
          >
            <option value={'Español'}>Español</option>
            <option value={'English'}>English</option>
          </select>
        </div>
        <div className={styles.secondNavGroup}>
          <NavLink
            to="/carta"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            {T.carta}
          </NavLink>
          <NavLink
            to="/chat"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            {T.chat}
          </NavLink>
          <NavLink
            to="/questionnaire"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            {T.menuRapido}
          </NavLink>
        </div>
      </nav>
    </>
  );
};

export default Navbar;