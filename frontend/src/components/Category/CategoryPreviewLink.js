// frontend/src/components/Category/CategoryPreviewLink.js
import React from 'react';
import styles from './CategoryPreviewLink.module.css';

const CategoryPreviewLink = ({ emoji, categoryName, onClick }) => {
  return (
    // Ahora el botón envuelve todo el "card"
    <button className={styles.categoryCard} onClick={onClick}>
      <span className={styles.categoryIcon}>{emoji}</span>
      <span className={styles.categoryName}>{categoryName}</span>
    </button>
  );
};

export default CategoryPreviewLink;