// frontend/src/pages/CartaPage/hooks/useStickyTabs.js
import { useState, useEffect, useRef } from 'react';

/**
 * Hook para manejar la lógica de las pestañas pegajosas y la sección visible.
 * Se encarga de:
 * 1. Detectar qué sección del menú es visible en el viewport mediante IntersectionObserver.
 * 2. Actualizar el estado `visibleSection` con la clave de la sección visible.
 * 3. Desplazar la pestaña correspondiente en la barra de navegación horizontal para que siempre esté a la vista.
 * @param {Array} menuSections - Las secciones del menú que se están mostrando (filtradas si aplica).
 * @returns {object} - Un objeto que contiene:
 *   - `visibleSection`: La clave de la sección actualmente visible.
 *   - `sectionRefs`: Un objeto de referencias a los elementos DOM de cada sección.
 *   - `tabRefs`: Un objeto de referencias a los elementos DOM de cada botón de pestaña.
 *   - `tabsListRef`: Una referencia al contenedor DOM de la lista de pestañas.
 */
export const useStickyTabs = (menuSections) => {
  const [visibleSection, setVisibleSection] = useState('');
  const sectionRefs = useRef({}); // Para las secciones reales del menú
  const tabRefs = useRef({});     // Para los botones de las pestañas de navegación
  const tabsListRef = useRef(null); // Para el contenedor scrollable de las pestañas
  
  // Efecto para la lógica de IntersectionObserver que detecta la sección visible
  useEffect(() => {
    // Si no hay secciones, o si ya hay una sección visible (para evitar re-establecer al inicio),
    // y si hay secciones, establece la primera como visible por defecto.
    if (menuSections.length > 0 && !visibleSection) {
      setVisibleSection(menuSections[0].key);
    }

    // Configura el IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Si una entrada está intersectando (visible), actualiza la sección visible
          if (entry.isIntersecting) {
            setVisibleSection(entry.target.id);
          }
        });
      },
      // Opciones del observador:
      // - `rootMargin`: Define un margen alrededor del viewport para el cálculo de intersección.
      //   '-40% 0px -60% 0px' significa que la intersección se calcula en la parte central de la pantalla:
      //   la sección se considera "visible" cuando su parte superior cruza el 40% superior del viewport,
      //   y "invisible" cuando su parte inferior cruza el 40% inferior (o, más precisamente,
      //   cuando su parte superior supera el 60% inferior, ya que el margen inferior es -60%).
      //   Esto ayuda a que la pestaña cambie proactivamente un poco antes de que la sección esté completamente a la vista.
      // - `threshold`: La proporción de la intersección del objetivo con su raíz. 0 significa que tan pronto como 
      //   un píxel del objetivo sea visible, la callback se ejecutará.
      { rootMargin: '-40% 0px -60% 0px', threshold: 0 }
    );

    // Adjunta el observador a todos los elementos de sección
    const currentRefs = sectionRefs.current; // Captura los refs actuales para evitar problemas con cierres de clousures
    Object.values(currentRefs).forEach((ref) => { 
      if (ref) observer.observe(ref); 
    });

    // Función de limpieza para desvincular el observador al desmontar el componente
    return () => { 
      Object.values(currentRefs).forEach((ref) => { 
        if (ref) observer.unobserve(ref); 
      }); 
    };
  }, [menuSections, visibleSection]); // Dependencias: re-ejecuta si cambian las secciones o la sección visible

  // Efecto para desplazar la pestaña activa al centro del contenedor de pestañas
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