import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';


const secondNavbar = () => {
  return (
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
  );
};

export default secondNavbar;