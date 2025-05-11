// src/pages/QuestionnairePage.js
import React, { useState } from 'react';
import Questionnaire from '../components/Questionnaire/Questionnaire';
import DishDetailModal from '../components/DishDetailModal/DishDetailModal';
// No need to import all menuData here

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

export default QuestionnairePage;