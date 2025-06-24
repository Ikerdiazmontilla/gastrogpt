// src/pages/ChatPage.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Chat from '../features/Chat/Chat';
import DishDetailModal from '../components/Dish/DishDetailModal';
import { useTenant } from '../context/TenantContext';
import { useTranslation } from 'react-i18next';
import { getTranslatedDishText } from '../utils/menuUtils';

const MODAL_HISTORY_STATE_KEY = 'dishDetailModalOpen';

const ChatPage = () => {
  const { tenantConfig } = useTenant();
  const { i18n } = useTranslation();
  const menu = tenantConfig?.menu;

  const [selectedPlatoModal, setSelectedPlatoModal] = useState(null);
  
  const chatApiRef = useRef(null);

  const handleDisplayDishInModal = useCallback((plato) => {
    if (!selectedPlatoModal) {
      window.history.pushState({ [MODAL_HISTORY_STATE_KEY]: true }, '');
    }
    setSelectedPlatoModal(plato);
  }, [selectedPlatoModal]);

  const handleCloseModal = useCallback(() => {
    setSelectedPlatoModal(null);
    if (window.history.state && window.history.state[MODAL_HISTORY_STATE_KEY]) {
      window.history.back();
    }
  }, []);

  const handleSelectDishFromChat = useCallback((plato) => {
    if (chatApiRef.current && plato) {
      const dishName = getTranslatedDishText(plato.nombre, i18n.language);
      chatApiRef.current.sendMessage(dishName);
      handleCloseModal();
    }
  }, [i18n.language, handleCloseModal]);

  // NUEVO: Callback para cuando se hace clic en una tarjeta de categoría
  const handleCategoryClick = useCallback((categoryName) => {
    if (chatApiRef.current && categoryName) {
      // Envía el nombre de la categoría como un nuevo mensaje del usuario
      chatApiRef.current.sendMessage(categoryName);
    }
  }, []); // No tiene dependencias externas, es estable.


  useEffect(() => {
    const handlePopState = () => {
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
      <Chat 
        onViewDishDetails={handleDisplayDishInModal} 
        // NUEVO: Pasamos el nuevo callback al componente Chat
        onCategoryClick={handleCategoryClick}
        setSendMessageApi={(api) => { chatApiRef.current = api; }}
      />
      
      {selectedPlatoModal && (
        <DishDetailModal
          plato={selectedPlatoModal}
          onClose={handleCloseModal}
          onSelectPairedDish={handleDisplayDishInModal}
          menu={menu}
          source="chat" 
          onSelectDish={handleSelectDishFromChat}
        />
      )}
    </>
  );
};

export default ChatPage;