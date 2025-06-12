// src/pages/CartaPage/CartaPage.js
import React, { useState, useMemo } from 'react';
import styles from './CartaPage.module.css';
import { useTenant } from '../../context/TenantContext';
import { cartaPageTranslations } from '../../data/translations';
import { getTranslatedDishText } from '../../utils/menuUtils';
import MenuItemCard from '../../components/Dish/MenuItemCard';
import DishDetailModal from '../../components/Dish/DishDetailModal';

const CartaPage = ({ currentLanguage }) => {
  const { tenantConfig } = useTenant();
  const menu = tenantConfig?.menu;
  // Obtenemos el flag del tema. Usamos `?? true` como fallback seguro si no está definido.
  const menuHasImages = tenantConfig?.theme?.menuHasImages ?? true;

  const T = cartaPageTranslations[currentLanguage] || cartaPageTranslations['Español'];
  const [activeTab, setActiveTab] = useState('destacados');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlato, setSelectedPlato] = useState(null);

  const allPlatos = useMemo(() => menu?.allDishes?.filter(item => item.id != null) || [], [menu]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectDishForModal = (plato) => {
    setSelectedPlato(plato);
  };

  const handleCloseModal = () => {
    setSelectedPlato(null);
  };

  const filteredPlatos = useMemo(() => {
    if (!menu) return [];

    let platosToShow = [];

    if (activeTab === 'destacados') {
      platosToShow = allPlatos.filter(plato =>
        plato.etiquetas && (plato.etiquetas.includes('popular') || plato.etiquetas.includes('recomendado'))
      );
    } else if (menu[activeTab]) {
      platosToShow = menu[activeTab].filter(item => item.id != null);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      return platosToShow.filter(plato => {
        const nombre = getTranslatedDishText(plato.nombre, currentLanguage).toLowerCase();
        const descripcionCorta = getTranslatedDishText(plato.descripcionCorta, currentLanguage).toLowerCase();
        return nombre.includes(lowerSearchTerm) ||
               descripcionCorta.includes(lowerSearchTerm);
      });
    }
    return platosToShow;
  }, [activeTab, searchTerm, allPlatos, currentLanguage, menu]);

  const tabs = useMemo(() => [
    { key: 'destacados', label: T.tabDestacados },
    { key: 'entrantes', label: T.tabEntrantes },
    { key: 'principales', label: T.tabPrincipales },
    { key: 'postres', label: T.tabPostres },
    { key: 'bebidas', label: T.tabBebidas },
  ], [T]);

  if (!menu) {
    return <div className={styles.cartaContainer}>Cargando datos del menú...</div>;
  }

  return (
    <div className={styles.cartaContainer}>
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>{T.pageTitle}</h1>
        <p className={styles.pageDescription}>{T.pageDescription}</p>
        <div className={styles.searchContainer}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder={T.searchPlaceholder}
            className={styles.searchInput}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div
        className={styles.tabsList}
        data-no-tab-swipe="true"
      >
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`${styles.tabTrigger} ${activeTab === tab.key ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {filteredPlatos.length > 0 ? (
          <div className={styles.dishesGrid}>
            {filteredPlatos.map(plato => (
              <MenuItemCard
                key={plato.id}
                plato={plato}
                onViewMore={handleSelectDishForModal}
                currentLanguage={currentLanguage}
                menuHasImages={menuHasImages} // Pasamos el flag a la tarjeta
              />
            ))}
          </div>
        ) : (
          <p className={styles.noResultsMessage}>{T.noResults}</p>
        )}
      </div>

      {selectedPlato && (
        <DishDetailModal
          plato={selectedPlato}
          onClose={handleCloseModal}
          currentLanguage={currentLanguage}
          onSelectPairedDish={handleSelectDishForModal}
          menu={menu}
        />
      )}
    </div>
  );
};

export default CartaPage;