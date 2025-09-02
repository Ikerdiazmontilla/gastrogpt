// frontend/src/components/AllergenSelector/AllergenSelector.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAllergens } from '../../context/AllergenContext';
import { alergenosDetails } from '../../data/menuDefinitions';
import { getAlergenoNombre } from '../../utils/menuUtils'; // Import the utility function
import styles from './AllergenSelector.module.css';

const AllergenSelector = () => {
  // MODIFIED: Use the translation hook
  const { t, i18n } = useTranslation();
  const { saveAllergenSelection } = useAllergens();
  
  const currentLanguage = i18n.language;
  
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [otherAllergen, setOtherAllergen] = useState('');

  const handleToggle = (key) => {
    setSelectedKeys(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(key)) {
        newSelection.delete(key);
      } else {
        newSelection.add(key);
      }
      return newSelection;
    });
  };

  const handleSubmit = () => {
    const finalSelection = Array.from(selectedKeys);
    if (otherAllergen.trim()) {
      finalSelection.push(otherAllergen.trim());
    }
    saveAllergenSelection(finalSelection);
  };

  const handleNoAllergies = () => {
    saveAllergenSelection([]);
  };

  const allergenKeys = Object.keys(alergenosDetails).filter(key => key !== 'default');

  return (
    <div className='fullscreen-overlay'>
      <div className={styles.selectorBox}>
        {/* MODIFIED: Use translation keys */}
        <h2 className={styles.title}>{t('allergenSelector.title')}</h2>
        <p className={styles.subtitle}>{t('allergenSelector.subtitle')}</p>
        {/* NEW: Prominent no-allergens button at the beginning */}
        <button className={styles.noAllergensButton} onClick={handleNoAllergies}>
          {t('allergenSelector.skipButton')}
        </button>
        
        <div className={styles.grid}>
          {allergenKeys.map(key => (
            <button
              key={key}
              className={`${styles.allergenButton} ${selectedKeys.has(key) ? styles.selected : ''}`}
              onClick={() => handleToggle(key)}
            >
              <span className={styles.icon}>{alergenosDetails[key].icon}</span>
              {/* MODIFIED: Use the utility function for translation */}
              {getAlergenoNombre(key, currentLanguage)}
            </button>
          ))}
        </div>

        <input
          type="text"
          className={styles.otherInput}
          // MODIFIED: Use translation key
          placeholder={t('allergenSelector.otherPlaceholder')}
          value={otherAllergen}
          onChange={(e) => setOtherAllergen(e.target.value)}
        />

        <div className={styles.actions}>
          <button className={styles.continueButton} onClick={handleSubmit}>
            {t('allergenSelector.continueButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllergenSelector;
