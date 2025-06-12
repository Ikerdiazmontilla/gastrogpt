// frontend/src/components/Navbar/Navbar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Navbar.module.css';
import { useTenant } from '../../context/TenantContext';

const supportedLanguages = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
];

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { tenantConfig } = useTenant();
  const logoUrl = tenantConfig?.theme?.logoUrl;

  const handleLanguageSelect = (event) => {
    const selectedLanguageCode = event.target.value;
    i18n.changeLanguage(selectedLanguageCode);
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.firstGroup}>
          <h2>
            <NavLink to="/chat" style={{ color: 'white' }}>
              <img src={logoUrl || '/logos/default-logo.png'} alt="Restaurant Logo" className={styles.logoImage} />
            </NavLink>
          </h2>
          <select
            className={styles.selectLanguage}
            value={i18n.language}
            onChange={handleLanguageSelect}
          >
            {supportedLanguages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {t(`navbar.languages.${lang.code}`)}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.secondNavGroup}>
          <NavLink
            to="/carta"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            {t('navbar.menu')}
          </NavLink>
          <NavLink
            to="/chat"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            {t('navbar.chat')}
          </NavLink>
        </div>
      </nav>
    </>
  );
};

export default Navbar;