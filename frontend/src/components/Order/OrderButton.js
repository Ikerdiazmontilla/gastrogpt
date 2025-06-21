// frontend/src/components/Order/OrderButton.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOrder } from '../../context/OrderContext';
import styles from './OrderButton.module.css';

const OrderButton = ({ onClick, isFixed = true, compact = false }) => {
  const { t } = useTranslation();
  const { isOrderingFeatureEnabled, selectedDishes } = useOrder();
  const itemCount = selectedDishes.size;

  if (!isOrderingFeatureEnabled) {
    return null;
  }

  // No renderizar nada si no hay artículos y no es un botón fijo
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