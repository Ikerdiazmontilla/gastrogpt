// frontend/src/components/Dish/DishPreviewLink.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './DishPreviewLink.module.css';

const DishPreviewLink = ({ dish, onViewDetails, menuHasImages, emoji, cleanDishName }) => {
  const { t } = useTranslation();
  
  // El texto accesible usa el nombre limpio para una mejor pronunciación.
  const accessibleLabel = t('chat.viewDetailsFor', { dishName: cleanDishName });

  const showImage = menuHasImages && dish.imagen;

  return (
    <div 
      className={styles.buttonWrapper} 
      onClick={onViewDetails}
      aria-label={accessibleLabel}
      role="button"
      tabIndex="0"
    >
      <div className={`${styles.card} ${!showImage ? styles.textOnlyLayout : ''}`}>
        {showImage ? (
          // Si hay imagen, se muestra la imagen y el nombre limpio.
          <>
            <img src={dish.imagen.startsWith('http') ? dish.imagen : process.env.PUBLIC_URL + dish.imagen} alt={cleanDishName} className={styles.dishImage} />
            <span className={styles.dishTitle}>{cleanDishName}</span>
          </>
        ) : (
          // Si no hay imagen, se muestra el emoji y el nombre limpio.
          <>
            <span className={styles.categoryEmoji}>{emoji}</span>
            <span className={styles.dishTitle}>{cleanDishName}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default DishPreviewLink;