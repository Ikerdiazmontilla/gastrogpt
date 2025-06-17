// src/pages/CartaPage/CartaPage.js
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './CartaPage.module.css';
import { useTenant } from '../../context/TenantContext';
import { getTranslatedDishText } from '../../utils/menuUtils';
import MenuItemCard from '../../components/Dish/MenuItemCard';
import DishDetailModal from '../../components/Dish/DishDetailModal';

const MODAL_HISTORY_STATE_KEY = 'dishDetailModalOpen';

const CartaPage = () => {
  const { i18n, t } = useTranslation();
  const { tenantConfig } = useTenant();
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
    const filteredDishes = searchTerm
      ? allDishes.filter(plato => {
          const lowerSearchTerm = searchTerm.toLowerCase();
          const nombre = getTranslatedDishText(plato.nombre, currentLanguageForApi).toLowerCase();
          const descripcionCorta = getTranslatedDishText(plato.descripcionCorta, currentLanguageForApi).toLowerCase();
          return nombre.includes(lowerSearchTerm) || descripcionCorta.includes(lowerSearchTerm);
        })
      : allDishes;

    const sections = [];

    // =======================================================================
    // INICIO DE LA MODIFICACIÓN: Lógica de ordenación para Destacados
    // =======================================================================

    // 1. Crear un mapa para saber el orderId de la categoría de cada plato.
    const dishCategoryOrderMap = new Map();
    Object.values(menu).forEach(category => {
      if (typeof category === 'object' && category !== null) {
        const categoryOrderId = category.orderId || 999;
        // Manejar categorías simples y con subcategorías
        if (category.dishes) {
          category.dishes.forEach(dish => dishCategoryOrderMap.set(dish.id, categoryOrderId));
        }
        if (category.subCategories) {
          Object.values(category.subCategories).forEach(subCat => {
            if (subCat.dishes) {
              subCat.dishes.forEach(dish => dishCategoryOrderMap.set(dish.id, categoryOrderId));
            }
          });
        }
      }
    });
    
    // 2. Filtrar los platos destacados como antes.
    const destacadosDishes = filteredDishes.filter(p => p.etiquetas?.includes('popular') || p.etiquetas?.includes('recomendado'));

    // 3. Ordenar la lista de platos destacados usando el mapa.
    destacadosDishes.sort((a, b) => {
      const orderA = dishCategoryOrderMap.get(a.id) || 999;
      const orderB = dishCategoryOrderMap.get(b.id) || 999;
      return orderA - orderB;
    });

    if (destacadosDishes.length > 0) {
      sections.push({
        key: 'destacados',
        orderId: 0, // Damos a Destacados el orderId más bajo para que siempre sea la primera pestaña.
        title: t('cartaPage.tabDestacados'),
        dishes: destacadosDishes,
      });
    }
    // =======================================================================
    // FIN DE LA MODIFICACIÓN
    // =======================================================================

    const menuCategories = Object.entries(menu)
      .filter(([key]) => key !== 'allDishes')
      .map(([key, value]) => ({ key, ...value }));

    menuCategories.sort((a, b) => (a.orderId || 99) - (b.orderId || 99));

    menuCategories.forEach(category => {
      if (category.subCategories) { 
        const subCategories = Object.entries(category.subCategories)
          .map(([key, value]) => ({ key, ...value }));
        
        subCategories.sort((a, b) => (a.orderId || 99) - (b.orderId || 99));

        subCategories.forEach(subCat => {
          const dishes = (subCat.dishes || []).filter(d => filteredDishes.some(fd => fd.id === d.id));
          if (dishes.length > 0) {
            sections.push({
              key: subCat.key,
              title: getTranslatedDishText(subCat.title, currentLanguageForApi),
              dishes,
            });
          }
        });
      } else if (category.dishes) { 
        const dishes = category.dishes.filter(d => filteredDishes.some(fd => fd.id === d.id));
        if (dishes.length > 0) {
           sections.push({
             key: category.key,
             title: getTranslatedDishText(category.title, currentLanguageForApi),
             dishes
           });
        }
      }
    });
    
    // Ordenar las secciones finales (excepto 'destacados' que ya está al principio)
    const finalSections = [
      ...sections.filter(s => s.key === 'destacados'),
      ...sections.filter(s => s.key !== 'destacados').sort((a, b) => {
        // Para ordenar las secciones, necesitamos encontrar su orderId original.
        const categoryA = menu[a.key] || Object.values(menu).flatMap(c => c.subCategories ? Object.values(c.subCategories) : []).find(sc => sc.key === a.key);
        const categoryB = menu[b.key] || Object.values(menu).flatMap(c => c.subCategories ? Object.values(c.subCategories) : []).find(sc => sc.key === b.key);
        return (categoryA?.orderId || 99) - (categoryB?.orderId || 99);
      })
    ];


    // La lógica de ordenación final es más compleja ahora, vamos a simplificarla
    // basándonos en el `orderId` que ya asignamos.
    const sortedSections = sections.slice().sort((a, b) => {
        // 'destacados' ya tiene orderId: 0. Los demás heredan el de su categoría.
        // Necesitamos asignar un orderId a cada sección para poder ordenar.
        const getOrder = (section) => {
            if (section.orderId !== undefined) return section.orderId;
            // Si la sección no es 'destacados', buscar su orderId en la estructura original del menú.
            for (const cat of Object.values(menu)) {
                if (cat.key === section.key) return cat.orderId || 999; // Categoría principal
                if (cat.subCategories) {
                    for (const subCat of Object.values(cat.subCategories)) {
                        if (subCat.key === section.key) return cat.orderId || 999; // Usar el order de la categoría padre
                    }
                }
            }
            return 999;
        };
        return getOrder(a) - getOrder(b);
    });

    return sortedSections;

  }, [menu, searchTerm, t, currentLanguageForApi]);
  
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
        if (section) {
          section.style.scrollMarginTop = `${totalStickyHeight}px`;
        }
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
    if (menuSections.length > 0 && !visibleSection) {
      setVisibleSection(menuSections[0].key);
    }
  
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -60% 0px', threshold: 0 }
    );
  
    const currentRefs = sectionRefs.current;
    Object.values(currentRefs).forEach((ref) => {
      if (ref) observer.observe(ref);
    });
  
    return () => {
      Object.values(currentRefs).forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [menuSections, visibleSection]);

  useEffect(() => {
    const activeTabElement = tabRefs.current[visibleSection];
    if (activeTabElement) {
      activeTabElement.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [visibleSection]);


  if (!menu) {
    return <div className={styles.cartaContainer}>{t('app.loading')}</div>;
  }

  return (
    <div className={styles.cartaContainer}>
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>{t('cartaPage.pageTitle')}</h1>
        <p className={styles.pageDescription}>{t('cartaPage.pageDescription')}</p>
        <div className={styles.searchContainer}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder={t('cartaPage.searchPlaceholder')}
            className={styles.searchInput}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div ref={tabsListRef} className={styles.tabsList} data-no-tab-swipe="true">
        {menuSections.map(section => (
          <button
            key={section.key}
            ref={(el) => (tabRefs.current[section.key] = el)}
            className={`${styles.tabTrigger} ${visibleSection === section.key ? styles.activeTab : ''}`}
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
              className={styles.menuSection}
            >
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              <div className={styles.dishesGrid}>
                {section.dishes.map(plato => (
                  <MenuItemCard
                    key={plato.id}
                    plato={plato}
                    onViewMore={handleSelectDishForModal}
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
          onClose={handleCloseModal}
          onSelectPairedDish={handleSelectDishForModal}
          menu={menu}
        />
      )}
    </div>
  );
};

export default CartaPage;