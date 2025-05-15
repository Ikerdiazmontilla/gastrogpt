// src/pages/QuestionnairePage.js
import React, { useState } from 'react';
import Questionnaire from '../features/Questionnaire/Questionnaire'; // Updated path
import DishDetailModal from '../components/Dish/DishDetailModal';   // Updated path

const QuestionnairePage = ({ currentLanguage }) => {
  const [selectedPlatoModal, setSelectedPlatoModal] = useState(null);

  const handleViewDishDetails = (plato) => {
    setSelectedPlatoModal(plato);
  };

  const handleCloseModal = () => {
    setSelectedPlatoModal(null);
  };

  return (
    <>
      <Questionnaire
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

export default QuestionnairePage;