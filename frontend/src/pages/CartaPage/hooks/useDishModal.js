// frontend/src/pages/CartaPage/hooks/useDishModal.js
import { useState, useEffect, useCallback } from 'react';

const MODAL_HISTORY_STATE_KEY = 'dishDetailModalOpen';

/**
 * Hook para gestionar el estado y la lógica del modal de detalle de plato.
 * @returns {object} - El plato seleccionado y las funciones para abrir/cerrar el modal.
 */
export const useDishModal = () => {
  const [selectedPlato, setSelectedPlato] = useState(null);

  const openModal = useCallback((plato) => {
    if (!selectedPlato) {
      window.history.pushState({ [MODAL_HISTORY_STATE_KEY]: true }, '');
    }
    setSelectedPlato(plato);
  }, [selectedPlato]);

  const closeModal = useCallback(() => {
    setSelectedPlato(null);
    if (window.history.state && window.history.state[MODAL_HISTORY_STATE_KEY]) {
      window.history.back();
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (selectedPlato) {
        setSelectedPlato(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [selectedPlato]);

  return { selectedPlato, openModal, closeModal };
};