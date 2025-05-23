// <file path="gastrogpts/src/pages/ChatPage.js">
// src/pages/ChatPage.js
import React, { useState } from 'react';
import Chat from '../features/Chat/Chat'; // Updated path
import DishDetailModal from '../components/Dish/DishDetailModal'; // Updated path

const ChatPage = ({ currentLanguage }) => {
  const [selectedPlatoModal, setSelectedPlatoModal] = useState(null);

  // This function is used by Chat component AND by DishDetailModal for paired items
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
        onViewDishDetails={handleDisplayDishInModal} // Pass the modal display function
      />
      {selectedPlatoModal && (
        <DishDetailModal
          plato={selectedPlatoModal}
          onClose={handleCloseModal}
          currentLanguage={currentLanguage}
          onSelectPairedDish={handleDisplayDishInModal} // Pass the same function for paired items
        />
      )}
    </>
  );
};

export default ChatPage;