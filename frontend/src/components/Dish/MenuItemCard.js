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

  const cardClass = menuHasImages ? styles.card : `${styles.card} ${styles.cardNoImage}`;

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
      {menuHasImages && (
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

        {menuHasImages ? (
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