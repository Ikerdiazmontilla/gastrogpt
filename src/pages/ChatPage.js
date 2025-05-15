// src/pages/ChatPage.js
import React, { useState } from 'react';
import Chat from '../features/Chat/Chat'; // Updated path
import DishDetailModal from '../components/Dish/DishDetailModal'; // Updated path

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
        onViewDishDetails={handleViewDishDetails}
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