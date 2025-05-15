// src/data/translations.js

// For DishDetailModal
export const dishDetailModalTranslations = {
  Español: {
    allergens: "Alérgenos:",
    tags: "Etiquetas:",
    close: "Cerrar"
  },
  English: {
    allergens: "Allergens:",
    tags: "Tags:",
    close: "Close"
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

// For Questionnaire
export const questionnaireTranslations = {
  Español: {
    title: "¿Qué te gustaría comer hoy?",
    labels: { tipoComida: "Tipo de Comida:", precio: "Precio:", alergias: "Alergias:", nivelPicante: "Nivel de Picante:", consideraciones: "Consideraciones Adicionales (opcional):" },
    options: { tipoComida: { carne: "Carne", pescado: "Pescado", marisco: "Marisco", vegano: "Vegano", vegetariano: "Vegetariano", pasta: "Pasta", hamburguesa: "Hamburguesa", otro: "Otro (ver consideraciones)" }, precio: { selectPlaceholder: "Selecciona un rango", val1: "Menos de 15€", val2: "Menos de 20€", val3: "Menos de 30€", val4: "Sin límite" }, alergias: { nada: "Ninguna", gluten: "Gluten", lactosa: "Lactosa", nueces: "Nueces", mariscos: "Mariscos", otro: "Otra (ver consideraciones)" }, nivelPicante: { suave: "Suave", medio: "Medio", picante: "Picante", muyPicante: "Muy Picante" } },
    placeholders: { consideraciones: "Escribe aquí cualquier consideración adicional..." },
    buttons: { submit: "Crear Menú", loading: "Creando Menú..." },
    results: { recommendationsTitle: "Recomendaciones:" },
    errors: { requiredFields: "Por favor, completa todas las opciones requeridas (Tipo de Comida, Precio, Nivel de Picante).", requiredAlergias: "Por favor, selecciona al menos una opción para Alergias (puede ser \"Ninguna\").", fetchErrorPrefix: "Error: ", defaultFetchError: "Lo siento, ocurrió un error al generar las recomendaciones." }
  },
  English: {
    title: "What would you like to eat today?",
    labels: { tipoComida: "Type of Food:", precio: "Price:", alergias: "Allergies:", nivelPicante: "Spice Level:", consideraciones: "Additional Considerations (optional):" },
    options: { tipoComida: { carne: "Meat", pescado: "Fish", marisco: "Seafood", vegano: "Vegan", vegetariano: "Vegetarian", pasta: "Pasta", hamburguesa: "Burger", otro: "Other (see considerations)" }, precio: { selectPlaceholder: "Select a range", val1: "Less than €15", val2: "Less than €20", val3: "Less than €30", val4: "No limit" }, alergias: { nada: "None", gluten: "Gluten", lactosa: "Dairy", nueces: "Nuts", mariscos: "Shellfish", otro: "Other (see considerations)" }, nivelPicante: { suave: "Mild", medio: "Medium", picante: "Spicy", muyPicante: "Very Spicy" } },
    placeholders: { consideraciones: "Write any additional considerations here..." },
    buttons: { submit: "Create Menu", loading: "Creating Menu..." },
    results: { recommendationsTitle: "Recommendations:" },
    errors: { requiredFields: "Please complete all required options (Type of Food, Price, Spice Level).", requiredAlergias: "Please select at least one option for Allergies (can be \"None\").", fetchErrorPrefix: "Error: ", defaultFetchError: "Sorry, an error occurred while generating recommendations." }
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
    menuRapido: "🍔 Menú rápido"
  },
  English: {
    carta: "📖 Menu",
    chat: "💬 Chat",
    menuRapido: "🍔 Quick Menu"
  }
};

// Chat suggestions
export const chatSuggestions = {
  Español: [
    'dame opciones veganas',
    '¿cuáles son los platos más populares?',
    '¿qué postres tienen?',
    'recomiéndame algo ligero',
  ],
  English: [
    'give me vegan options',
    'what are the most popular dishes?',
    'what desserts do you have?',
    'recommend something light',
  ],
};