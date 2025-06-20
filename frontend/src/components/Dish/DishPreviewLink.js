import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './DishPreviewLink.module.css';
import { getTranslatedDishText } from '../../utils/menuUtils';

// Helper to get an emoji based on the category key
const getEmojiForCategory = (categoryKey) => {
  switch (categoryKey) {
    case 'bebidas':
      return '🍹';
    case 'entrantes':
      return '🥗';
    case 'platos_principales':
      return '🍲';
    case 'postres':
      return '🍰';
    default:
      return '🍽️';
  }
};

const DishPreviewLink = ({ dish, onClick, currentLanguage, menuHasImages }) => {
  const { t } = useTranslation();
  const dishName = getTranslatedDishText(dish.nombre, currentLanguage);
  const accessibleLabel = t('chat.viewDetailsFor', { dishName: dishName });

  const showImage = menuHasImages && dish.imagen;
  const categoryEmoji = getEmojiForCategory(dish.parentCategoryKey);

  return (
    <button className={styles.buttonWrapper} onClick={onClick} aria-label={accessibleLabel}>
      <div className={`${styles.card} ${!showImage ? styles.textOnlyLayout : ''}`}>
        {showImage ? (
          <>
            <img src={dish.imagen} alt={dishName} className={styles.dishImage} />
            <span className={styles.dishTitle}>{dishName}</span>
          </>
        ) : (
          <>
            <span className={styles.categoryEmoji}>{categoryEmoji}</span>
            <span className={styles.dishTitle}>{dishName}</span>
          </>
        )}
      </div>
    </button>
  );
};

export default DishPreviewLink;