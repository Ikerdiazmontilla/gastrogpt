// src/pages/CartaPage/CartaPage.js
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './CartaPage.module.css';
import { useTenant } from '../../context/TenantContext';
import { useOrder } from '../../context/OrderContext';
import { getTranslatedDishText } from '../../utils/menuUtils';
import MenuItemCard from '../../components/Dish/MenuItemCard';
import DishDetailModal from '../../components/Dish/DishDetailModal';
import OrderButton from '../../components/Order/OrderButton'; 
// import OrderSummary from '../../components/Order/OrderSummary'; // Aunque OrderSummary es global ahora, esta importación está bien si se usara localmente para testing o si el cliente decide moverlo de nuevo. Para la implementación actual, solo el botón flotante se importa y usa aquí.

const MODAL_HISTORY_STATE_KEY = 'dishDetailModalOpen';

const CartaPage = () => {
  const { i18n, t } = useTranslation();
  const { tenantConfig } = useTenant();
  const { selectedDishes, toggleDishSelection, openDrawer } = useOrder();
  const menu = tenantConfig?.menu;
  const menuHasImages = tenantConfig?.theme?.menuHasImages ?? true;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlato, setSelectedPlato] = useState(null);
  const [visibleSection, setVisibleSection] = useState('');

  const sectionRefs = useRef({});
  const tabRefs = useRef({});
  const tabsListRef = useRef(null);

  const currentLanguageForApi = i18n.language;

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const handleSelectDishForModal = (plato) => {
    if (!selectedPlato) {
      window.history.pushState({ [MODAL_HISTORY_STATE_KEY]: true }, '');
    }
    setSelectedPlato(plato);
  };

  const handleCloseModal = () => {
    setSelectedPlato(null);
    if (window.history.state && window.history.state[MODAL_HISTORY_STATE_KEY]) {
      window.history.back();
    }
  };
  
  useEffect(() => {
    const handlePopState = (event) => {
      if (selectedPlato) {
        setSelectedPlato(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [selectedPlato]);

  const menuSections = useMemo(() => {
    if (!menu) return [];

    const allDishes = menu.allDishes || [];

    const dishToParentCategoryMap = new Map();
    Object.entries(menu).forEach(([categoryKey, categoryValue]) => {
      if (categoryKey === 'allDishes' || typeof categoryValue !== 'object') return;
      const processDishes = (dishes) => {
        if (Array.isArray(dishes)) {
          dishes.forEach(dish => {
            if (dish && dish.id) {
              dishToParentCategoryMap.set(dish.id, categoryKey);
            }
          });
        }
      };
      if (categoryValue.dishes) processDishes(categoryValue.dishes);
      if (categoryValue.subCategories) {
        Object.values(categoryValue.subCategories).forEach(subCat => processDishes(subCat.dishes));
      }
    });

    const filteredDishes = searchTerm
      ? allDishes.filter(plato => {
          const lowerSearchTerm = searchTerm.toLowerCase();
          const nombre = getTranslatedDishText(plato.nombre, currentLanguageForApi).toLowerCase();
          const descripcionCorta = getTranslatedDishText(plato.descripcionCorta, currentLanguageForApi).toLowerCase();
          return nombre.includes(lowerSearchTerm) || descripcionCorta.includes(lowerSearchTerm);
        })
      : allDishes;

    const sections = [];

    const sortedCategoryKeys = Object.keys(menu)
      .filter(key => key !== 'allDishes' && typeof menu[key] === 'object' && menu[key].orderId != null)
      .sort((a, b) => menu[a].orderId - menu[b].orderId);

    sortedCategoryKeys.forEach(categoryKey => {
      const category = menu[categoryKey];
      
      const processCategoryOrSubcategory = (item, key, parentKey) => {
          let dishesForThisSection = (item.dishes || []).filter(d => filteredDishes.some(fd => fd.id === d.id));
          if (item.subCategories) {
              const sortedSubCatKeys = Object.keys(item.subCategories)
                  .sort((a, b) => (item.subCategories[a].orderId || 99) - (item.subCategories[b].orderId || 99));
              sortedSubCatKeys.forEach(subCatKey => {
                  const subCat = item.subCategories[subCatKey];
                  const subCatDishes = (subCat.dishes || []).filter(d => filteredDishes.some(fd => fd.id === d.id));
                  if (subCatDishes.length > 0) {
                      dishesForThisSection.push(...subCatDishes);
                  }
              });
          }
          if (dishesForThisSection.length > 0) {
              sections.push({
                  key: key,
                  title: getTranslatedDishText(item.title, currentLanguageForApi),
                  dishes: dishesForThisSection,
                  parentCategoryKey: parentKey,
              });
          }
      };

      processCategoryOrSubcategory(category, categoryKey, categoryKey);
    });

    return sections.map(section => ({
        ...section,
        dishes: section.dishes.map(dish => ({
            ...dish,
            parentCategoryKey: dishToParentCategoryMap.get(dish.id) || 'default'
        }))
    }));

  }, [menu, searchTerm, currentLanguageForApi]);
  
  const handleTabClick = (key) => {
    const sectionElement = sectionRefs.current[key];
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const navContainer = document.querySelector('.nav-container');
    const tabsListElement = tabsListRef.current;
    if (!navContainer || !tabsListElement) return;
    const updateLayout = () => {
      const navHeight = navContainer.offsetHeight;
      const tabsHeight = tabsListElement.offsetHeight;
      const totalStickyHeight = navHeight + tabsHeight + 10; 
      tabsListElement.style.top = `${navHeight}px`;
      const sectionElements = Object.values(sectionRefs.current);
      sectionElements.forEach(section => {
        if (section) section.style.scrollMarginTop = `${totalStickyHeight}px`;
      });
    };
    const resizeObserver = new ResizeObserver(updateLayout);
    resizeObserver.observe(navContainer);
    resizeObserver.observe(tabsListElement);
    const initialUpdateTimeout = setTimeout(updateLayout, 100);
    return () => {
      clearTimeout(initialUpdateTimeout);
      resizeObserver.disconnect();
    };
  }, [menuSections]);

  useEffect(() => {
    if (menuSections.length > 0 && !visibleSection) setVisibleSection(menuSections[0].key);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) setVisibleSection(entry.target.id); });
      },
      { rootMargin: '-40% 0px -60% 0px', threshold: 0 }
    );
    const currentRefs = sectionRefs.current;
    Object.values(currentRefs).forEach((ref) => { if (ref) observer.observe(ref); });
    return () => { Object.values(currentRefs).forEach((ref) => { if (ref) observer.unobserve(ref); }); };
  }, [menuSections, visibleSection]);

  useEffect(() => {
    const activeTabElement = tabRefs.current[visibleSection];
    if (activeTabElement) {
      activeTabElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [visibleSection]);

  if (!menu) return <div className={styles.cartaContainer}>{t('app.loading')}</div>;

  return (
    <div className={styles.cartaContainer}>
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>{t('cartaPage.pageTitle')}</h1>
        <p className={styles.pageDescription}>{t('cartaPage.orderInstruction')}</p>
        <div className={styles.searchContainer}>
          <span className={styles.searchIcon}>🔍</span>
          <input type="text" placeholder={t('cartaPage.searchPlaceholder')} className={styles.searchInput} value={searchTerm} onChange={handleSearchChange} />
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
              // --- CORRECCIÓN DEL BUG: 'section-undefined' a 'section-default' ---
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
                    isSelected={selectedDishes.has(plato.id)}
                    onToggleSelect={toggleDishSelection}
                    onViewMore={handleSelectDishForModal}
                    menuHasImages={menuHasImages}
                    categoryKey={plato.parentCategoryKey}
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
          onClose={handleCloseModal} 
          onSelectPairedDish={handleSelectDishForModal} 
          menu={menu}
          isSelected={selectedDishes.has(selectedPlato.id)}
          onToggleSelect={toggleDishSelection}
        />
      )}
      
      {/* Botón de pedido flotante para la CartaPage */}
      <OrderButton onClick={openDrawer} isFixed={true} compact={false} />
    </div>
  );
};

export default CartaPage;