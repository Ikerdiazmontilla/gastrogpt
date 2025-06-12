// frontend/src/components/Navbar/Navbar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';
import { navbarTranslations } from '../../data/translations';
import { useTenant } from '../../context/TenantContext'; 

const Navbar = ({ onLanguageChange, currentLanguage }) => {
  const { tenantConfig } = useTenant(); // Usamos el hook
  const logoUrl = tenantConfig?.theme?.logoUrl; // Obtenemos la URL del logo del tema


  const handleLanguageSelect = (event) => {
    const selectedValue = event.target.value;
    onLanguageChange(selectedValue);
  };

  const T = navbarTranslations[currentLanguage] || navbarTranslations['Español'];

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.firstGroup}>
          <h2>
            <NavLink to="/chat" style={{ color: 'white' }}>
              {/* Se usa el logo dinámico. Si no existe, se muestra uno por defecto. */}
              <img src={logoUrl || '/logos/default-logo.png'} alt="Restaurant Logo" className={styles.logoImage} />
            </NavLink>
          </h2>
          <select
            className={styles.selectLanguage}
            value={currentLanguage}
            onChange={handleLanguageSelect}
          >
            <option value={'Español'}>🇪🇸Español</option>
            <option value={'English'}>🇬🇧English</option>
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
        </div>
      </nav>
    </>
  );
};

export default Navbar;