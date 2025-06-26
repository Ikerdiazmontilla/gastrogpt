// frontend/src/components/Dish/DishDetailModal.js
import React from 'react';
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

// NUEVO: Se añaden las props `source` y `onSelectDish`
const DishDetailModal = ({ plato, onClose, onSelectPairedDish, menu, source, onSelectDish }) => {
  const { t, i18n } = useTranslation();
  
  const currentLanguage = i18n.language;

  const { tenantConfig } = useTenant();
  const menuHasImages = tenantConfig?.theme?.menuHasImages ?? true;

  if (!plato) return null;

  const nombre = getTranslatedDishText(plato.nombre, currentLanguage);
  // Changed from `descripcionLarga` to `descripcion`. This is now the main description field.
  const descripcion = getTranslatedDishText(plato.descripcion, currentLanguage);

  // NUEVA FUNCIÓN: Se ejecuta al pulsar el botón "Elegir"
  const handleSelectClick = () => {
    if (onSelectDish) {
      onSelectDish(plato); // Pasa el objeto plato completo
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
          {/* The full description is now rendered from the 'descripcion' variable. */}
          <p className={styles.modalDescription}>{descripcion}</p>

          {plato.alergenos && plato.alergenos.length > 0 && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>{t('dishDetailModal.allergens')}</h4>
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
        
        {/* ---- NUEVO BLOQUE CONDICIONAL PARA EL BOTÓN ---- */}
        {source === 'chat' && onSelectDish && (
          <div className={styles.modalFooter}>
            <button className={styles.selectButton} onClick={handleSelectClick}>
              {t('dishDetailModal.select')} {/* Se usa 'select' en lugar de 'choose' */}
            </button>
          </div>
        )}
        {/* ---- FIN DEL NUEVO BLOQUE ---- */}
      </div>
    </div>
  );
};

export default DishDetailModal;