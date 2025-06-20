// frontend/src/components/Order/FloatingOrderButton.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOrder } from '../../context/OrderContext';
import styles from './FloatingOrderButton.module.css';

const FloatingOrderButton = ({ onClick }) => {
  const { t } = useTranslation();
  const { selectedDishes } = useOrder();
  const itemCount = selectedDishes.size;

  // El botón solo se muestra si hay al menos un artículo.
  // La clase 'visible' activa la animación de entrada.
  const buttonClasses = [
    styles.floatingButton,
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

export default FloatingOrderButton;