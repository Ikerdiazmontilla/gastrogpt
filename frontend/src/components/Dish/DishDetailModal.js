// frontend/src/components/Dish/DishDetailModal.js
import React, { useEffect } from 'react'; // Added useEffect
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

// A unique key for our modal's history state
const MODAL_HISTORY_STATE_KEY = 'dishDetailModalOpen';

const DishDetailModal = ({ plato, onClose, currentLanguage, onSelectPairedDish }) => {
  // Effect to handle browser history for back button dismissal
  useEffect(() => {
    if (plato) { // Modal is open
      // Push a new state to history when modal opens.
      // The current URL (window.location.href) is used so the path doesn't change.
      // We add a unique property to this state to identify it.
      window.history.pushState({ [MODAL_HISTORY_STATE_KEY]: true }, '', window.location.href);

      // Handler for the 'popstate' event (browser back/forward button)
      const handlePopState = (event) => {
        // If popstate occurs, it means user pressed back/forward.
        // We want to close the modal.
        // The onClose function will trigger the cleanup effect.
        onClose();
      };

      window.addEventListener('popstate', handlePopState);

      // Cleanup function: runs when modal closes or component unmounts
      return () => {
        window.removeEventListener('popstate', handlePopState);
        // If the modal was closed MANUALLY (e.g., by clicking 'X'),
        // and our pushed history state is still the current one,
        // we need to go back to remove it from the history stack.
        if (window.history.state && window.history.state[MODAL_HISTORY_STATE_KEY]) {
          // This means popstate didn't cause the close (because listener is now removed).
          // So, we trigger a history.back() to clean up our pushed state.
          window.history.back();
        }
      };
    }
    // No 'else' needed; if 'plato' is null, the effect does nothing or cleans up from a previous open state.
  }, [plato, onClose]); // Dependencies: effect runs if 'plato' or 'onClose' changes.

  if (!plato) return null;

  const T = dishDetailModalTranslations[currentLanguage] || dishDetailModalTranslations['Español'];

  const nombre = getTranslatedDishText(plato.nombre, currentLanguage);
  const descripcionLarga = getTranslatedDishText(plato.descripcionLarga, currentLanguage);

  const renderPairedItem = (pairedItemId) => {
    const pairedDish = findDishById(pairedItemId);
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