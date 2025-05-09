// src/data/menuData.js
export const menuData = {
  entrantes: [
    {
      id: 1,
      nombre: "Croquetas de Jamón",
      descripcionCorta: "Deliciosas croquetas caseras de jamón ibérico...",
      descripcionLarga: "Deliciosas croquetas caseras de jamón ibérico con bechamel cremosa, servidas con un toque de perejil fresco.",
      precio: 8.50,
      imagen: "https://via.placeholder.com/300x200.png?text=Croquetas",
      alergenos: ["gluten", "lactosa"],
      etiquetas: ["popular"],
    },
    {
      id: 2,
      nombre: "Ensalada César",
      descripcionCorta: "Lechuga romana, pollo a la parrilla, crutones...",
      descripcionLarga: "Clásica ensalada César con lechuga romana fresca, pollo a la parrilla jugoso, crutones caseros, lascas de queso parmesano y nuestro aderezo César especial.",
      precio: 9.75,
      imagen: "https://via.placeholder.com/300x200.png?text=Ensalada+Cesar",
      alergenos: ["gluten", "lactosa", "huevo", "pescado"], // Pescado por anchoas en aderezo César
      etiquetas: [],
    },
    {
      id: 3,
      nombre: "Gazpacho Andaluz",
      descripcionCorta: "Sopa fría tradicional de tomate, pepino...",
      descripcionLarga: "Refrescante gazpacho andaluz, una sopa fría elaborada con tomates maduros, pepino, pimiento, ajo, aceite de oliva virgen extra y un toque de vinagre de Jerez.",
      precio: 6.50,
      imagen: "https://via.placeholder.com/300x200.png?text=Gazpacho",
      alergenos: [],
      etiquetas: ["vegano", "sin_gluten"],
    },
  ],
  principales: [
    {
      id: 4,
      nombre: "Paella de Mariscos",
      descripcionCorta: "Arroz con azafrán, calamares, gambas...",
      descripcionLarga: "Auténtica paella de mariscos con arroz bomba, azafrán, calamares tiernos, gambas frescas, mejillones y almejas, cocinada lentamente en su caldo.",
      precio: 18.50,
      imagen: "https://via.placeholder.com/300x200.png?text=Paella",
      alergenos: ["mariscos", "crustaceos", "moluscos"],
      etiquetas: ["popular", "recomendado"],
    },
    {
      id: 5,
      nombre: "Solomillo al Whisky",
      descripcionCorta: "Solomillo de ternera con salsa de whisky...",
      descripcionLarga: "Tierno solomillo de ternera nacional, marcado a la plancha y terminado con una suave y aromática salsa al whisky, acompañado de patatas panaderas y pimientos de padrón.",
      precio: 22.00,
      imagen: "https://via.placeholder.com/300x200.png?text=Solomillo",
      alergenos: ["gluten"], // Por harina en la salsa o whisky
      etiquetas: ["recomendado"],
    },
    {
      id: 6,
      nombre: "Risotto de Setas",
      descripcionCorta: "Arroz cremoso con variedad de setas...",
      descripcionLarga: "Risotto cremoso Arborio con una selección de setas silvestres de temporada (boletus, níscalos, champiñones portobello), mantecado con parmesano y un toque de trufa.",
      precio: 14.50,
      imagen: "https://via.placeholder.com/300x200.png?text=Risotto",
      alergenos: ["lactosa"],
      etiquetas: ["vegetariano"],
    },
  ],
  postres: [
    {
      id: 7,
      nombre: "Tarta de Queso",
      descripcionCorta: "Tarta cremosa de queso con base de galleta...",
      descripcionLarga: "Irresistible tarta de queso horneada al estilo neoyorquino, con una base crujiente de galleta y un suave coulis de frutos rojos casero.",
      precio: 6.50,
      imagen: "https://via.placeholder.com/300x200.png?text=Tarta+Queso",
      alergenos: ["gluten", "lactosa", "huevo"],
      etiquetas: ["popular"],
    },
    {
      id: 8,
      nombre: "Crema Catalana",
      descripcionCorta: "Postre tradicional catalán con crema suave...",
      descripcionLarga: "Clásica crema catalana con una textura suave y delicada, aromatizada con limón y canela, y cubierta con una fina capa de azúcar caramelizado crujiente.",
      precio: 5.75,
      imagen: "https://via.placeholder.com/300x200.png?text=Crema+Catalana",
      alergenos: ["lactosa", "huevo"],
      etiquetas: [],
    },
    {
      id: 9,
      nombre: "Sorbete de Limón al Cava",
      descripcionCorta: "Refrescante sorbete de limón con un toque de cava...",
      descripcionLarga: "Ligero y digestivo sorbete de limón natural, elaborado artesanalmente y terminado con un toque espumoso de cava brut nature.",
      precio: 4.50,
      imagen: "https://via.placeholder.com/300x200.png?text=Sorbete",
      alergenos: [],
      etiquetas: ["vegano", "sin_gluten"],
    },
  ],
  bebidas: [
    {
      id: 10,
      nombre: "Vino Tinto Rioja Crianza",
      descripcionCorta: "Vino tinto D.O.Ca. Rioja, crianza...",
      descripcionLarga: "Vino tinto de la Denominación de Origen Calificada Rioja, elaborado con uvas Tempranillo y Graciano, con una crianza de 12 meses en barrica de roble americano.",
      precio: 18.00,
      imagen: "https://via.placeholder.com/300x200.png?text=Vino+Tinto",
      alergenos: ["sulfitos"],
      etiquetas: ["recomendado"],
    },
    {
      id: 11,
      nombre: "Sangría Casera",
      descripcionCorta: "Refrescante sangría con vino tinto, frutas...",
      descripcionLarga: "Nuestra sangría especial, preparada al momento con vino tinto de calidad, una selección de frutas frescas de temporada, un toque de licor y canela.",
      precio: 12.50,
      imagen: "https://via.placeholder.com/300x200.png?text=Sangria",
      alergenos: ["sulfitos"],
      etiquetas: ["popular"],
    },
    {
      id: 12,
      nombre: "Agua Mineral Natural",
      descripcionCorta: "Agua mineral natural de manantial.",
      descripcionLarga: "Agua mineral natural de mineralización débil, proveniente de manantial protegido. Servida fría.",
      precio: 2.00,
      imagen: "https://via.placeholder.com/300x200.png?text=Agua",
      alergenos: [],
      etiquetas: [],
    },
  ],
};

export const alergenosDetails = {
  gluten: { icon: "🌾", nombre: "Gluten" },
  lactosa: { icon: "🥛", nombre: "Lactosa" },
  huevo: { icon: "🥚", nombre: "Huevo" },
  pescado: { icon: "🐟", nombre: "Pescado" },
  mariscos: { icon: "🦐", nombre: "Mariscos" }, // Genérico
  crustaceos: { icon: "🦞", nombre: "Crustáceos" }, // Específico
  moluscos: { icon: "🐚", nombre: "Moluscos" }, // Específico
  frutos_secos: { icon: "🥜", nombre: "Frutos Secos" },
  soja: { icon: "🫘", nombre: "Soja" },
  sulfitos: { icon: "🧪", nombre: "Sulfitos" }, // Icono de ejemplo
  default: { icon: "⚠️", nombre: "Otro" },
};

export const etiquetasDetails = {
  popular: { label: "Popular", label_en: "Popular" },
  recomendado: { label: "Recomendado", label_en: "Recommended" },
  vegano: { label: "Vegano", label_en: "Vegan" },
  vegetariano: { label: "Vegetariano", label_en: "Vegetarian" },
  sin_gluten: { label: "Sin Gluten", label_en: "Gluten-Free" },
};

export const getAlergenoIcon = (alergenoKey) => {
  return alergenosDetails[alergenoKey]?.icon || alergenosDetails.default.icon;
};

export const getAlergenoNombre = (alergenoKey, lang = 'Español') => {
  // For now, names are only in Spanish as per data structure
  return alergenosDetails[alergenoKey]?.nombre || alergenosDetails.default.nombre;
};

export const getEtiquetaLabel = (etiquetaKey, lang = 'Español') => {
  const detail = etiquetasDetails[etiquetaKey];
  if (!detail) return etiquetaKey;
  return lang === 'English' ? detail.label_en : detail.label;
};

// This function will map an etiqueta to a CSS module class name
export const getEtiquetaClass = (etiquetaKey, styles) => {
  switch (etiquetaKey) {
    case "popular":
      return styles.tagPopular;
    case "recomendado":
      return styles.tagRecomendado;
    case "vegano":
      return styles.tagVegano;
    case "vegetariano":
      return styles.tagVegetariano;
    case "sin_gluten":
      return styles.tagSinGluten;
    default:
      return styles.tagDefault;
  }
};