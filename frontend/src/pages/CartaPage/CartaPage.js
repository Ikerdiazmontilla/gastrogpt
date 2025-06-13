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
  const tabsListRef = useRef(null); // Ref para la lista de pestañas

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
    
    const destacadosDishes = filteredDishes.filter(p => p.etiquetas?.includes('popular') || p.etiquetas?.includes('recomendado'));
    if (destacadosDishes.length > 0) {
      sections.push({
        key: 'destacados',
        orderId: 1, 
        title: t('cartaPage.tabDestacados'),
        dishes: destacadosDishes,
      });
    }

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

    return sections;
  }, [menu, searchTerm, t, currentLanguageForApi]);
  
  const handleTabClick = (key) => {
    const sectionElement = sectionRefs.current[key];
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- INICIO DE LA LÓGICA MODIFICADA ---
  // Este useEffect gestiona la posición 'sticky' de la barra de pestañas y los márgenes de scroll.
  useEffect(() => {
    const navContainer = document.querySelector('.nav-container');
    const tabsListElement = tabsListRef.current;

    if (!navContainer || !tabsListElement) return;

    // Función para actualizar las posiciones y márgenes
    const updateLayout = () => {
      const navHeight = navContainer.offsetHeight;
      const tabsHeight = tabsListElement.offsetHeight;
      const totalStickyHeight = navHeight + tabsHeight + 10; // Añadimos un pequeño margen extra

      // 1. Establece la posición 'top' de la barra de pestañas para que se pegue debajo del navbar
      tabsListElement.style.top = `${navHeight}px`;

      // 2. Actualiza el 'scroll-margin-top' para todas las secciones del menú
      const sectionElements = Object.values(sectionRefs.current);
      sectionElements.forEach(section => {
        if (section) {
          section.style.scrollMarginTop = `${totalStickyHeight}px`;
        }
      });
    };

    // Usamos ResizeObserver para reaccionar a cambios de tamaño del navbar o de las pestañas
    const resizeObserver = new ResizeObserver(updateLayout);
    resizeObserver.observe(navContainer);
    resizeObserver.observe(tabsListElement);

    // Hacemos una llamada inicial después de un breve instante para asegurar que todo esté renderizado
    const initialUpdateTimeout = setTimeout(updateLayout, 100);

    // Función de limpieza para detener los observadores cuando el componente se desmonte
    return () => {
      clearTimeout(initialUpdateTimeout);
      resizeObserver.disconnect();
    };
  }, [menuSections]); // Se vuelve a ejecutar si las secciones del menú cambian
  // --- FIN DE LA LÓGICA MODIFICADA ---


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

      {/* Se añade el 'ref' al div de la lista de pestañas */}
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