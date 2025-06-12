// src/pages/CartaPage/CartaPage.js
import React, { useState, useMemo } from 'react';
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
  
  // El idioma actual para el contenido de la API
  const currentLanguageForApi = i18n.language;

  const filteredPlatos = useMemo(() => {
    if (!menu) return [];

    let platosToShow = [];

    const tabKey = activeTab;
    if (tabKey === 'destacados') {
      platosToShow = allPlatos.filter(plato =>
        plato.etiquetas && (plato.etiquetas.includes('popular') || plato.etiquetas.includes('recomendado'))
      );
    } else if (menu[tabKey]) {
      platosToShow = menu[tabKey].filter(item => item.id != null);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      return platosToShow.filter(plato => {
        const nombre = getTranslatedDishText(plato.nombre, currentLanguageForApi).toLowerCase();
        const descripcionCorta = getTranslatedDishText(plato.descripcionCorta, currentLanguageForApi).toLowerCase();
        return nombre.includes(lowerSearchTerm) ||
               descripcionCorta.includes(lowerSearchTerm);
      });
    }
    return platosToShow;
  }, [activeTab, searchTerm, allPlatos, currentLanguageForApi, menu]);

  const tabs = useMemo(() => [
    { key: 'destacados', label: t('cartaPage.tabDestacados') },
    { key: 'entrantes', label: t('cartaPage.tabEntrantes') },
    { key: 'principales', label: t('cartaPage.tabPrincipales') },
    { key: 'postres', label: t('cartaPage.tabPostres') },
    { key: 'bebidas', label: t('cartaPage.tabBebidas') },
  ], [t]);

  if (!menu) {
    return <div className={styles.cartaContainer}>Cargando datos del menú...</div>;
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
                menuHasImages={menuHasImages}
              />
            ))}
          </div>
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