// src/components/MenuItemCard/MenuItemCard.js
import React from 'react';
import styles from './MenuItemCard.module.css';
import { getAlergenoIcon, getTranslatedDishText } from '../../data/menuData'; // Updated import

const translations = {
  Español: {
    viewMore: "Ver más",
    popular: "Popular",
    recommended: "Recomendado"
  },
  English: {
    viewMore: "View More",
    popular: "Popular",
    recommended: "Recommended"
  }
};

const MenuItemCard = ({ plato, onViewMore, currentLanguage }) => {
  const T = translations[currentLanguage] || translations['Español'];

  const nombre = getTranslatedDishText(plato.nombre, currentLanguage);
  const descripcionCorta = getTranslatedDishText(plato.descripcionCorta, currentLanguage);

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={plato.imagen} alt={nombre} className={styles.dishImage} />
        <div className={styles.tagsOverlay}>
          {plato.etiquetas.includes("popular") && (
            <span className={`${styles.tag} ${styles.popularTag}`}>
              ⭐ {T.popular}
            </span>
          )}
          {plato.etiquetas.includes("recomendado") && (
            <span className={`${styles.tag} ${styles.recommendedTag}`}>
              👨‍🍳 {T.recommended}
            </span>
          )}
        </div>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h3 className={styles.dishName}>{nombre}</h3>
          <span className={styles.dishPrice}>{plato.precio.toFixed(2)}€</span>
        </div>
        <p className={styles.dishDescription}>{descripcionCorta}</p>
        <div className={styles.allergenIcons}>
          {plato.alergenos.map((alergenoKey) => (
            <span
              key={alergenoKey}
              className={styles.allergenIcon}
              title={alergenoKey}
            >
              {getAlergenoIcon(alergenoKey)}
            </span>
          ))}
        </div>
        <button className={styles.viewMoreButton} onClick={() => onViewMore(plato)}>
          {T.viewMore}
        </button>
      </div>
    </div>
  );
};

export default MenuItemCard;