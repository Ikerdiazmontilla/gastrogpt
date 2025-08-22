// frontend/src/components/Dish/DishDetailModal.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './DishDetailModal.module.css';
import {
  getAlergenoIcon,
  getAlergenoNombre,
  getEtiquetaUIData,
  getEtiquetaClass,
  getTranslatedDishText,
  findDishById
} from '../../utils/menuUtils';
import { useTenant } from '../../context/TenantContext';
// NEW: Import the hook to access user's allergens
import { useAllergens } from '../../context/AllergenContext';

const DishDetailModal = ({ plato, onClose, onSelectPairedDish, menu, source, onSelectDish }) => {
  const { t, i18n } = useTranslation();
  const { tenantConfig } = useTenant();
  // NEW: Get user's selected allergens
  const { allergens: userAllergens } = useAllergens();
  
  const currentLanguage = i18n.language;
  const [quantity, setQuantity] = useState(1);
  const menuHasImages = tenantConfig?.theme?.menuHasImages ?? true;

  if (!plato) return null;

  // NEW: Check for matching allergens for this specific dish
  const matchingAllergens = plato.alergenos?.filter(allergen => userAllergens.includes(allergen)) || [];

  const nombre = getTranslatedDishText(plato.nombre, currentLanguage);
  const descripcion = getTranslatedDishText(plato.descripcion, currentLanguage);

  const handleQuantityChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1) {
      value = 1;
    } else if (value > 9) {
      value = 9;
    }
    setQuantity(value);
  };

  const incrementQuantity = () => setQuantity(prev => (prev < 9 ? prev + 1 : 9));
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleSelectClick = () => {
    if (onSelectDish) {
      onSelectDish({ plato, quantity });
    }
  };

  const renderPairedItem = (pairedItemId) => {
    const pairedDish = menu?.allDishes ? findDishById(pairedItemId, menu.allDishes) : null;
    if (!pairedDish) return null;

    const pairedDishName = getTranslatedDishText(pairedDish.nombre, currentLanguage);
    return (
      <div key={pairedDish.id} className={styles.pairedItem}>
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
        
        <div className={styles.modalBody}>
          {menuHasImages && plato.imagen && (
            <img src={plato.imagen.startsWith('http') ? plato.imagen : process.env.PUBLIC_URL + plato.imagen} alt={nombre} className={styles.modalImage} />
          )}

          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{nombre}</h2>
            {(plato.precio != null && plato.precio > 0) && (
              <p className={styles.modalPrice}>
                {plato.precio.toFixed(2)}€
                {plato.precio_por_persona && (
                  <span className={styles.perPersonText}>
                    {' '}{t('dishDetailModal.perPersonLong')}
                  </span>
                )}
              </p>
            )}
          </div>
          <p className={styles.modalDescription}>{descripcion}</p>

          {plato.alergenos && plato.alergenos.length > 0 && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>{t('dishDetailModal.allergens')}</h4>
              <div className={styles.tagsContainer}>
                {/* MODIFIED: Apply warning class and symbol to matching allergens */}
                {plato.alergenos.map((alergenoKey) => (
                  <span 
                    key={alergenoKey} 
                    className={`${styles.detailTagPill} ${matchingAllergens.includes(alergenoKey) ? styles.warning : ''}`}
                  >
                    {matchingAllergens.includes(alergenoKey) && <span className={styles.warningSymbol}>⚠️</span>}
                    {getAlergenoIcon(alergenoKey)} {getAlergenoNombre(alergenoKey, currentLanguage)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {plato.etiquetas && plato.etiquetas.length > 0 && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>{t('dishDetailModal.tags')}</h4>
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
              <h4 className={styles.sectionTitle}>{t('dishDetailModal.pairsWellWith')}</h4>
              <div className={styles.pairedItemsContainer}>
                {plato.pairsWith.main && renderPairedItem(plato.pairsWith.main)}
                {plato.pairsWith.drink && renderPairedItem(plato.pairsWith.drink)}
                {plato.pairsWith.dessert && renderPairedItem(plato.pairsWith.dessert)}
              </div>
            </div>
          )}
        </div>
        
        {source === 'chat' && onSelectDish && (
          <div className={styles.modalFooter}>
            <div className={styles.quantitySelector}>
              <button onClick={decrementQuantity} className={styles.quantityButton}>-</button>
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                className={styles.quantityInput}
                min="1"
                max="9"
              />
              <button onClick={incrementQuantity} className={styles.quantityButton}>+</button>
            </div>
            <button className={styles.selectButton} onClick={handleSelectClick}>
              {t('dishDetailModal.select')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DishDetailModal;