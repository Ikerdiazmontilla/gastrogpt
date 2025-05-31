// // <file path="gastrogpts/src/pages/QuestionnairePage.js">
// // src/pages/QuestionnairePage.js
// import React, { useState } from 'react';
// import Questionnaire from '../features/Questionnaire/Questionnaire'; // Updated path
// import DishDetailModal from '../components/Dish/DishDetailModal';   // Updated path

// const QuestionnairePage = ({ currentLanguage }) => {
//   const [selectedPlatoModal, setSelectedPlatoModal] = useState(null);

//   // This function is used by Questionnaire component AND by DishDetailModal for paired items
//   const handleDisplayDishInModal = (plato) => {
//     setSelectedPlatoModal(plato);
//   };

//   const handleCloseModal = () => {
//     setSelectedPlatoModal(null);
//   };

//   return (
//     <>
//       <Questionnaire
//         currentLanguage={currentLanguage}
//         onViewDishDetails={handleDisplayDishInModal} // Pass the modal display function
//       />
//       {selectedPlatoModal && (
//         <DishDetailModal
//           plato={selectedPlatoModal}
//           onClose={handleCloseModal}
//           currentLanguage={currentLanguage}
//           onSelectPairedDish={handleDisplayDishInModal} // Pass the same function for paired items
//         />
//       )}
//     </>
//   );
// };

// export default QuestionnairePage;