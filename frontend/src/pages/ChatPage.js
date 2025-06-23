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
  
  // Ref para guardar la función que envía mensajes al chat
  const chatApiRef = useRef(null);

  // Función para mostrar un plato en el modal de detalles
  const handleDisplayDishInModal = useCallback((plato) => {
    if (!selectedPlatoModal) {
      window.history.pushState({ [MODAL_HISTORY_STATE_KEY]: true }, '');
    }
    setSelectedPlatoModal(plato);
  }, [selectedPlatoModal]);

  // Función para cerrar el modal de detalles del plato
  const handleCloseModal = useCallback(() => {
    setSelectedPlatoModal(null);
    if (window.history.state && window.history.state[MODAL_HISTORY_STATE_KEY]) {
      window.history.back();
    }
  }, []);

  // NUEVA FUNCIÓN: Se ejecuta cuando se pulsa "Elegir" en el modal
  const handleSelectDishFromChat = useCallback((plato) => {
    if (chatApiRef.current && plato) {
      // 1. Obtiene el nombre del plato en el idioma actual
      const dishName = getTranslatedDishText(plato.nombre, i18n.language);
      
      // 2. Llama a la función expuesta por el componente Chat para enviar el mensaje
      chatApiRef.current.sendMessage(dishName);
      
      // 3. Cierra el modal
      handleCloseModal();
    }
  }, [i18n.language, handleCloseModal]);


  // Efecto para manejar el botón de atrás del navegador cuando el modal está abierto
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
      {/* Componente principal del chat */}
      <Chat 
        onViewDishDetails={handleDisplayDishInModal} 
        // NUEVO: Pasamos una función para que Chat nos dé su API
        setSendMessageApi={(api) => { chatApiRef.current = api; }}
      />
      
      {/* Modal de detalle del plato */}
      {selectedPlatoModal && (
        <DishDetailModal
          plato={selectedPlatoModal}
          onClose={handleCloseModal}
          onSelectPairedDish={handleDisplayDishInModal}
          menu={menu}
          // NUEVO: Indicamos que el modal se abre desde el chat
          source="chat" 
          // NUEVO: Pasamos la función que se ejecutará al pulsar "Elegir"
          onSelectDish={handleSelectDishFromChat}
        />
      )}
    </>
  );
};

export default ChatPage;