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
// NUEVO: Importamos el componente de subcategoría desplegable
import CollapsibleSubCategory from '../../components/CollapsibleSubCategory/CollapsibleSubCategory';

const CartaPage = () => {
  const { i18n, t } = useTranslation();
  const { tenantConfig } = useTenant();
  
  const [searchTerm, setSearchTerm] = useState('');
  // NUEVO: Estado para controlar las subcategorías abiertas. Usamos un Set para eficiencia.
  const [openSubCategories, setOpenSubCategories] = useState(new Set());

  const menuSections = useMenuFiltering(tenantConfig?.menu, searchTerm, i18n.language);
  const { selectedPlato, openModal, closeModal } = useDishModal();
  const { visibleSection, sectionRefs, tabRefs, tabsListRef } = useStickyTabs(menuSections);

  const menu = tenantConfig?.menu;
  const menuHasImages = tenantConfig?.theme?.menuHasImages ?? true;
  const showShortDescriptionInMenu = tenantConfig?.theme?.showShortDescriptionInMenu ?? false;

  // NUEVO: Efecto para abrir automáticamente las subcategorías al buscar.
  useEffect(() => {
    // Si no hay término de búsqueda, no hacemos nada.
    if (!searchTerm.trim()) return;

    const newOpenSubCats = new Set();
    // Buscamos la sección de bebidas en los resultados filtrados.
    const drinksSection = menuSections.find(sec => sec.key === 'bebidas');
    if (drinksSection && drinksSection.subCategoryGroups) {
      // Si una subcategoría de bebidas tiene resultados, la añadimos al set de abiertas.
      drinksSection.subCategoryGroups.forEach(subCat => {
        if (subCat.dishes.length > 0) {
          newOpenSubCats.add(subCat.key);
        }
      });
    }
    setOpenSubCategories(newOpenSubCats);
  }, [searchTerm, menuSections]); // Se ejecuta cuando cambia la búsqueda o los resultados.


  useEffect(() => {
    const navContainer = document.querySelector('.nav-container');
    const tabsListElement = tabsListRef.current;
    if (!navContainer || !tabsListElement) return;

    const updateLayout = () => {
      const navHeight = navContainer.offsetHeight;
      const tabsHeight = tabsListElement.offsetHeight;
      
      document.documentElement.style.setProperty('--sticky-tabs-top', `${navHeight}px`);

      const totalStickyHeight = navHeight + tabsHeight + 10;
      const sectionElements = Object.values(sectionRefs.current);
      sectionElements.forEach(section => {
        if (section) section.style.scrollMarginTop = `${totalStickyHeight}px`;
      });
    };

    const navObserver = new ResizeObserver(updateLayout);
    navObserver.observe(navContainer);
    const tabsObserver = new ResizeObserver(updateLayout);
    tabsObserver.observe(tabsListElement);

    const initialUpdateTimeout = setTimeout(updateLayout, 100);

    return () => {
      clearTimeout(initialUpdateTimeout);
      navObserver.disconnect();
      tabsObserver.disconnect();
    };
  }, [menuSections, tabsListRef, sectionRefs]);

  const handleTabClick = (key) => {
    sectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // NUEVO: Función para abrir/cerrar una subcategoría.
  const toggleSubCategory = (subCatKey) => {
    setOpenSubCategories(prevOpenSubCats => {
      // Creamos una nueva copia del Set para asegurar la inmutabilidad y el re-renderizado.
      const newOpenSubCats = new Set(prevOpenSubCats);
      if (newOpenSubCats.has(subCatKey)) {
        newOpenSubCats.delete(subCatKey); // Si ya está, la cerramos.
      } else {
        newOpenSubCats.add(subCatKey); // Si no está, la abrimos.
      }
      return newOpenSubCats;
    });
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
              
              {section.dishesWithoutSubcategory && section.dishesWithoutSubcategory.length > 0 && (
                <div className={styles.dishesGrid}>
                  {section.dishesWithoutSubcategory.map(plato => (
                    <MenuItemCard
                      key={plato.id}
                      plato={plato}
                      onViewMore={openModal}
                      menuHasImages={menuHasImages}
                      categoryKey={section.key}
                      showShortDescriptionInMenu={showShortDescriptionInMenu}
                    />
                  ))}
                </div>
              )}

              {/* ----- INICIO DE LA LÓGICA MODIFICADA ----- */}
              {section.subCategoryGroups && section.subCategoryGroups.length > 0 && (
                // Si la sección es 'bebidas', usamos el nuevo componente desplegable.
                section.key === 'bebidas' ? (
                  <div className={styles.subsectionContainer}>
                    {section.subCategoryGroups.map(subCategory => (
                      <CollapsibleSubCategory
                        key={subCategory.key}
                        title={subCategory.title}
                        dishes={subCategory.dishes}
                        // Le decimos si está abierta consultando nuestro estado.
                        isOpen={openSubCategories.has(subCategory.key)}
                        // Le pasamos la función para que pueda abrirse/cerrarse.
                        onToggle={() => toggleSubCategory(subCategory.key)}
                        categoryKey={section.key}
                        menuHasImages={menuHasImages}
                        showShortDescriptionInMenu={showShortDescriptionInMenu}
                        onViewMore={openModal}
                      />
                    ))}
                  </div>
                ) : (
                  // Si NO es 'bebidas', usamos la lógica original que ya tenías.
                  section.subCategoryGroups.map(subCategory => (
                    <div key={subCategory.key} className={styles.subsectionContainer}>
                      <h3 className={styles.subsectionTitle}>{subCategory.title}</h3>
                      <div className={styles.dishesGrid}>
                        {subCategory.dishes.map(plato => (
                          <MenuItemCard
                            key={plato.id}
                            plato={plato}
                            onViewMore={openModal}
                            menuHasImages={menuHasImages}
                            categoryKey={section.key}
                            showShortDescriptionInMenu={showShortDescriptionInMenu}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )
              )}
              {/* ----- FIN DE LA LÓGICA MODIFICADA ----- */}
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