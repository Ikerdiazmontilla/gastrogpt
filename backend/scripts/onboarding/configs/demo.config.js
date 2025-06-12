// ===================================================================
// ==      CONFIGURACIÓN PARA EL RESTAURANTE: La Cuchara de Oro     ==
// ===================================================================
//
// Este archivo sirve como registro permanente de la configuración
// inicial de este inquilino.
//
// ===================================================================

module.exports = {
  // --- Información Básica del Inquilino ---
  subdomain: 'cuchara-oro',
  restaurantName: 'La Cuchara de Oro',

  // --- Configuración de Theming y Estilo ---
  theme: {
    logoUrl: '/logos/cuchara-oro.png',
    menuHasImages: true,
    borderRadiusPx: 8,
    colors: {
      accent: '#c0a062',
      accentText: '#ffffff',
      pageBackground: '#f9f6f2',
      surfaceBackground: '#ffffff',
      textPrimary: '#3d3d3d',
      textSecondary: '#7a7a7a',
      border: '#e0e0e0',
      chat: {
        userBubbleBackground: '#f0e9dd',
        botBubbleBackground: '#e3e3e3',
      }
    }
  },

  // --- Configuración del Chatbot y la UI ---
  chatConfig: {
    welcomeMessage: {
      es: "### 🇪🇸 **¡Bienvenido a La Cuchara de Oro!**\nEstoy aquí para ayudarte a explorar nuestro menú.",
      en: "### 🇬🇧 **Welcome to La Cuchara de Oro!**\nI'm here to help you explore our menu.",
      fr: "### 🇫🇷 **Bienvenue à La Cuchara de Oro!**\nJe suis là pour vous aider à explorer notre menu.",
      de: "### 🇩🇪 **Willkommen bei La Cuchara de Oro!**\nIch bin hier, um Ihnen bei der Erkundung unserer Speisekarte zu helfen.",
    },
    suggestionChips: {
      es: ["Ver los especiales", "Vinos por copa", "Postres caseros", "Opciones sin gluten"],
      en: ["See the specials", "Wines by the glass", "Homemade desserts", "Gluten-free options"],
      fr: ["Voir les spéciaux", "Vins au verre", "Desserts maison", "Options sans gluten"],
      de: ["Sonderangebote ansehen", "Weine im Glas", "Hausgemachte Desserts", "Glutenfreie Optionen"],
    },
    suggestionChipsCount: 4,
  },

  // --- Configuración del Modelo de Lenguaje (LLM) ---
  llm: {
    instructions: "Eres un asistente para el restaurante de lujo 'La Cuchara de Oro'. Tu tono es elegante y servicial...",
    firstMessage: "Buenas tardes, bienvenido a La Cuchara de Oro. ¿En qué puedo asistirle?",
  },

  // --- Menú Completo del Restaurante ---
  menu: {
    entrantes: [
      { id: 1, nombre: { es: "Vieiras a la plancha", en: "Grilled Scallops" }, precio: 18.50, imagen: "/assets/vieiras.jpg", alergenos: ["moluscos"], etiquetas: ["recomendado"] }
    ],
    principales: [
       { id: 8, nombre: { es: "Solomillo al Foie", en: "Sirloin with Foie Gras" }, precio: 32.00, imagen: "/assets/solomillo.jpg", alergenos: ["lactosa"], etiquetas: ["popular"] }
    ],
    postres: [],
    bebidas: []
  },
};