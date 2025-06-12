// src/components/Dish/MenuItemCard.js
import React from 'react';
import styles from './MenuItemCard.module.css';
import { menuItemCardTranslations } from '../../data/translations';
import {
  getTranslatedDishText,
  getEtiquetaUIData, // Esta función ya se importaba, ahora la usaremos para las overlays.
  getAlergenoIcon,
} from '../../utils/menuUtils';

// Recibe la nueva prop 'menuHasImages'
const MenuItemCard = ({ plato, onViewMore, currentLanguage, menuHasImages }) => {
  const T = menuItemCardTranslations[currentLanguage] || menuItemCardTranslations['Español'];

  const nombre = getTranslatedDishText(plato.nombre, currentLanguage);
  const descripcionCorta = getTranslatedDishText(plato.descripcionCorta, currentLanguage);

  // Define la clase CSS de la tarjeta principal condicionalmente
  const cardClass = menuHasImages ? styles.card : `${styles.card} ${styles.cardNoImage}`;
  
  // Función auxiliar para obtener la clase CSS correcta para la etiqueta overlay
  const getTagOverlayClass = (etiquetaKey) => {
    switch (etiquetaKey) {
      case 'popular':
        return styles.popularTagOverlay;
      case 'recomendado':
        return styles.recommendedTagOverlay;
      // Añadir más casos si se necesitaran otras etiquetas overlay en el futuro
      default:
        return '';
    }
  };

  return (
    <div className={cardClass}>
      {menuHasImages && (
        <div className={styles.imageContainer}>
          <img src={process.env.PUBLIC_URL + plato.imagen} alt={nombre} className={styles.dishImage} />
          {/* ==================================================================== */}
          {/* LÓGICA AÑADIDA: Renderizar etiquetas 'popular' y 'recomendado'      */}
          {/* ==================================================================== */}
          <div className={styles.tagsOverlayContainer}>
            {plato.etiquetas && plato.etiquetas.map((etiquetaKey) => {
              // Renderizar solo si la etiqueta es 'popular' o 'recomendado'
              if (etiquetaKey === 'popular' || etiquetaKey === 'recomendado') {
                const { label, icon } = getEtiquetaUIData(etiquetaKey, currentLanguage);
                const tagClass = getTagOverlayClass(etiquetaKey);
                
                return (
                  <div key={etiquetaKey} className={`${styles.tagOverlay} ${tagClass}`}>
                    {icon && <span className={styles.tagOverlayIcon}>{icon}</span>}
                    {label}
                  </div>
                );
              }
              return null; // No renderizar otras etiquetas en el overlay
            })}
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
              title={getAlergenoIcon(alergenoKey)} // El tooltip es útil para accesibilidad
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