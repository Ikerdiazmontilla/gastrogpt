// frontend/src/components/Dish/controls/DishDetailOrderControl.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOrder } from '../../../context/OrderContext';
import styles from '../DishDetailModal.module.css'; // Reutilizamos estilos del modal

/**
 * Control de pedido para el footer del DishDetailModal.
 */
const DishDetailOrderControl = ({ dishId }) => {
  const { t } = useTranslation();
  const { selectedDishes, toggleDishSelection } = useOrder();
  const isSelected = selectedDishes.has(dishId);

  return (
    <div className={styles.modalFooter}>
      <button
        className={`${styles.selectButton} ${isSelected ? styles.selected : ''}`}
        onClick={() => toggleDishSelection(dishId)}
      >
        {isSelected ? t('dishDetailModal.selected') : t('dishDetailModal.select')}
      </button>
    </div>
  );
};

export default DishDetailOrderControl;