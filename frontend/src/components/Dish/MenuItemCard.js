// src/components/Dish/MenuItemCard.js
import React from 'react';
import styles from './MenuItemCard.module.css';
import { menuItemCardTranslations } from '../../data/translations';
import {
  getTranslatedDishText,
  getEtiquetaUIData,
  getAlergenoIcon,
} from '../../utils/menuUtils';

// Recibe la nueva prop 'menuHasImages'
const MenuItemCard = ({ plato, onViewMore, currentLanguage, menuHasImages }) => {
  const T = menuItemCardTranslations[currentLanguage] || menuItemCardTranslations['Español'];

  const nombre = getTranslatedDishText(plato.nombre, currentLanguage);
  const descripcionCorta = getTranslatedDishText(plato.descripcionCorta, currentLanguage);

  // Define la clase CSS de la tarjeta principal condicionalmente
  const cardClass = menuHasImages ? styles.card : `${styles.card} ${styles.cardNoImage}`;

  return (
    <div className={cardClass}>
      {/* RENDERIZADO CONDICIONAL: El contenedor de la imagen solo se renderiza si menuHasImages es true */}
      {menuHasImages && (
        <div className={styles.imageContainer}>
          <img src={process.env.PUBLIC_URL + plato.imagen} alt={nombre} className={styles.dishImage} />
          <div className={styles.tagsOverlayContainer}>
            {/* La lógica de las etiquetas overlay no cambia */}
          </div>
        </div>
      )}

      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h3 className={styles.dishName}>{nombre}</h3>
          <span className={styles.dishPrice}>{plato.precio.toFixed(2)}€</span>
        </div>
        <p className={styles.dishDescription}>{descripcionCorta}</p>
        <div className={styles.allergenIcons}>
          {plato.alergenos && plato.alergenos.map((alergenoKey) => (
            <span
              key={alergenoKey}
              className={styles.allergenIcon}
              title={getAlergenoIcon(alergenoKey)}
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