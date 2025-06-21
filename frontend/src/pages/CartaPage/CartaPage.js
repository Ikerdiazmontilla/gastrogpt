// src/pages/CartaPage/CartaPage.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './CartaPage.module.css';
import { useTenant } from '../../context/TenantContext';
import { useOrder } from '../../context/OrderContext';

// Importando los nuevos hooks
import { useMenuFiltering } from './hooks/useMenuFiltering';
import { useStickyTabs } from './hooks/useStickyTabs';
import { useDishModal } from './hooks/useDishModal';

import MenuItemCard from '../../components/Dish/MenuItemCard';
import DishDetailModal from '../../components/Dish/DishDetailModal';
import OrderButton from '../../components/Order/OrderButton'; 

const CartaPage = () => {
  const { i18n, t } = useTranslation();
  const { tenantConfig } = useTenant();
  const { openDrawer } = useOrder();
  
  const [searchTerm, setSearchTerm] = useState('');

  // Usando los hooks para obtener estado y lógica
  const menuSections = useMenuFiltering(tenantConfig?.menu, searchTerm, i18n.language);
  const { selectedPlato, openModal, closeModal } = useDishModal();
  const { visibleSection, sectionRefs, tabRefs, tabsListRef } = useStickyTabs(menuSections);

  const menu = tenantConfig?.menu;
  const menuHasImages = tenantConfig?.theme?.menuHasImages ?? true;

  const handleTabClick = (key) => {
    sectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!menu) return <div className={styles.cartaContainer}>{t('app.loading')}</div>;

  return (
    <div className={styles.cartaContainer}>
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>{t('cartaPage.pageTitle')}</h1>
        <p className={styles.pageDescription}>{t('cartaPage.orderInstruction')}</p>
        <div className={styles.searchContainer}>
          <span className={styles.searchIcon}>🔍</span>
          <input type="text" placeholder={t('cartaPage.searchPlaceholder')} className={styles.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div ref={tabsListRef} className={styles.tabsList} data-no-tab-swipe="true">
        {menuSections.map(section => (
          <button
            key={section.key}
            ref={(el) => (tabRefs.current[section.key] = el)}
            className={`${styles.tabTrigger} ${visibleSection === section.key ? styles.activeTab : ''} ${styles['tab-' + (section.parentCategoryKey || 'default')]}`}
            onClick={() => handleTabClick(section.key)}
          >
            {section.title}
          </button>
        ))}
      </div>

      <div className={styles.menuContent}>
        {menuSections.length > 0 ? (
          menuSections.map(section => (
            <section
              key={section.key}
              id={section.key}
              ref={(el) => (sectionRefs.current[section.key] = el)}
              className={`${styles.menuSection} ${styles[`section-${section.parentCategoryKey}`] || styles['section-default']}`}
            >
              <h2 className={styles.sectionTitle}>
                <span className={`${styles.categoryMarker} ${styles[`marker-${section.parentCategoryKey}`] || styles['marker-default']}`}></span>
                {section.title}
              </h2>
              <p className={styles.categoryInstruction}>{t('cartaPage.orderInstruction')}</p>
              <div className={styles.dishesGrid}>
                {section.dishes.map(plato => (
                  <MenuItemCard
                    key={plato.id}
                    plato={plato}
                    onViewMore={openModal}
                    menuHasImages={menuHasImages}
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          <p className={styles.noResultsMessage}>{t('cartaPage.noResults')}</p>
        )}
      </div>

      {selectedPlato && (
        <DishDetailModal 
          plato={selectedPlato} 
          onClose={closeModal} 
          onSelectPairedDish={openModal} 
          menu={menu}
        />
      )}
      
      <OrderButton onClick={openDrawer} isFixed={true} compact={false} />
    </div>
  );
};

export default CartaPage;