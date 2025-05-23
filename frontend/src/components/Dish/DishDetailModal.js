// <file path="gastrogpts/src/components/Dish/DishDetailModal.js">
// src/components/Dish/DishDetailModal.js
import React from 'react';
import styles from './DishDetailModal.module.css';
import { dishDetailModalTranslations } from '../../data/translations'; // Translations
import {
  getAlergenoIcon,
  getAlergenoNombre,
  getEtiquetaUIData,
  getEtiquetaClass,
  getTranslatedDishText,
  findDishById // Import findDishById
} from '../../utils/menuUtils'; // Utilities from menuUtils

const DishDetailModal = ({ plato, onClose, currentLanguage, onSelectPairedDish }) => {
  if (!plato) return null;

  const T = dishDetailModalTranslations[currentLanguage] || dishDetailModalTranslations['Español'];

  const nombre = getTranslatedDishText(plato.nombre, currentLanguage);
  const descripcionLarga = getTranslatedDishText(plato.descripcionLarga, currentLanguage);

  // Updated renderPairedItem to not require a specific label, just the item ID
  const renderPairedItem = (pairedItemId) => {
    const pairedDish = findDishById(pairedItemId);
    if (!pairedDish) return null;

    const pairedDishName = getTranslatedDishText(pairedDish.nombre, currentLanguage);
    return (
      // Removed the specific label (like "Suggested Drink:") from here
      // The general section title "Combina bien con:" will cover it.
      // Each paired item will just be a clickable name.
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
        {/* Ensure plato.imagen path is correct, assuming it's relative to public folder */}
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

        {/* Pairs Well With Section */}
        {plato.pairsWith && (Object.keys(plato.pairsWith).length > 0) && ( // Ensure pairsWith is not an empty object
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>{T.pairsWellWith}</h4>
            <div className={styles.pairedItemsContainer}>
              {/* Appetizer or Drink pairing (single main dish) */}
              {plato.pairsWith.main && renderPairedItem(plato.pairsWith.main)}

              {/* Main dish pairings (drink and dessert) */}
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