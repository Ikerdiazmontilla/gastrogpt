// frontend/src/data/translations.js

// For DishDetailModal
export const dishDetailModalTranslations = {
  Español: {
    allergens: "Alérgenos:",
    tags: "Etiquetas:",
    close: "Cerrar",
    pairsWellWith: "Combina bien con:",
  },
  English: {
    allergens: "Allergens:",
    tags: "Tags:",
    close: "Close",
    pairsWellWith: "Pairs well with:",
  }
};

// For MenuItemCard
export const menuItemCardTranslations = {
  Español: {
    viewMore: "Ver más",
  },
  English: {
    viewMore: "View More",
  }
};

// For CartaPage
export const cartaPageTranslations = {
  Español: {
    pageTitle: "Nuestra Carta",
    pageDescription: "Descubre nuestra selección de platos preparados con los mejores ingredientes",
    searchPlaceholder: "Buscar platos, ingredientes...",
    tabDestacados: "⭐ Destacados",
    tabEntrantes: "🥗 Entrantes",
    tabPrincipales: "🍲 Platos Principales",
    tabPostres: "🍰 Postres",
    tabBebidas: "🍷 Bebidas",
    noResults: "No se encontraron platos que coincidan con tu búsqueda en esta categoría."
  },
  English: {
    pageTitle: "Our Menu",
    pageDescription: "Discover our selection of dishes prepared with the finest ingredients",
    searchPlaceholder: "Search dishes, ingredients...",
    tabDestacados: "⭐ Featured",
    tabEntrantes: "🥗 Appetizers",
    tabPrincipales: "🍲 Main Courses",
    tabPostres: "🍰 Desserts",
    tabBebidas: "🍹 Drinks",
    noResults: "No dishes found matching your search in this category."
  }
};

// For Navbar
export const navbarTranslations = {
  Español: {
    carta: "📖 Carta",
    chat: "💬 Chat",
  },
  English: {
    carta: "📖 Menu",
    chat: "💬 Chat",
  }
};

// Chat suggestions
export const chatSuggestions = {
  Español: [
    '¿Que bebidas me recomiendas?',
    '¿Cuáles son los platos más populares?',
    'Dame opciones vegetarianas',
    '¿Qué postres tenéis?',
    'Recomiéndame algo ligero',
  ],
  English: [
    'What drinks do you suggest me?',
    'What are the most popular dishes?',
    'Give me vegetarian options',
    'What desserts do you have?',
    'Recommend something light',
  ],
};

// ==================================================================
// NUEVO: Definiciones estáticas para alérgenos y etiquetas
// Estas definiciones se movieron aquí desde el antiguo menuData.js
// ==================================================================

// Definiciones para alérgenos
export const alergenosDetails = {
    gluten: { icon: "🌾", nombre: "Gluten", nombre_en: "Gluten" },
    lactosa: { icon: "🥛", nombre: "Lactosa", nombre_en: "Dairy" },
    huevo: { icon: "🥚", nombre: "Huevo", nombre_en: "Egg" },
    pescado: { icon: "🐟", nombre: "Pescado", nombre_en: "Fish" },
    mariscos: { icon: "🦐", nombre: "Mariscos", nombre_en: "Shellfish" },
    crustaceos: { icon: "🦞", nombre: "Crustáceos", nombre_en: "Crustaceans" },
    moluscos: { icon: "🐚", nombre: "Moluscos", nombre_en: "Mollusks" },
    frutos_secos: { icon: "🥜", nombre: "Frutos Secos", nombre_en: "Nuts" },
    soja: { icon: "🫘", nombre: "Soja", nombre_en: "Soy" },
    sulfitos: { icon: "🧪", nombre: "Sulfitos", nombre_en: "Sulfites" },
    default: { icon: "⚠️", nombre: "Otro", nombre_en: "Other" },
};

// Definiciones para etiquetas/tags
export const etiquetasDetails = {
    popular: { label: "Popular", label_en: "Popular", icon: "⭐" },
    recomendado: { label: "Recomendado", label_en: "Recommended", icon: "👨‍🍳" },
    vegano: { label: "Vegano", label_en: "Vegan", icon: "🌿" },
    vegetariano: { label: "Vegetariano", label_en: "Vegetarian", icon: "🥕" },
    sin_gluten: { label: "Sin Gluten", label_en: "Gluten-Free" },
    picante_suave: { label: "Picante Suave", label_en: "Mild Spicy", icon: "🌶️" },
};