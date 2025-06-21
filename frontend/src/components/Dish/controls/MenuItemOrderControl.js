// frontend/src/components/Dish/controls/MenuItemOrderControl.js
import React from 'react';
import { useOrder } from '../../../context/OrderContext';
import styles from '../MenuItemCard.module.css'; // Reutilizamos los estilos

/**
 * Control de pedido para el MenuItemCard (botón +/✓).
 */
const MenuItemOrderControl = ({ dish, menuHasImages }) => {
  const { selectedDishes, toggleDishSelection } = useOrder();
  const isSelected = selectedDishes.has(dish.id);
  const shouldShowImage = menuHasImages && dish.imagen;

  const handleAddClick = (event) => {
    event.stopPropagation();
    toggleDishSelection(dish.id);
  };

  return (
    <div className={styles.mediaContent}>
      {shouldShowImage ? (
        <div className={styles.imageContainer}>
          <img src={dish.imagen.startsWith('http') ? dish.imagen : process.env.PUBLIC_URL + dish.imagen} alt={dish.nombre.es || ''} className={styles.dishImage} />
          <button 
            className={`${styles.addButton} ${isSelected ? styles.added : ''}`} 
            onClick={handleAddClick}
            aria-label={`Añadir ${dish.nombre.es} al pedido`}
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
            aria-label={`Añadir ${dish.nombre.es} al pedido`}
          >
            <span className={styles.addIcon}>+</span>
            <span className={styles.addedIcon}>✓</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuItemOrderControl;