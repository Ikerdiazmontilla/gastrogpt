// src/pages/ChatPage.js
import React, { useState, useEffect } from 'react'; // Importado useEffect
import Chat from '../features/Chat/Chat';
import DishDetailModal from '../components/Dish/DishDetailModal';
import { useTenant } from '../context/TenantContext';

const MODAL_HISTORY_STATE_KEY = 'dishDetailModalOpen';

const ChatPage = () => {
  const { tenantConfig } = useTenant();
  const menu = tenantConfig?.menu;

  const [selectedPlatoModal, setSelectedPlatoModal] = useState(null);

  // ====================================================================
  // LÓGICA DE HISTORIAL CENTRALIZADA AQUÍ
  // ====================================================================
  
  const handleDisplayDishInModal = (plato) => {
    if (!selectedPlatoModal) {
      window.history.pushState({ [MODAL_HISTORY_STATE_KEY]: true }, '');
    }
    setSelectedPlatoModal(plato);
  };

  const handleCloseModal = () => {
    setSelectedPlatoModal(null);
    if (window.history.state && window.history.state[MODAL_HISTORY_STATE_KEY]) {
      window.history.back();
    }
  };

  useEffect(() => {
    const handlePopState = (event) => {
      if (selectedPlatoModal) {
        setSelectedPlatoModal(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [selectedPlatoModal]);

  return (
    <>
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