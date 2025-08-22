// frontend/src/context/AllergenContext.js
import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';

const ALLERGEN_STORAGE_KEY = 'userAllergens';
const ALLERGEN_SET_FLAG_KEY = 'userAllergensSet'; // Key to check if the user has made a choice

const AllergenContext = createContext(null);

export const AllergenProvider = ({ children }) => {
  // Holds the list of selected allergens (e.g., ['gluten', 'nuts'])
  const [allergens, setAllergens] = useState([]);
  // Tracks if the user has completed the initial allergen selection step
  const [isAllergenChoiceMade, setIsAllergenChoiceMade] = useState(false);

  // On initial app load, check local storage for saved preferences
  useEffect(() => {
    try {
      const savedAllergens = localStorage.getItem(ALLERGEN_STORAGE_KEY);
      const choiceMade = localStorage.getItem(ALLERGEN_SET_FLAG_KEY);

      if (savedAllergens) {
        setAllergens(JSON.parse(savedAllergens));
      }
      if (choiceMade) {
        setIsAllergenChoiceMade(true);
      }
    } catch (error) {
      console.error("Failed to read allergen preferences from local storage:", error);
    }
  }, []);

  // Function to save the user's selection
  const saveAllergenSelection = (selectedAllergens) => {
    try {
      // Save the array of allergens
      localStorage.setItem(ALLERGEN_STORAGE_KEY, JSON.stringify(selectedAllergens));
      // Mark that the user has made their choice (even if it's "no allergies")
      localStorage.setItem(ALLERGEN_SET_FLAG_KEY, 'true');
      
      setAllergens(selectedAllergens);
      setIsAllergenChoiceMade(true);
    } catch (error) {
      console.error("Failed to save allergen preferences to local storage:", error);
    }
  };

  // The value provided to consuming components
  const value = useMemo(() => ({
    allergens,
    isAllergenChoiceMade,
    saveAllergenSelection,
  }), [allergens, isAllergenChoiceMade]);

  return (
    <AllergenContext.Provider value={value}>
      {children}
    </AllergenContext.Provider>
  );
};

// Custom hook for easy access to the context
export const useAllergens = () => {
  const context = useContext(AllergenContext);
  if (context === undefined) {
    throw new Error('useAllergens must be used within an AllergenProvider');
  }
  return context;
};