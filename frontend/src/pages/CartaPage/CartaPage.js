// src/pages/CartaPage/CartaPage.js
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './CartaPage.module.css';
import { useTenant } from '../../context/TenantContext';

import { useMenuFiltering } from './hooks/useMenuFiltering';
import { useStickyTabs } from './hooks/useStickyTabs';
import { useDishModal } from './hooks/useDishModal';

import MenuItemCard from '../../components/Dish/MenuItemCard';
import DishDetailModal from '../../components/Dish/DishDetailModal';

const CartaPage = () => {
  const { i18n, t } = useTranslation();
  const { tenantConfig } = useTenant();
  
  const [searchTerm, setSearchTerm] = useState('');

  const menuSections = useMenuFiltering(tenantConfig?.menu, searchTerm, i18n.language);
  const { selectedPlato, openModal, closeModal } = useDishModal();
  const { visibleSection, sectionRefs, tabRefs, tabsListRef } = useStickyTabs(menuSections);

  const menu = tenantConfig?.menu;
  const menuHasImages = tenantConfig?.theme?.menuHasImages ?? true;

  // useEffect para la lógica de la barra de navegación y las pestañas pegajosas
  useEffect(() => {
    const navContainer = document.querySelector('.nav-container');
    const tabsListElement = tabsListRef.current;
    if (!navContainer || !tabsListElement) return;

    const updateLayout = () => {
      const navHeight = navContainer.offsetHeight;
      const tabsHeight = tabsListElement.offsetHeight;
      
      // Establece la variable CSS --sticky-tabs-top para la posición superior de las pestañas
      document.documentElement.style.setProperty('--sticky-tabs-top', `${navHeight}px`);

      // Ajusta el scroll-margin-top de las secciones para que no queden ocultas bajo las cabeceras pegajosas
      const totalStickyHeight = navHeight + tabsHeight + 10; // +10px para un pequeño margen de separación
      const sectionElements = Object.values(sectionRefs.current);
      sectionElements.forEach(section => {
        if (section) section.style.scrollMarginTop = `${totalStickyHeight}px`;
      });
    };

    // Usa ResizeObserver para recalcular las alturas cuando cambian los elementos pegajosos
    const navObserver = new ResizeObserver(updateLayout);
    navObserver.observe(navContainer);
    const tabsObserver = new ResizeObserver(updateLayout);
    tabsObserver.observe(tabsListElement);

    // Ejecuta la actualización inicial con un pequeño retardo para asegurar que los elementos estén renderizados
    const initialUpdateTimeout = setTimeout(updateLayout, 100);

    return () => {
      clearTimeout(initialUpdateTimeout);
      navObserver.disconnect();
      tabsObserver.disconnect();
    };
  }, [menuSections]); // Dependencia: re-ejecutar si la estructura del menú cambia

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
          <input 
            type="text" 
            placeholder={t('cartaPage.searchPlaceholder')} 
            className={styles.searchInput} 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
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
                    categoryKey={section.key} 
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
    </div>
  );
};

export default CartaPage;