import React from 'react';
import styles from './CollapsibleSubCategory.module.css';
import MenuItemCard from '../Dish/MenuItemCard';

/**
 * Componente que muestra una subcategoría como un "acordeón" desplegable.
 *
 * @param {object} props - Propiedades del componente.
 * @param {string} props.title - Título de la subcategoría.
 * @param {Array} props.dishes - Array de platos en la subcategoría.
 * @param {boolean} props.isOpen - Si el acordeón está abierto o cerrado.
 * @param {Function} props.onToggle - Función que se llama al pulsar para abrir/cerrar.
 * @param {string} props.categoryKey - La clave de la categoría padre (ej. 'bebidas') para estilado.
 * @param {boolean} props.menuHasImages - Si el menú debe mostrar imágenes.
 * @param {boolean} props.showShortDescriptionInMenu - Si se debe mostrar la descripción corta.
 * @param {Function} props.onViewMore - Función para abrir el modal de detalles del plato.
 */
const CollapsibleSubCategory = ({
  title,
  dishes,
  isOpen,
  onToggle,
  categoryKey,
  menuHasImages,
  showShortDescriptionInMenu,
  onViewMore,
}) => {
  // Construye las clases CSS para el header, aplicando el color de la categoría padre.
  const headerClasses = `${styles.header} ${styles[`header-${categoryKey}`] || styles['header-default']}`;
  const indicatorClasses = `${styles.indicatorIcon} ${isOpen ? styles.open : ''}`;
  const contentWrapperClasses = `${styles.contentWrapper} ${isOpen ? styles.open : ''}`;

  return (
    <div className={styles.collapsibleContainer}>
      {/* El botón que funciona como cabecera del desplegable */}
      <button className={headerClasses} onClick={onToggle} aria-expanded={isOpen}>
        <span className={styles.title}>{title}</span>
        {/* El icono que rota para indicar el estado (abierto/cerrado) */}
        <span className={indicatorClasses}>›</span>
      </button>

      {/* El contenedor del contenido que se anima al abrir/cerrar */}
      <div className={contentWrapperClasses}>
        <div className={styles.contentInner}>
          <div className={styles.dishesGrid}>
            {dishes.map((plato) => (
              <MenuItemCard
                key={plato.id}
                plato={plato}
                onViewMore={onViewMore}
                menuHasImages={menuHasImages}
                categoryKey={categoryKey}
                showShortDescriptionInMenu={showShortDescriptionInMenu}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSubCategory;