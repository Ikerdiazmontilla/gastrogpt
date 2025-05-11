// src/components/MenuItemCard/MenuItemCard.js
import React from 'react';
import styles from './MenuItemCard.module.css';
import { getAlergenoIcon, getTranslatedDishText, getEtiquetaUIData } from '../../data/menuData';

const translations = {
  Español: {
    viewMore: "Ver más",
    // Overlay tag labels will now come from getEtiquetaUIData
  },
  English: {
    viewMore: "View More",
  }
};

// Define which tags should appear in the overlay
const overlayTagsConfig = {
  popular: { styleClass: styles.popularTagOverlay },
  recomendado: { styleClass: styles.recommendedTagOverlay },
  vegano: { styleClass: styles.veganTagOverlay },
  vegetariano: { styleClass: styles.vegetarianTagOverlay },
  picante_suave: { styleClass: styles.spicyTagOverlay }
  // Add other picante levels here if needed
};

const MenuItemCard = ({ plato, onViewMore, currentLanguage }) => {
  const T = translations[currentLanguage] || translations['Español'];

  const nombre = getTranslatedDishText(plato.nombre, currentLanguage);
  const descripcionCorta = getTranslatedDishText(plato.descripcionCorta, currentLanguage);

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={plato.imagen} alt={nombre} className={styles.dishImage} />
        <div className={styles.tagsOverlayContainer}>
          {plato.etiquetas.map(tagKey => {
            const config = overlayTagsConfig[tagKey];
            if (config) {
              const { label, icon } = getEtiquetaUIData(tagKey, currentLanguage);
              return (
                <span key={tagKey} className={`${styles.tagOverlay} ${config.styleClass}`}>
                  {icon && <span className={styles.tagOverlayIcon}>{icon}</span>}
                  {label}
                </span>
              );
            }
            return null;
          })}
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
              title={getAlergenoIcon(alergenoKey)} // Title could be translated name later
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