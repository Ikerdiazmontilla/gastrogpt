// src/components/Dish/MenuItemCard.js
import React from 'react';
import styles from './MenuItemCard.module.css';
import { menuItemCardTranslations } from '../../data/translations'; // Translations
import {
  getTranslatedDishText,
  getEtiquetaUIData,
  getAlergenoIcon,
  // getAlergenoNombre // Not used directly in card, but icon title could use it
} from '../../utils/menuUtils'; // Utilities from menuUtils

// Define which tags should appear in the overlay (config can stay here or move to menuUtils if complex)
const overlayTagsConfig = {
  popular: { styleClass: styles.popularTagOverlay },
  recomendado: { styleClass: styles.recommendedTagOverlay },
  vegano: { styleClass: styles.veganTagOverlay },
  vegetariano: { styleClass: styles.vegetarianTagOverlay },
  picante_suave: { styleClass: styles.spicyTagOverlay }
  // Add other picante levels here if needed
};

const MenuItemCard = ({ plato, onViewMore, currentLanguage }) => {
  const T = menuItemCardTranslations[currentLanguage] || menuItemCardTranslations['Español'];

  const nombre = getTranslatedDishText(plato.nombre, currentLanguage);
  const descripcionCorta = getTranslatedDishText(plato.descripcionCorta, currentLanguage);

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {/* Ensure plato.imagen path is correct */}
        <img src={process.env.PUBLIC_URL + plato.imagen} alt={nombre} className={styles.dishImage} />
        <div className={styles.tagsOverlayContainer}>
          {plato.etiquetas && plato.etiquetas.map(tagKey => { // Added check for plato.etiquetas
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
          {plato.alergenos && plato.alergenos.map((alergenoKey) => ( // Added check for plato.alergenos
            <span
              key={alergenoKey}
              className={styles.allergenIcon}
              title={getAlergenoIcon(alergenoKey)} // Icon itself as title, could be getAlergenoNombre for full name
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