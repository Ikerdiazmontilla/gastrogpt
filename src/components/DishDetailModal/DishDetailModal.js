// src/components/DishDetailModal/DishDetailModal.js
import React from 'react';
import styles from './DishDetailModal.module.css';
import { getAlergenoIcon, getAlergenoNombre, getEtiquetaLabel, getEtiquetaClass } from '../../data/menuData';

const translations = {
  Español: {
    allergens: "Alérgenos:",
    tags: "Etiquetas:",
    close: "Cerrar"
  },
  English: {
    allergens: "Allergens:",
    tags: "Tags:",
    close: "Close"
  }
};

const DishDetailModal = ({ plato, onClose, currentLanguage }) => {
  if (!plato) return null;

  const T = translations[currentLanguage] || translations['Español'];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <img src={plato.imagen} alt={plato.nombre} className={styles.modalImage} />
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{plato.nombre}</h2>
          <p className={styles.modalPrice}>{plato.precio.toFixed(2)}€</p>
        </div>
        <p className={styles.modalDescription}>{plato.descripcionLarga}</p>

        {plato.alergenos.length > 0 && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>{T.allergens}</h4>
            <div className={styles.tagsContainer}>
              {plato.alergenos.map((alergenoKey) => (
                <span key={alergenoKey} className={styles.detailTag}>
                  {getAlergenoIcon(alergenoKey)} {getAlergenoNombre(alergenoKey, currentLanguage)}
                </span>
              ))}
            </div>
          </div>
        )}

        {plato.etiquetas.length > 0 && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>{T.tags}</h4>
            <div className={styles.tagsContainer}>
              {plato.etiquetas.map((etiquetaKey) => (
                <span key={etiquetaKey} className={`${styles.detailTag} ${getEtiquetaClass(etiquetaKey, styles)}`}>
                  {getEtiquetaLabel(etiquetaKey, currentLanguage)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DishDetailModal;