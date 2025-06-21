// src/pages/CartaPage/CartaPage.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './CartaPage.module.css';
import { useTenant } from '../../context/TenantContext';
// La importación de useOrder ha sido eliminada

// Importando los nuevos hooks para modularizar la lógica
import { useMenuFiltering } from './hooks/useMenuFiltering';
import { useStickyTabs } from './hooks/useStickyTabs';
import { useDishModal } from './hooks/useDishModal';

import MenuItemCard from '../../components/Dish/MenuItemCard';
import DishDetailModal from '../../components/Dish/DishDetailModal';
// La importación de OrderButton ha sido eliminada

const CartaPage = () => {
  const { i18n, t } = useTranslation();
  const { tenantConfig } = useTenant();
  // openDrawer ha sido eliminado
  
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda

  // Usando los hooks personalizados para manejar la lógica compleja
  const menuSections = useMenuFiltering(tenantConfig?.menu, searchTerm, i18n.language);
  const { selectedPlato, openModal, closeModal } = useDishModal();
  const { visibleSection, sectionRefs, tabRefs, tabsListRef } = useStickyTabs(menuSections);

  // Datos básicos del tenant
  const menu = tenantConfig?.menu;
  const menuHasImages = tenantConfig?.theme?.menuHasImages ?? true;

  // Función para manejar el clic en una pestaña, desplazando la sección correspondiente a la vista
  const handleTabClick = (key) => {
    sectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth' });
  };

  // Muestra un mensaje de carga si el menú aún no está disponible
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

      {/* Lista de pestañas de categorías, se desplazan horizontalmente */}
      <div ref={tabsListRef} className={styles.tabsList} data-no-tab-swipe="true">
        {menuSections.map(section => (
          <button
            key={section.key}
            // Asigna una ref a cada botón de pestaña para el control de scroll y visibilidad
            ref={(el) => (tabRefs.current[section.key] = el)}
            // Clases dinámicas para resaltar la pestaña activa y aplicar estilos de categoría
            className={`${styles.tabTrigger} ${visibleSection === section.key ? styles.activeTab : ''} ${styles['tab-' + (section.parentCategoryKey || 'default')]}`}
            onClick={() => handleTabClick(section.key)}
          >
            {section.title}
          </button>
        ))}
      </div>

      {/* Contenido principal del menú, con las secciones de platos */}
      <div className={styles.menuContent}>
        {menuSections.length > 0 ? (
          menuSections.map(section => (
            <section
              key={section.key}
              id={section.key} // ID para el IntersectionObserver
              // Asigna una ref a cada sección para el IntersectionObserver
              ref={(el) => (sectionRefs.current[section.key] = el)}
              // Clases dinámicas para estilos de sección basados en la categoría
              className={`${styles.menuSection} ${styles[`section-${section.parentCategoryKey}`] || styles['section-default']}`}
            >
              <h2 className={styles.sectionTitle}>
                {/* Marcador de color para la categoría */}
                <span className={`${styles.categoryMarker} ${styles[`marker-${section.parentCategoryKey}`] || styles['marker-default']}`}></span>
                {section.title}
              </h2>
              <p className={styles.categoryInstruction}>{t('cartaPage.orderInstruction')}</p>
              <div className={styles.dishesGrid}>
                {/* Mapea y renderiza las tarjetas de cada plato dentro de la sección */}
                {section.dishes.map(plato => (
                  <MenuItemCard
                    key={plato.id}
                    plato={plato}
                    onViewMore={openModal} // Abre el modal de detalle al hacer clic
                    menuHasImages={menuHasImages} // Pasa si el menú tiene imágenes
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          // Mensaje si no hay resultados de búsqueda
          <p className={styles.noResultsMessage}>{t('cartaPage.noResults')}</p>
        )}
      </div>

      {/* Modal de detalle de plato, se muestra condicionalmente si hay un plato seleccionado */}
      {selectedPlato && (
        <DishDetailModal 
          plato={selectedPlato} 
          onClose={closeModal} 
          onSelectPairedDish={openModal} // Permite abrir otro plato relacionado desde el modal
          menu={menu} // Se pasa el menú completo para buscar platos relacionados
        />
      )}
      
      {/* El OrderButton ha sido eliminado */}
    </div>
  );
};

export default CartaPage;