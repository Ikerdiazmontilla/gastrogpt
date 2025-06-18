// src/components/Dish/MenuItemCard.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './MenuItemCard.module.css';
import {
  getTranslatedDishText,
  getEtiquetaUIData,
  getAlergenoIcon,
} from '../../utils/menuUtils';

const MenuItemCard = ({ plato, onViewMore, menuHasImages }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const nombre = getTranslatedDishText(plato.nombre, currentLanguage);
  const descripcionCorta = getTranslatedDishText(plato.descripcionCorta, currentLanguage);

  // Check both the global flag and the specific dish property to decide if an image should be shown.
  const shouldShowImage = menuHasImages && plato.imagen;

  // Apply a different class if no image will be shown.
  const cardClass = shouldShowImage ? styles.card : `${styles.card} ${styles.cardNoImage}`;

  const getTagOverlayClass = (etiquetaKey) => {
    switch (etiquetaKey) {
      case 'popular':
        return styles.popularTagOverlay;
      case 'recomendado':
        return styles.recommendedTagOverlay;
      default:
        return '';
    }
  };

  return (
    <div className={cardClass}>
      {/* Conditionally render the image container. It only appears if shouldShowImage is true. */}
      {shouldShowImage && (
        <div className={styles.imageContainer}>
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
      )}

      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h3 className={styles.dishName}>{nombre}</h3>
          {(plato.precio != null && plato.precio > 0) && (
            <span className={styles.dishPrice}>
              {plato.precio.toFixed(2)}€
              {plato.precio_por_persona && (
                <span className={styles.perPersonIndicator}>
                  {' '}{t('menuItemCard.perPersonShort')}
                </span>
              )}
            </span>
          )}
        </div>
        <p className={styles.dishDescription}>{descripcionCorta}</p>

        {/* Use the same condition to switch between two different layouts for the bottom part of the card. */}
        {shouldShowImage ? (
          // Layout for cards WITH an image.
          <>
            <div className={styles.allergenIcons}>
              {plato.alergenos && plato.alergenos.map((alergenoKey) => (
                <span key={alergenoKey} className={styles.allergenIcon} title={getAlergenoIcon(alergenoKey)}>
                  {getAlergenoIcon(alergenoKey)}
                </span>
              ))}
            </div>
            <button className={styles.viewMoreButton} onClick={() => onViewMore(plato)}>
              {t('menuItemCard.viewMore')}
            </button>
          </>
        ) : (
          // Layout for cards WITHOUT an image, using the new footer style.
          <div className={styles.cardFooter}>
            <div className={styles.allergenIcons}>
              {plato.alergenos && plato.alergenos.map((alergenoKey) => (
                <span key={alergenoKey} className={styles.allergenIcon} title={getAlergenoIcon(alergenoKey)}>
                  {getAlergenoIcon(alergenoKey)}
                </span>
              ))}
            </div>
            <button className={styles.viewMoreLink} onClick={() => onViewMore(plato)}>
              {t('menuItemCard.viewMore')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItemCard;