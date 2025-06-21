// frontend/src/pages/CartaPage/hooks/useStickyTabs.js
import { useState, useEffect, useRef } from 'react';

/**
 * Hook para manejar la lógica de las pestañas pegajosas y la sección visible.
 * @param {Array} menuSections - Las secciones del menú que se están mostrando.
 * @returns {object} - Estado y refs para controlar las pestañas.
 */
export const useStickyTabs = (menuSections) => {
  const [visibleSection, setVisibleSection] = useState('');
  const sectionRefs = useRef({});
  const tabRefs = useRef({});
  const tabsListRef = useRef(null);
  
  // Efecto para la lógica de IntersectionObserver que detecta la sección visible
  useEffect(() => {
    if (menuSections.length > 0 && !visibleSection) {
      setVisibleSection(menuSections[0].key);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSection(entry.target.id);
          }
        });
      },
      // Este margen significa que una sección se considera "visible" cuando
      // su parte superior está en el 40% superior de la pantalla.
      { rootMargin: '-40% 0px -60% 0px', threshold: 0 }
    );
    const currentRefs = sectionRefs.current;
    Object.values(currentRefs).forEach((ref) => { if (ref) observer.observe(ref); });
    return () => { Object.values(currentRefs).forEach((ref) => { if (ref) observer.unobserve(ref); }); };
  }, [menuSections, visibleSection]);

  // --- CORRECCIÓN DEL BUG DE SCROLL ---
  // Este efecto ahora desplaza la pestaña activa al centro del contenedor de pestañas
  // sin afectar el scroll vertical de la página.
  useEffect(() => {
    const tabsContainer = tabsListRef.current;
    const activeTab = tabRefs.current[visibleSection];

    if (tabsContainer && activeTab) {
      // Calculamos la posición para centrar la pestaña activa en el contenedor.
      const containerCenter = tabsContainer.clientWidth / 2;
      const tabCenter = activeTab.offsetLeft + activeTab.clientWidth / 2;
      
      const scrollToPosition = tabCenter - containerCenter;

      // Usamos el método `scrollTo` que es más moderno y no interfiere
      // con el scroll de la página principal.
      tabsContainer.scrollTo({
        left: scrollToPosition,
        behavior: 'smooth',
      });
    }
  }, [visibleSection]); // Se ejecuta solo cuando cambia la sección visible.

  return { visibleSection, sectionRefs, tabRefs, tabsListRef };
};