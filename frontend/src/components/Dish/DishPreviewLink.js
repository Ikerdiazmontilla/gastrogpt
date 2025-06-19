import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './DishPreviewLink.module.css';
import { getTranslatedDishText } from '../../utils/menuUtils';

const DishPreviewLink = ({ dish, onClick, currentLanguage, menuHasImages }) => {
  const { t } = useTranslation();
  const dishName = getTranslatedDishText(dish.nombre, currentLanguage);
  const accessibleLabel = t('chat.viewDetailsFor', { dishName: dishName });

  const showImage = menuHasImages && dish.imagen;

  return (
    <button className={styles.buttonWrapper} onClick={onClick} aria-label={accessibleLabel}>
      <div className={`${styles.card} ${!showImage ? styles.textOnlyLayout : ''}`}>
        {showImage ? (
          <>
            <img src={dish.imagen} alt={dishName} className={styles.dishImage} />
            <span className={styles.dishTitle}>{dishName}</span>
          </>
        ) : (
          <span className={styles.dishTitle}>{dishName}</span>
        )}
      </div>
    </button>
  );
};

export default DishPreviewLink;