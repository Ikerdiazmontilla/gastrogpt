// src/components/Dish/MenuItemCard.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './MenuItemCard.module.css';
import { getTranslatedDishText } from '../../utils/menuUtils';

// Se añade categoryKey a las props
const MenuItemCard = ({ plato, onViewMore, onToggleSelect, isSelected, menuHasImages, categoryKey }) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const nombre = getTranslatedDishText(plato.nombre, currentLanguage);
  const descripcionCorta = getTranslatedDishText(plato.descripcionCorta, currentLanguage);

  const shouldShowImage = menuHasImages && plato.imagen;

  // Clases CSS condicionales para la tarjeta, incluyendo la de la categoría
  const cardClasses = [
    styles.card,
    isSelected ? styles.selected : '',
    // Se añade la clase de la categoría o una por defecto si no existe
    styles[`card-${categoryKey}`] || styles['card-default']
  ].join(' ');

  const handleAddClick = (event) => {
    event.stopPropagation();
    onToggleSelect(plato.id);
  };
  
  const handleCardClick = () => {
    onViewMore(plato);
  };

  return (
    <div className={cardClasses} onClick={handleCardClick}>
      <div className={styles.textContent}>
        <div className={styles.cardHeader}>
          <h3 className={styles.dishName}>{nombre}</h3>
          {(plato.precio != null && plato.precio > 0) && (
            <span className={styles.dishPrice}>{plato.precio.toFixed(2)}€</span>
          )}
        </div>
        <p className={styles.dishDescription}>{descripcionCorta}</p>
      </div>

      <div className={styles.mediaContent}>
        {shouldShowImage ? (
          <div className={styles.imageContainer}>
            <img src={plato.imagen.startsWith('http') ? plato.imagen : process.env.PUBLIC_URL + plato.imagen} alt={nombre} className={styles.dishImage} />
            <button 
              className={`${styles.addButton} ${isSelected ? styles.added : ''}`} 
              onClick={handleAddClick}
              aria-label={`Añadir ${nombre} al pedido`}
            >
              <span className={styles.addIcon}>+</span>
              <span className={styles.addedIcon}>✓</span>
            </button>
          </div>
        ) : (
          <div className={styles.addButtonContainer}>
            <button 
              className={`${styles.addButton} ${styles.noImage} ${isSelected ? styles.added : ''}`} 
              onClick={handleAddClick}
              aria-label={`Añadir ${nombre} al pedido`}
            >
              <span className={styles.addIcon}>+</span>
              <span className={styles.addedIcon}>✓</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItemCard;