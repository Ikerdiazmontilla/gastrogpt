// frontend/src/components/Order/OrderSummary.js
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrder } from '../../context/OrderContext';
import { useTenant } from '../../context/TenantContext';
import { getTranslatedDishText, findDishById } from '../../utils/menuUtils';
import styles from './OrderSummaryDrawer.module.css';

// Este componente ahora se controla a sí mismo a través del contexto.
const OrderSummary = () => {
  const { t, i18n } = useTranslation();
  // Obtiene todo lo que necesita del contexto
  const { isDrawerOpen, closeDrawer, selectedDishes, toggleDishSelection } = useOrder();
  const { tenantConfig } = useTenant();
  const menu = tenantConfig?.menu;
  const menuHasImages = tenantConfig?.theme?.menuHasImages ?? true;

  const { orderedItems, totalPrice } = useMemo(() => {
    if (!menu?.allDishes) {
      return { orderedItems: [], totalPrice: 0 };
    }
    const items = Array.from(selectedDishes)
      .map(dishId => findDishById(dishId, menu.allDishes))
      .filter(dish => dish != null);
    const total = items.reduce((sum, dish) => sum + (dish.precio || 0), 0);
    return { orderedItems: items, totalPrice: total };
  }, [selectedDishes, menu?.allDishes]);

  // Ya no necesita recibir `isOpen` o `onClose` como props.
  if (!isDrawerOpen) return null;

  return (
    <div 
      className={`${styles.drawerOverlay} ${isDrawerOpen ? styles.open : ''}`}
      onClick={closeDrawer} // Usa la función del contexto
    >
      <div 
        className={`${styles.drawerPanel} ${isDrawerOpen ? styles.open : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>{t('orderSummary.title')}</h2>
          <button className={styles.closeButton} onClick={closeDrawer}>×</button>
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

export default OrderSummary;