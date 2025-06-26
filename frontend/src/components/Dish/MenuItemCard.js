// src/components/Dish/MenuItemCard.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './MenuItemCard.module.css';
import {
  getTranslatedDishText,
  getEtiquetaUIData,
  getAlergenoIcon,
} from '../../utils/menuUtils';

// The component now accepts `showShortDescriptionInMenu` to control description visibility
const MenuItemCard = ({ plato, onViewMore, menuHasImages, categoryKey, showShortDescriptionInMenu }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const nombre = getTranslatedDishText(plato.nombre, currentLanguage);
  // Changed from `descripcionCorta` to `descripcion` to get the main description.
  const descripcion = getTranslatedDishText(plato.descripcion, currentLanguage);
  const shouldShowImage = menuHasImages && plato.imagen;

  // --- Base classes for the card ---
  const getBaseCardClasses = () => {
    const classes = [styles.card];
    if (categoryKey && styles[`card-${categoryKey}`]) {
      classes.push(styles[`card-${categoryKey}`]);
    } else {
      classes.push(styles['card-default']);
    }
    return classes;
  };

  const getTagOverlayClass = (etiquetaKey) => {
    switch (etiquetaKey) {
      case 'popular': return styles.popularTagOverlay;
      case 'recomendado': return styles.recommendedTagOverlay;
      default: return '';
    }
  };

  // Layout 1: Card WITH IMAGE
  if (shouldShowImage) {
    const cardClasses = [...getBaseCardClasses(), styles.hasImage].join(' ');

    return (
      <div className={cardClasses} onClick={() => onViewMore(plato)}>
        {/* Text Column */}
        <div className={styles.textContent}>
          <div>
            <h3 className={styles.dishName}>{nombre}</h3>
            {/* Now displays the main description if the prop is true. CSS handles truncation. */}
            {showShortDescriptionInMenu && descripcion && (
              <p className={styles.dishDescription}>{descripcion}</p>
            )}
          </div>
          <div className={styles.cardBottom}>
            <div className={styles.detailsRow}>
              <div className={styles.allergensContainer}>
                {plato.alergenos && plato.alergenos.map((alergenoKey) => (
                  <span key={alergenoKey} className={styles.allergenIcon} title={getAlergenoIcon(alergenoKey)}>
                    {getAlergenoIcon(alergenoKey)}
                  </span>
                ))}
              </div>
              {(plato.precio != null && plato.precio > 0) && (
                <span className={styles.dishPrice}>{plato.precio.toFixed(2)}€</span>
              )}
            </div>
          </div>
        </div>

        {/* Image Column */}
        <div className={styles.mediaContent}>
          <img src={process.env.PUBLIC_URL + plato.imagen} alt={nombre} className={styles.dishImage} />
          <div className={styles.tagsOverlayContainer}>
            {plato.etiquetas && plato.etiquetas.map((etiquetaKey) => {
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
              return null;
            })}
          </div>
        </div>
      </div>
    );
  }

  // Layout 2: Card WITHOUT IMAGE
  const cardClasses = [...getBaseCardClasses(), styles.noImage].join(' ');

  return (
    <div className={cardClasses} onClick={() => onViewMore(plato)}>
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h3 className={styles.dishName}>{nombre}</h3>
          {(plato.precio != null && plato.precio > 0) && (
            <span className={styles.dishPriceNoImage}>
              {plato.precio.toFixed(2)}€
              {plato.precio_por_persona && (
                <span className={styles.perPersonIndicator}>
                  {' '}{t('menuItemCard.perPersonShort')}
                </span>
              )}
            </span>
          )}
        </div>
        
        {/* Now displays the main description if the prop is true. CSS handles truncation. */}
        {showShortDescriptionInMenu && descripcion && (
          <p className={styles.dishDescription}>{descripcion}</p>
        )}

        <div className={styles.cardFooter}>
          <div className={styles.allergensContainer}>
            {plato.alergenos && plato.alergenos.map((alergenoKey) => (
              <span key={alergenoKey} className={styles.allergenIcon} title={getAlergenoIcon(alergenoKey)}>
                {getAlergenoIcon(alergenoKey)}
              </span>
            ))}
          </div>
          <button className={styles.viewMoreLink} onClick={(e) => { e.stopPropagation(); onViewMore(plato); }}>
            {t('menuItemCard.viewMore')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;