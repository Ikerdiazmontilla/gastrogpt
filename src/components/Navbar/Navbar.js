import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css'; // Changed import
import {ReactComponent as ChatImg} from '../../assets/chat-svgrepo-com.svg'
import {ReactComponent as QuestionnaireImg} from '../../assets/question-circle-svgrepo-com.svg'

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <h2> <a href='/chat'> GastroGPT</a></h2>
      <div>
        <Link to="/questionnaire" className={styles.navLink}>
          <QuestionnaireImg className={`${styles.svg} ${styles.questionnaire}`}/>
        </Link>
        <Link to="/chat" className={styles.navLink}>
          <ChatImg className={`${styles.svg} ${styles.chat}`}/>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;