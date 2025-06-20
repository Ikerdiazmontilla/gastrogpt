// frontend/src/components/Order/OrderButton.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOrder } from '../../context/OrderContext';
import styles from './OrderButton.module.css'; // Archivo CSS renombrado

// El componente ahora acepta props para controlar su estilo y comportamiento
const OrderButton = ({ onClick, isFixed = true, compact = false }) => {
  const { t } = useTranslation();
  const { selectedDishes } = useOrder(); // Obtiene el pedido directamente del contexto
  const itemCount = selectedDishes.size;

  // No renderizar nada si no hay artículos y no es un botón fijo
  // (el fijo se oculta con CSS, el de chat simplemente no aparece)
  if (itemCount === 0 && !isFixed) {
    return null;
  }

  const buttonClasses = [
    styles.orderButton,
    isFixed ? styles.fixed : styles.inline,
    compact ? styles.compact : '',
    itemCount > 0 ? styles.visible : '',
  ].join(' ');

  return (
    <button className={buttonClasses} onClick={onClick}>
      <span className={styles.icon}>🛒</span>
      <span className={styles.text}>{t('cartaPage.viewOrder')}</span>
      {itemCount > 0 && <span className={styles.itemCountBadge}>{itemCount}</span>}
    </button>
  );
};

export default OrderButton;