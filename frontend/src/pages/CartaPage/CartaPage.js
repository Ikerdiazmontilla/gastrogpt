// src/pages/CartaPage/CartaPage.js
import React, { useState, useMemo } from 'react';
import styles from './CartaPage.module.css';
import { menuData } from '../../data/menuData'; // Raw menu data
import { cartaPageTranslations } from '../../data/translations'; // Translations
import { getTranslatedDishText } from '../../utils/menuUtils'; // Utilities
import MenuItemCard from '../../components/Dish/MenuItemCard';
import DishDetailModal from '../../components/Dish/DishDetailModal';

const CartaPage = ({ currentLanguage }) => {
  const T = cartaPageTranslations[currentLanguage] || cartaPageTranslations['Español'];
  const [activeTab, setActiveTab] = useState('destacados');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlato, setSelectedPlato] = useState(null);

  const allPlatos = useMemo(() => [
    ...(menuData.entrantes || []),
    ...(menuData.principales || []),
    ...(menuData.postres || []),
    ...(menuData.bebidas || [])
  ], []);

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
    let platosToShow = [];

    if (activeTab === 'destacados') {
      platosToShow = allPlatos.filter(plato =>
        plato.etiquetas && (plato.etiquetas.includes('popular') || plato.etiquetas.includes('recomendado'))
      );
    } else if (menuData[activeTab]) {
      platosToShow = menuData[activeTab];
    } else {
      platosToShow = [];
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
  }, [activeTab, searchTerm, allPlatos, currentLanguage]);

  const tabs = useMemo(() => [
    { key: 'destacados', label: T.tabDestacados },
    { key: 'entrantes', label: T.tabEntrantes },
    { key: 'principales', label: T.tabPrincipales },
    { key: 'postres', label: T.tabPostres },
    { key: 'bebidas', label: T.tabBebidas },
  ], [T]);

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
        data-no-tab-swipe="true" // <-- ADDED ATTRIBUTE HERE
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
        />
      )}
    </div>
  );
};

export default CartaPage;