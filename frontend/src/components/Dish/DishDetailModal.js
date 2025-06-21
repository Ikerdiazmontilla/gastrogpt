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
// Las importaciones de useOrder y DishDetailOrderControl han sido eliminadas

// Las props `isSelected` y `onToggleSelect` han sido eliminadas
const DishDetailModal = ({ plato, onClose, onSelectPairedDish, menu }) => {
  const { t, i18n } = useTranslation();
  // isOrderingFeatureEnabled ha sido eliminado

  const currentLanguage = i18n.language;

  const { tenantConfig } = useTenant();
  // menuHasImages se mantiene para controlar la visibilidad de la imagen del plato
  const menuHasImages = tenantConfig?.theme?.menuHasImages ?? true;

  if (!plato) return null; // No renderizar si no hay plato

  const nombre = getTranslatedDishText(plato.nombre, currentLanguage);
  const descripcionLarga = getTranslatedDishText(plato.descripcionLarga, currentLanguage);

  // Función para renderizar un plato emparejado, creando un botón que abre su modal de detalle
  const renderPairedItem = (pairedItemId) => {
    const pairedDish = menu?.allDishes ? findDishById(pairedItemId, menu.allDishes) : null;
    if (!pairedDish) return null;

    const pairedDishName = getTranslatedDishText(pairedDish.nombre, currentLanguage);
    return (
      <div className={styles.pairedItem}>
        <button
          className={styles.pairedItemLink}
          onClick={() => onSelectPairedDish(pairedDish)} // Al hacer clic, abre el modal del plato emparejado
        >
          {pairedDishName}
        </button>
      </div>
    );
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}> {/* Evita que el clic se propague al overlay */}
        <button className={styles.closeButton} onClick={onClose}>×</button> {/* Botón para cerrar el modal */}
        
        <div className={styles.modalBody}>
          {/* Muestra la imagen del plato si menuHasImages es true y el plato tiene una imagen */}
          {menuHasImages && plato.imagen && (
            <img src={plato.imagen.startsWith('http') ? plato.imagen : process.env.PUBLIC_URL + plato.imagen} alt={nombre} className={styles.modalImage} />
          )}

          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{nombre}</h2>
            {/* Muestra el precio si está definido y es mayor que 0 */}
            {(plato.precio != null && plato.precio > 0) && (
              <p className={styles.modalPrice}>
                {plato.precio.toFixed(2)}€ {/* Formatea el precio a dos decimales */}
                {plato.precio_por_persona && ( // Muestra "por persona" si aplica
                  <span className={styles.perPersonText}>
                    {' '}{t('dishDetailModal.perPersonLong')}
                  </span>
                )}
              </p>
            )}
          </div>
          <p className={styles.modalDescription}>{descripcionLarga}</p>

          {/* Sección de alérgenos */}
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

          {/* Sección de etiquetas */}
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

          {/* Sección de platos que combinan bien */}
          {plato.pairsWith && (Object.keys(plato.pairsWith).length > 0) && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>{t('dishDetailModal.pairsWellWith')}</h4>
              <div className={styles.pairedItemsContainer}>
                {/* Renderiza los platos emparejados si existen */}
                {plato.pairsWith.main && renderPairedItem(plato.pairsWith.main)}
                {plato.pairsWith.drink && renderPairedItem(plato.pairsWith.drink)}
                {plato.pairsWith.dessert && renderPairedItem(plato.pairsWith.dessert)}
              </div>
            </div>
          )}
        </div>
        
        {/* El footer del modal con el botón de selección ha sido eliminado */}
      </div>
    </div>
  );
};

export default DishDetailModal;