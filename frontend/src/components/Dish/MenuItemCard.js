// src/components/Dish/MenuItemCard.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './MenuItemCard.module.css';
import { getTranslatedDishText } from '../../utils/menuUtils';
import { useOrder } from '../../context/OrderContext';
import MenuItemOrderControl from './controls/MenuItemOrderControl'; // NUEVO

const MenuItemCard = ({ plato, onViewMore, menuHasImages }) => {
  const { i18n } = useTranslation();
  const { isOrderingFeatureEnabled, selectedDishes } = useOrder();
  const isSelected = selectedDishes.has(plato.id);
  
  const currentLanguage = i18n.language;
  const nombre = getTranslatedDishText(plato.nombre, currentLanguage);
  const descripcionCorta = getTranslatedDishText(plato.descripcionCorta, currentLanguage);

  const cardClasses = [
    styles.card,
    isOrderingFeatureEnabled && isSelected ? styles.selected : '',
    styles[`card-${plato.parentCategoryKey}`] || styles['card-default']
  ].join(' ');

  // Se extrae la imagen del control de pedido para que siempre se muestre
  const imageContent = menuHasImages && plato.imagen
    ? (
      <div className={styles.imageContainer}>
        <img src={plato.imagen.startsWith('http') ? plato.imagen : process.env.PUBLIC_URL + plato.imagen} alt={nombre} className={styles.dishImage} />
      </div>
    ) : null;

  return (
    <div className={cardClasses} onClick={() => onViewMore(plato)}>
      <div className={styles.textContent}>
        <div className={styles.cardHeader}>
          <h3 className={styles.dishName}>{nombre}</h3>
          {(plato.precio != null && plato.precio > 0) && (
            <span className={styles.dishPrice}>{plato.precio.toFixed(2)}€</span>
          )}
        </div>
        <p className={styles.dishDescription}>{descripcionCorta}</p>
      </div>

      {/* Si la función de pedido está habilitada, muestra el control.
          Si no, y si hay imagen, muestra solo la imagen. */}
      {isOrderingFeatureEnabled ? (
        <MenuItemOrderControl dish={plato} menuHasImages={menuHasImages} />
      ) : (
        imageContent && <div className={styles.mediaContent}>{imageContent}</div>
      )}
    </div>
  );
};

export default MenuItemCard;