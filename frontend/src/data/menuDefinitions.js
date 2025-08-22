// src/data/menuDefinitions.js

// Definiciones para alérgenos
export const alergenosDetails = {
  gluten: { icon: "🌾", nombre: "Gluten", nombre_en: "Gluten", nombre_fr: "Gluten", nombre_de: "Gluten" },
  lactosa: { icon: "🥛", nombre: "Lactosa", nombre_en: "Dairy", nombre_fr: "Lactose", nombre_de: "Laktose" },
  huevo: { icon: "🥚", nombre: "Huevo", nombre_en: "Egg", nombre_fr: "Œuf", nombre_de: "Ei" },
  pescado: { icon: "🐟", nombre: "Pescado", nombre_en: "Fish", nombre_fr: "Poisson", nombre_de: "Fisch" },
  marisco: { icon: "🦐", nombre: "Mariscos", nombre_en: "Shellfish", nombre_fr: "Fruits de mer", nombre_de: "Schalentiere" },
  crustaceos: { icon: "🦞", nombre: "Crustáceos", nombre_en: "Crustaceans", nombre_fr: "Crustacés", nombre_de: "Krebstiere" },
  moluscos: { icon: "🐚", nombre: "Moluscos", nombre_en: "Mollusks", nombre_fr: "Mollusques", nombre_de: "Weichtiere" },
  frutos_secos: { icon: "🥜", nombre: "Frutos Secos", nombre_en: "Nuts", nombre_fr: "Fruits à coque", nombre_de: "Nüsse" },
  soja: { icon: "🫘", nombre: "Soja", nombre_en: "Soy", nombre_fr: "Soja", nombre_de: "Soja" },
  sulfitos: { icon: "🧪", nombre: "Sulfitos", nombre_en: "Sulfites", nombre_fr: "Sulfites", nombre_de: "Sulfite" },
  ajo: { icon: "🧄", nombre: "Ajo", nombre_en: "Garlic", nombre_fr: "Ail", nombre_de: "Knoblauch" },
  mostaza: { icon: "🌭", nombre: "Mostaza", nombre_en: "Mustard", nombre_fr: "Moutarde", nombre_de: "Senf" },
  sésamo: { icon: "🌱", nombre: "Sésamo", nombre_en: "Sesame", nombre_fr: "Sésame", nombre_de: "Sesam" },
  apio: { icon: "🌿", nombre: "Apio", nombre_en: "Celery", nombre_fr: "Céleri", nombre_de: "Sellerie" },
  default: { icon: "ℹ️", nombre: "Otro", nombre_en: "Other", nombre_fr: "Autre", nombre_de: "Andere" },
};

// Definiciones para etiquetas/tags
export const etiquetasDetails = {
  popular: { label: "Popular", label_en: "Popular", icon: "⭐" },
  recomendado: { label: "Recomendado", label_en: "Recommended", icon: "👨‍🍳" },
  vegano: { label: "Vegano", label_en: "Vegan", icon: "🌿" },
  vegetariano: { label: "Vegetariano", label_en: "Vegetarian", icon: "🥕" },
  sin_gluten: { label: "Sin Gluten", label_en: "Gluten-Free" },
  picante: { label: "Picante", label_en: "Spicy", icon: "🌶️" },
  gourmet: { label: "Gourmet", label_en: "Gourmet", icon: "✨" },
  "ideal para compartir": { label: "Ideal para compartir", label_en: "Ideal for sharing", icon: "🧑‍🤝‍🧑" },
  "temporada": { label: "Temporada", label_en: "Seasonal", icon: "📅" },
  "especialidad de la casa": { label: "Especialidad de la casa", label_en: "House Specialty", icon: "🏆" },
  nuevo: { label: "Nuevo", label_en: "New", icon: "🎉" },
  económico: { label: "Económico", label_en: "Budget-friendly", icon: "💰" },
};