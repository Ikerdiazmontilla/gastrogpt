// src/components/Dish/DishDetailModal.js
import React from 'react';
import styles from './DishDetailModal.module.css';
import { dishDetailModalTranslations } from '../../data/translations'; // Translations
import {
  getAlergenoIcon,
  getAlergenoNombre,
  getEtiquetaUIData,
  getEtiquetaClass,
  getTranslatedDishText
} from '../../utils/menuUtils'; // Utilities from menuUtils

const DishDetailModal = ({ plato, onClose, currentLanguage }) => {
  if (!plato) return null;

  const T = dishDetailModalTranslations[currentLanguage] || dishDetailModalTranslations['Español'];

  const nombre = getTranslatedDishText(plato.nombre, currentLanguage);
  const descripcionLarga = getTranslatedDishText(plato.descripcionLarga, currentLanguage);

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
      </div>
    </div>
  );
};

export default DishDetailModal;