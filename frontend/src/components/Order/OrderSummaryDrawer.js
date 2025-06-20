// frontend/src/components/Order/OrderSummaryDrawer.js
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrder } from '../../context/OrderContext';
import { useTenant } from '../../context/TenantContext';
import { getTranslatedDishText, findDishById } from '../../utils/menuUtils';
import styles from './OrderSummaryDrawer.module.css';

const OrderSummaryDrawer = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { selectedDishes, toggleDishSelection } = useOrder();
  const { tenantConfig } = useTenant();
  const menu = tenantConfig?.menu;
  const menuHasImages = tenantConfig?.theme?.menuHasImages ?? true;

  // Calculamos los platos a mostrar y el precio total
  const { orderedItems, totalPrice } = useMemo(() => {
    if (!menu?.allDishes) {
      return { orderedItems: [], totalPrice: 0 };
    }

    const items = Array.from(selectedDishes)
      .map(dishId => findDishById(dishId, menu.allDishes))
      .filter(dish => dish != null); // Filtramos por si algún plato no se encuentra

    const total = items.reduce((sum, dish) => sum + (dish.precio || 0), 0);
    
    return { orderedItems: items, totalPrice: total };
  }, [selectedDishes, menu?.allDishes]);

  if (!isOpen) return null;

  return (
    // El overlay que cubre la pantalla
    <div 
      className={`${styles.drawerOverlay} ${isOpen ? styles.open : ''}`}
      onClick={onClose}
    >
      {/* El panel del cajón que se desliza */}
      <div 
        className={`${styles.drawerPanel} ${isOpen ? styles.open : ''}`}
        onClick={(e) => e.stopPropagation()} // Evita que se cierre al hacer clic dentro
      >
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>{t('orderSummary.title')}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.orderList}>
          {orderedItems.length > 0 ? (
            orderedItems.map(dish => (
              <div key={dish.id} className={styles.orderItem}>
                {menuHasImages && dish.imagen && (
                  <img src={dish.imagen} alt={getTranslatedDishText(dish.nombre, i18n.language)} className={styles.itemImage} />
                )}
                <div className={styles.itemDetails}>
                  <span className={styles.itemName}>{getTranslatedDishText(dish.nombre, i18n.language)}</span>
                  {dish.precio > 0 && <span className={styles.itemPrice}>{dish.precio.toFixed(2)}€</span>}
                </div>
                <button 
                  className={styles.removeItemButton} 
                  onClick={() => toggleDishSelection(dish.id)}
                  aria-label={`Quitar ${getTranslatedDishText(dish.nombre, i18n.language)}`}
                >
                  🗑️
                </button>
              </div>
            ))
          ) : (
            <p className={styles.emptyMessage}>{t('orderSummary.empty')}</p>
          )}
        </div>

        <div className={styles.drawerFooter}>
          {orderedItems.length > 0 && (
            <div className={styles.totalPriceContainer}>
              <span className={styles.totalLabel}>{t('orderSummary.total')}:</span>
              <span className={styles.totalAmount}>{totalPrice.toFixed(2)}€</span>
            </div>
          )}
          <p className={styles.callWaiter}>
            {t('orderSummary.callWaiter')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryDrawer;