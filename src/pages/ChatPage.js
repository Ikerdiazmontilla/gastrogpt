// src/pages/ChatPage.js
import React, { useState } from 'react';
import Chat from '../components/Chat/Chat';
import DishDetailModal from '../components/DishDetailModal/DishDetailModal';
// No need to import all menuData here if Chat component handles findDishById

const ChatPage = ({ currentLanguage }) => {
  const [selectedPlatoModal, setSelectedPlatoModal] = useState(null);

  const handleViewDishDetails = (plato) => {
    setSelectedPlatoModal(plato);
  };

  const handleCloseModal = () => {
    setSelectedPlatoModal(null);
  };

  return (
    <>
      <Chat
        currentLanguage={currentLanguage}
        onViewDishDetails={handleViewDishDetails} // Pass the handler
      />
      {selectedPlatoModal && (
        <DishDetailModal
          plato={selectedPlatoModal}
          onClose={handleCloseModal}
          currentLanguage={currentLanguage}
        />
      )}
    </>
  );
};

export default ChatPage;