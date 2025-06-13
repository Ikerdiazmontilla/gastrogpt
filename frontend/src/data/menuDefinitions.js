// src/data/menuDefinitions.js

// Definiciones para alérgenos
export const alergenosDetails = {
  gluten: { icon: "🌾", nombre: "Gluten", nombre_en: "Gluten" },
  lactosa: { icon: "🥛", nombre: "Lactosa", nombre_en: "Dairy" },
  huevo: { icon: "🥚", nombre: "Huevo", nombre_en: "Egg" },
  pescado: { icon: "🐟", nombre: "Pescado", nombre_en: "Fish" },
  marisco: { icon: "🦐", nombre: "Mariscos", nombre_en: "Shellfish" },
  crustaceos: { icon: "🦞", nombre: "Crustáceos", nombre_en: "Crustaceans" },
  moluscos: { icon: "🐚", nombre: "Moluscos", nombre_en: "Mollusks" },
  frutos_secos: { icon: "🥜", nombre: "Frutos Secos", nombre_en: "Nuts" },
  soja: { icon: "🫘", nombre: "Soja", nombre_en: "Soy" },
  sulfitos: { icon: "🧪", nombre: "Sulfitos", nombre_en: "Sulfites" },
  ajo: { icon: "🧄", nombre: "Ajo", nombre_en: "Garlic" },
  mostaza: { icon: "🌭", nombre: "Mostaza", nombre_en: "Mustard" },
  sésamo: { icon: "🌱", nombre: "Sésamo", nombre_en: "Sesame" },
  apio: { icon: "🌿", nombre: "Apio", nombre_en: "Celery" },
  // CORRECCIÓN: Se usa el emoji 'ℹ️' como icono por defecto.
  default: { icon: "ℹ️", nombre: "Otro", nombre_en: "Other" },
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