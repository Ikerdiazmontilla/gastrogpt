// src/components/Dish/MenuItemCard.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './MenuItemCard.module.css';
import {
  getTranslatedDishText,
  getEtiquetaUIData,
  getAlergenoIcon,
} from '../../utils/menuUtils';

const MenuItemCard = ({ plato, onViewMore, menuHasImages, categoryKey }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const nombre = getTranslatedDishText(plato.nombre, currentLanguage);
  const shouldShowImage = menuHasImages && plato.imagen;

  // --- Clases base para la tarjeta ---
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

  // --- RENDERIZADO CONDICIONAL: Dos layouts diferentes ---

  // Layout 1: Tarjeta CON IMAGEN
  if (shouldShowImage) {
    const cardClasses = [...getBaseCardClasses(), styles.hasImage].join(' ');

    return (
      <div className={cardClasses} onClick={() => onViewMore(plato)}>
        {/* Columna de Texto */}
        <div className={styles.textContent}>
          <div>
            <h3 className={styles.dishName}>{nombre}</h3>
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

        {/* Columna de Imagen */}
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

  // Layout 2: Tarjeta SIN IMAGEN
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