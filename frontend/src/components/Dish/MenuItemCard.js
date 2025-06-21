// src/components/Dish/MenuItemCard.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './MenuItemCard.module.css';
import { getTranslatedDishText } from '../../utils/menuUtils';
// Las importaciones relacionadas con useOrder y los controles de pedido han sido eliminadas

const MenuItemCard = ({ plato, onViewMore, menuHasImages }) => {
  const { i18n } = useTranslation();
  
  const currentLanguage = i18n.language;
  const nombre = getTranslatedDishText(plato.nombre, currentLanguage);
  const descripcionCorta = getTranslatedDishText(plato.descripcionCorta, currentLanguage);

  // shouldShowImage determina si se debe mostrar la imagen del plato.
  // Esta lógica ya no depende de la funcionalidad de pedido.
  const shouldShowImage = menuHasImages && plato.imagen;

  const cardClasses = [
    styles.card,
    // La clase 'selected' ha sido eliminada
    // Aplica una clase CSS de estilo de tarjeta basada en la categoría del plato.
    styles[`card-${plato.parentCategoryKey}`] || styles['card-default']
  ].join(' ');

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

      {/* La imagen del plato ahora se muestra condicionalmente solo por `shouldShowImage`.
          Ya no hay controles de pedido en esta tarjeta. */}
      {shouldShowImage && (
        <div className={styles.mediaContent}>
          <div className={styles.imageContainer}>
            <img src={plato.imagen.startsWith('http') ? plato.imagen : process.env.PUBLIC_URL + plato.imagen} alt={nombre} className={styles.dishImage} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItemCard;