// ===================================================================
// ==      CONFIGURACIÓN PARA EL RESTAURANTE: Asador La Taurina     ==
// ===================================================================
//
// Este archivo sirve como registro permanente de la configuración
// inicial de este inquilino.
//
// ===================================================================

module.exports = {
  // --- Información Básica del Inquilino ---
  subdomain: 'la_taurina',
  restaurantName: 'Asador La Taurina',

  // --- Configuración de Theming y Estilo ---
  theme: {
    logoUrl: '/logos/la-taurina.png', // Deberás crear y subir este logo a frontend/public/logos/
    menuHasImages: false, // CLAVE: No se mostrarán imágenes en el menú.
    borderRadiusPx: 4,    // Un borde más definido, menos redondeado, para un estilo más tradicional.
    colors: {
      // Paleta de colores basada en rojos intensos, maderas y tonos tierra.
      accent: '#C0392B',              // Rojo taurino, para botones y elementos destacados.
      accentText: '#ffffff',           // Texto blanco para buen contraste sobre el rojo.
      pageBackground: '#fdfaf6',       // Un fondo muy ligero, color pergamino o hueso.
      surfaceBackground: '#ffffff',    // Blanco puro para tarjetas y modales, para máxima legibilidad.
      textPrimary: '#2c2c2c',           // Un negro suave, para no ser demasiado duro.
      textSecondary: '#6b6b6b',         // Gris para descripciones y texto menos importante.
      border: '#dcdcdc',              // Un borde neutro y claro.
      chat: {
        userBubbleBackground: '#EAEAEA', // Un gris neutro para el usuario.
        botBubbleBackground: '#FADBD8',  // Un rojo muy pálido para el bot, a juego con el acento.
      }
    }
  },

  // --- Configuración del Chatbot y la UI ---
  chatConfig: {
    welcomeMessage: {
      es: "### 🇪🇸 **Bienvenido al Asador La Taurina.**\nDonde la tradición y la brasa se encuentran. ¿Listo para una experiencia auténtica?",
      en: "### 🇬🇧 **Welcome to Asador La Taurina.**\nWhere tradition meets the grill. Ready for an authentic experience?",
      fr: "### 🇫🇷 **Bienvenue à l'Asador La Taurina.**\nOù la tradition rencontre le gril. Prêt pour une expérience authentique?",
      de: "### 🇩🇪 **Willkommen im Asador La Taurina.**\nWo Tradition auf den Grill trifft. Bereit für ein authentisches Erlebnis?",
    },
    suggestionChips: {
      es: ["Nuestras carnes", "Vinos de la Ribera", "Entrantes para compartir", "El plato del día"],
      en: ["Our meats", "Ribera wines", "Starters to share", "Dish of the day"],
      fr: ["Nos viandes", "Vins de Ribera", "Entrées à partager", "Plat du jour"],
      de: ["Unsere Fleischgerichte", "Ribera-Weine", "Vorspeisen zum Teilen", "Tagesgericht"],
    },
    suggestionChipsCount: 4,
  },

  // --- Configuración del Modelo de Lenguaje (LLM) ---
  llm: {
    instructions: "Eres el asistente del 'Asador La Taurina', un restaurante de cocina tradicional castellana. Tu especialidad y orgullo son las carnes a la brasa. Tu tono es directo, experto y respetuoso, con un toque castizo. Guía al cliente hacia las mejores piezas de carne y los vinos que mejor maridan.",
    firstMessage: "Bienvenido al Asador La Taurina. ¿Le sirvo algo de beber para empezar?",
  },

  // --- Menú Completo del Restaurante (sin propiedad 'imagen') ---
  menu: {
    entrantes: [
      { id: 1, nombre: { es: "Morcilla de Burgos a la Brasa", en: "Grilled Morcilla de Burgos" }, descripcionCorta: {es: "Auténtica morcilla de arroz, crujiente por fuera y jugosa por dentro.", en: "Authentic rice black pudding, crispy on the outside, juicy on the inside."}, precio: 12.00, alergenos: [], etiquetas: ["popular"] },
      { id: 2, nombre: { es: "Chorizo Criollo a la Parrilla", en: "Grilled Chorizo Criollo" }, descripcionCorta: {es: "Dos piezas de chorizo criollo con nuestro chimichurri casero.", en: "Two pieces of criollo sausage with our homemade chimichurri."}, precio: 9.50, alergenos: [], etiquetas: [] },
      { id: 3, nombre: { es: "Provoleta al Horno de Leña", en: "Wood-Fired Provoleta" }, descripcionCorta: {es: "Queso provolone fundido con orégano, tomate y un toque de aceite de oliva.", en: "Melted provolone cheese with oregano, tomato, and a splash of olive oil."}, precio: 13.50, alergenos: ["lactosa"], etiquetas: ["vegetariano"] },
      { id: 4, nombre: { es: "Jamón Ibérico de Bellota", en: "Acorn-Fed Iberian Ham" }, descripcionCorta: {es: "Ración de 100g de jamón de la más alta calidad, cortado a cuchillo.", en: "100g serving of the highest quality ham, hand-carved."}, precio: 28.00, alergenos: [], etiquetas: ["recomendado"] }
    ],
    principales: [
       { id: 5, nombre: { es: "Chuletón de Vaca Vieja (1kg)", en: "Aged Beef T-Bone Steak (1kg)" }, descripcionCorta: {es: "Para compartir. Madurado 45 días para una textura y sabor inigualables.", en: "To share. Dry-aged for 45 days for unbeatable flavor and texture."}, precio: 65.00, alergenos: [], etiquetas: ["recomendado", "popular"] },
       { id: 6, nombre: { es: "Entrecot de Lomo Alto", en: "Ribeye Steak" }, descripcionCorta: {es: "350g de lomo alto de ternera, marcado a la brasa a su gusto.", en: "350g of prime beef ribeye, grilled to your liking."}, precio: 26.00, alergenos: [], etiquetas: [] },
       { id: 7, nombre: { es: "Secreto Ibérico a la Brasa", en: "Grilled Iberian 'Secreto' Pork" }, descripcionCorta: {es: "Corte de cerdo ibérico excepcionalmente jugoso y sabroso.", en: "An exceptionally juicy and flavorful cut of Iberian pork."}, precio: 22.50, alergenos: [], etiquetas: ["popular"] },
       { id: 8, nombre: { es: "Costillar de Cordero Lechal", en: "Suckling Lamb Ribs" }, descripcionCorta: {es: "Costillas de cordero lechal, doradas y crujientes.", en: "Suckling lamb ribs, golden and crispy."}, precio: 24.00, alergenos: [], etiquetas: [] }
    ],
    postres: [
      { id: 9, nombre: { es: "Tarta de Queso Cremosa", en: "Creamy Cheesecake" }, descripcionCorta: {es: "Nuestra famosa tarta de queso horneada, con base de galleta.", en: "Our famous baked cheesecake with a cookie crust."}, precio: 7.50, alergenos: ["lactosa", "gluten", "huevo"], etiquetas: ["popular"] },
      { id: 10, nombre: { es: "Flan de Huevo Casero", en: "Homemade Egg Flan" }, descripcionCorta: {es: "El flan tradicional, con caramelo líquido.", en: "The traditional flan, with liquid caramel."}, precio: 6.00, alergenos: ["lactosa", "huevo"], etiquetas: [] }
    ],
    bebidas: [
      { id: 11, nombre: { es: "Vino Tinto Ribera del Duero (Crianza)", en: "Ribera del Duero Red Wine (Crianza)" }, descripcionCorta: {es: "Botella. El maridaje perfecto para nuestras carnes.", en: "Bottle. The perfect pairing for our meats."}, precio: 25.00, alergenos: ["sulfitos"], etiquetas: ["recomendado"] },
      { id: 12, nombre: { es: "Copa de Vino de la Casa", en: "Glass of House Wine" }, descripcionCorta: {es: "Tinto o blanco, seleccionado por nosotros.", en: "Red or white, selected by us."}, precio: 4.50, alergenos: ["sulfitos"], etiquetas: [] }
    ]
  },
};