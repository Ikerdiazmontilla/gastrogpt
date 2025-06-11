// src/pages/ChatPage.js
import React, { useState } from 'react';
import Chat from '../features/Chat/Chat';
import DishDetailModal from '../components/Dish/DishDetailModal';
import { useTenant } from '../context/TenantContext';

const ChatPage = ({ currentLanguage }) => {
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
      <Chat
        currentLanguage={currentLanguage}
        onViewDishDetails={handleDisplayDishInModal}
      />
      {selectedPlatoModal && (
        <DishDetailModal
          plato={selectedPlatoModal}
          onClose={handleCloseModal}
          currentLanguage={currentLanguage}
          onSelectPairedDish={handleDisplayDishInModal}
          menu={menu}
        />
      )}
    </>
  );
};

export default ChatPage;