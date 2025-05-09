// src/pages/CartaPage/CartaPage.js
import React, { useState, useMemo } from 'react';
import styles from './CartaPage.module.css';
import { menuData, getAlergenoIcon, getEtiquetaLabel, getEtiquetaClass } from '../../data/menuData';
import MenuItemCard from '../../components/MenuItemCard/MenuItemCard';
import DishDetailModal from '../../components/DishDetailModal/DishDetailModal';

const translations = {
  Español: {
    pageTitle: "Nuestra Carta",
    pageDescription: "Descubre nuestra selección de platos preparados con los mejores ingredientes",
    searchPlaceholder: "Buscar platos, ingredientes...",
    tabDestacados: "⭐ Destacados",
    tabEntrantes: "🥗 Entrantes",
    tabPrincipales: "🍲 Platos Principales",
    tabPostres: "🍰 Postres",
    tabBebidas: "🍷 Bebidas",
    noResults: "No se encontraron platos que coincidan con tu búsqueda en esta categoría."
  },
  English: {
    pageTitle: "Our Menu",
    pageDescription: "Discover our selection of dishes prepared with the finest ingredients",
    searchPlaceholder: "Search dishes, ingredients...",
    tabDestacados: "⭐ Featured",
    tabEntrantes: "🥗 Appetizers",
    tabPrincipales: "🍲 Main Courses",
    tabPostres: "🍰 Desserts",
    tabBebidas: "🍹 Drinks", // Changed icon for drinks for EN example
    noResults: "No dishes found matching your search in this category."
  }
};

const CartaPage = ({ currentLanguage }) => {
  const T = translations[currentLanguage] || translations['Español'];
  const [activeTab, setActiveTab] = useState('destacados'); // 'destacados', 'entrantes', etc.
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlato, setSelectedPlato] = useState(null);

  const allPlatos = useMemo(() => [
    ...menuData.entrantes,
    ...menuData.principales,
    ...menuData.postres,
    ...menuData.bebidas
  ], []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleViewMore = (plato) => {
    setSelectedPlato(plato);
  };

  const handleCloseModal = () => {
    setSelectedPlato(null);
  };

  const filteredPlatos = useMemo(() => {
    let platosToShow = [];

    if (activeTab === 'destacados') {
      platosToShow = allPlatos.filter(plato =>
        plato.etiquetas.includes('popular') || plato.etiquetas.includes('recomendado')
      );
    } else if (menuData[activeTab]) {
      platosToShow = menuData[activeTab];
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      return platosToShow.filter(plato =>
        plato.nombre.toLowerCase().includes(lowerSearchTerm) ||
        plato.descripcionCorta.toLowerCase().includes(lowerSearchTerm) ||
        plato.descripcionLarga.toLowerCase().includes(lowerSearchTerm)
      );
    }
    return platosToShow;
  }, [activeTab, searchTerm, allPlatos]);

  const tabs = [
    { key: 'destacados', label: T.tabDestacados },
    { key: 'entrantes', label: T.tabEntrantes },
    { key: 'principales', label: T.tabPrincipales },
    { key: 'postres', label: T.tabPostres },
    { key: 'bebidas', label: T.tabBebidas },
  ];

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

      <div className={styles.tabsList}>
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
                onViewMore={handleViewMore}
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
        />
      )}
    </div>
  );
};

export default CartaPage;