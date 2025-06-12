// src/pages/ChatPage.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Chat from '../features/Chat/Chat';
import DishDetailModal from '../components/Dish/DishDetailModal';
import { useTenant } from '../context/TenantContext';

const ChatPage = () => {
  const { tenantConfig } = useTenant();
  const menu = tenantConfig?.menu;

  const [selectedPlatoModal, setSelectedPlatoModal] = useState(null);

  const handleDisplayDishInModal = (plato) => {
    setSelectedPlatoModal(plato);
  };

  const handleCloseModal = () => {
    setSelectedPlatoModal(null);
  };

  return (
    <>
      {/* El componente Chat ahora es autónomo y no necesita props de idioma */}
      <Chat onViewDishDetails={handleDisplayDishInModal} />
      {selectedPlatoModal && (
        <DishDetailModal
          plato={selectedPlatoModal}
          onClose={handleCloseModal}
          onSelectPairedDish={handleDisplayDishInModal}
          menu={menu}
        />
      )}
    </>
  );
};

export default ChatPage;