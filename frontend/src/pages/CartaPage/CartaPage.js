// src/pages/CartaPage/CartaPage.js
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './CartaPage.module.css';
import { useTenant } from '../../context/TenantContext';
import { getTranslatedDishText } from '../../utils/menuUtils';
import MenuItemCard from '../../components/Dish/MenuItemCard';
import DishDetailModal from '../../components/Dish/DishDetailModal';

const CartaPage = () => {
  const { i18n, t } = useTranslation();
  const { tenantConfig } = useTenant();
  const menu = tenantConfig?.menu;
  const menuHasImages = tenantConfig?.theme?.menuHasImages ?? true;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlato, setSelectedPlato] = useState(null);
  const [visibleSection, setVisibleSection] = useState('destacados');
  const sectionRefs = useRef({});
  const currentLanguageForApi = i18n.language;

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectDishForModal = (plato) => {
    setSelectedPlato(plato);
  };

  const handleCloseModal = () => {
    setSelectedPlato(null);
  };

  // Memoizamos la estructura de las secciones del menú
  const menuSections = useMemo(() => {
    if (!menu) return [];
    
    const allDishes = menu.allDishes || [];

    // Primero, filtramos todos los platos si hay un término de búsqueda
    const filteredDishes = searchTerm
      ? allDishes.filter(plato => {
          const lowerSearchTerm = searchTerm.toLowerCase();
          const nombre = getTranslatedDishText(plato.nombre, currentLanguageForApi).toLowerCase();
          const descripcionCorta = getTranslatedDishText(plato.descripcionCorta, currentLanguageForApi).toLowerCase();
          return nombre.includes(lowerSearchTerm) || descripcionCorta.includes(lowerSearchTerm);
        })
      : allDishes;

    // Luego, construimos las secciones con los platos ya filtrados
    const sections = [
      { key: 'destacados', title: t('cartaPage.tabDestacados'), dishes: filteredDishes.filter(p => p.etiquetas?.includes('popular') || p.etiquetas?.includes('recomendado')) },
      { key: 'entrantes', title: t('cartaPage.tabEntrantes'), dishes: (menu.entrantes || []).filter(d => filteredDishes.some(fd => fd.id === d.id)) },
      { key: 'principales', title: t('cartaPage.tabPrincipales'), dishes: (menu.principales || []).filter(d => filteredDishes.some(fd => fd.id === d.id)) },
      { key: 'postres', title: t('cartaPage.tabPostres'), dishes: (menu.postres || []).filter(d => filteredDishes.some(fd => fd.id === d.id)) },
      { key: 'bebidas', title: t('cartaPage.tabBebidas'), dishes: (menu.bebidas || []).filter(d => filteredDishes.some(fd => fd.id === d.id)) },
    ];

    // Finalmente, eliminamos las secciones que se quedaron sin platos después del filtro
    return sections.filter(section => section.dishes.length > 0);

  }, [menu, searchTerm, t, currentLanguageForApi]);

  // Lógica para el scroll suave al hacer clic en una tab
  const handleTabClick = (key) => {
    const sectionElement = sectionRefs.current[key];
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Lógica para detectar la sección visible con IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-50% 0px -50% 0px', // Activa la sección cuando está en el medio de la pantalla
        threshold: 0
      }
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
  }, [menuSections]); // Se re-ejecuta si las secciones cambian (por la búsqueda)

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

      <div className={styles.tabsList} data-no-tab-swipe="true">
        {menuSections.map(section => (
          <button
            key={section.key}
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