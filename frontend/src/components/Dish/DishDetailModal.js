// frontend/src/components/Dish/DishDetailModal.js
import React, { useEffect } from 'react';
import styles from './DishDetailModal.module.css';
import { dishDetailModalTranslations } from '../../data/translations';
import {
  getAlergenoIcon,
  getAlergenoNombre,
  getEtiquetaUIData,
  getEtiquetaClass,
  getTranslatedDishText,
  findDishById
} from '../../utils/menuUtils';

const MODAL_HISTORY_STATE_KEY = 'dishDetailModalOpen';

const DishDetailModal = ({ plato, onClose, currentLanguage, onSelectPairedDish, menu }) => {
  useEffect(() => {
    if (plato) {
      window.history.pushState({ [MODAL_HISTORY_STATE_KEY]: true }, '', window.location.href);

      const handlePopState = (event) => {
        onClose();
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
        if (window.history.state && window.history.state[MODAL_HISTORY_STATE_KEY]) {
          window.history.back();
        }
      };
    }
  }, [plato, onClose]);

  if (!plato) return null;

  const T = dishDetailModalTranslations[currentLanguage] || dishDetailModalTranslations['Español'];

  const nombre = getTranslatedDishText(plato.nombre, currentLanguage);
  const descripcionLarga = getTranslatedDishText(plato.descripcionLarga, currentLanguage);

  const renderPairedItem = (pairedItemId) => {
    const pairedDish = menu?.allDishes ? findDishById(pairedItemId, menu.allDishes) : null;
    if (!pairedDish) return null;

    const pairedDishName = getTranslatedDishText(pairedDish.nombre, currentLanguage);
    return (
      <div className={styles.pairedItem}>
        <button
          className={styles.pairedItemLink}
          onClick={() => onSelectPairedDish(pairedDish)}
        >
          {pairedDishName}
        </button>
      </div>
    );
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <img src={process.env.PUBLIC_URL + plato.imagen} alt={nombre} className={styles.modalImage} />
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{nombre}</h2>
          <p className={styles.modalPrice}>{plato.precio.toFixed(2)}€</p>
        </div>
        <p className={styles.modalDescription}>{descripcionLarga}</p>

        {plato.alergenos && plato.alergenos.length > 0 && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>{T.allergens}</h4>
            <div className={styles.tagsContainer}>
              {plato.alergenos.map((alergenoKey) => (
                <span key={alergenoKey} className={styles.detailTagPill}>
                  {getAlergenoIcon(alergenoKey)} {getAlergenoNombre(alergenoKey, currentLanguage)}
                </span>
              ))}
            </div>
          </div>
        )}

        {plato.etiquetas && plato.etiquetas.length > 0 && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>{T.tags}</h4>
            <div className={styles.tagsContainer}>
              {plato.etiquetas.map((etiquetaKey) => {
                const { label, icon } = getEtiquetaUIData(etiquetaKey, currentLanguage);
                return (
                  <span key={etiquetaKey} className={`${styles.detailTagPill} ${getEtiquetaClass(etiquetaKey, styles)}`}>
                    {icon && etiquetaKey !== 'popular' && etiquetaKey !== 'recomendado' && etiquetaKey !== 'vegano' && etiquetaKey !== 'vegetariano' && !etiquetaKey.startsWith('picante') && (
                      <span className={styles.detailTagIcon}>{icon}</span>
                    )}
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {plato.pairsWith && (Object.keys(plato.pairsWith).length > 0) && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>{T.pairsWellWith}</h4>
            <div className={styles.pairedItemsContainer}>
              {plato.pairsWith.main && renderPairedItem(plato.pairsWith.main)}
              {plato.pairsWith.drink && renderPairedItem(plato.pairsWith.drink)}
              {plato.pairsWith.dessert && renderPairedItem(plato.pairsWith.dessert)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DishDetailModal;