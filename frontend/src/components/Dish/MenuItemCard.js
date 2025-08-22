// src/components/Dish/MenuItemCard.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './MenuItemCard.module.css';
import {
  getTranslatedDishText,
  getEtiquetaUIData,
  getAlergenoIcon,
  getAlergenoNombre, // Import for the title attribute
} from '../../utils/menuUtils';
// NEW: Import the hook to access user's allergens
import { useAllergens } from '../../context/AllergenContext';

const MenuItemCard = ({ plato, onViewMore, menuHasImages, categoryKey, showShortDescriptionInMenu }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  
  // NEW: Get user's selected allergens from the context
  const { allergens: userAllergens } = useAllergens();

  const nombre = getTranslatedDishText(plato.nombre, currentLanguage);
  const descripcion = getTranslatedDishText(plato.descripcion, currentLanguage);
  const shouldShowImage = menuHasImages && plato.imagen;

  // NEW: Check for matching allergens
  const matchingAllergens = plato.alergenos?.filter(allergen => userAllergens.includes(allergen)) || [];
  const hasMatchingAllergen = matchingAllergens.length > 0;

  const getBaseCardClasses = () => {
    const classes = [styles.card];
    if (categoryKey && styles[`card-${categoryKey}`]) {
      classes.push(styles[`card-${categoryKey}`]);
    } else {
      classes.push(styles['card-default']);
    }
    // NEW: Add allergen-specific class if there's a match
    if (hasMatchingAllergen) {
      classes.push(styles.hasAllergen);
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
        <div className={styles.textContent}>
          <div>
            <h3 className={styles.dishName}>{nombre}</h3>
            {showShortDescriptionInMenu && descripcion && (
              <p className={styles.dishDescription}>{descripcion}</p>
            )}
          </div>
          <div className={styles.cardBottom}>
            <div className={styles.detailsRow}>
              <div className={styles.allergensContainer}>
                {/* MODIFIED: Apply warning class to matching allergens */}
                {plato.alergenos && plato.alergenos.map((alergenoKey) => (
                  <span 
                    key={alergenoKey} 
                    className={`${styles.allergenIcon} ${matchingAllergens.includes(alergenoKey) ? styles.warning : ''}`} 
                    title={getAlergenoNombre(alergenoKey, currentLanguage)}
                  >
                    {matchingAllergens.includes(alergenoKey) && <span className={styles.warningSymbol}>⚠️</span>}
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
        
        {showShortDescriptionInMenu && descripcion && (
          <p className={styles.dishDescription}>{descripcion}</p>
        )}

        <div className={styles.cardFooter}>
          <div className={styles.allergensContainer}>
             {/* MODIFIED: Apply warning class to matching allergens */}
            {plato.alergenos && plato.alergenos.map((alergenoKey) => (
               <span 
                key={alergenoKey} 
                className={`${styles.allergenIcon} ${matchingAllergens.includes(alergenoKey) ? styles.warning : ''}`} 
                title={getAlergenoNombre(alergenoKey, currentLanguage)}
              >
                {matchingAllergens.includes(alergenoKey) && <span className={styles.warningSymbol}>⚠️</span>}
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