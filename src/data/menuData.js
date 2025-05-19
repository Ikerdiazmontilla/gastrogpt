// <file path="gastrogpts/src/data/menuData.js">
// src/data/menuData.js

// Raw menu data structure
export const menuData = {
  entrantes: [
    {
      id: 1,
      nombre: { es: "Croquetas de Jamón", en: "Ham Croquettes" },
      descripcionCorta: { es: "Deliciosas croquetas caseras de jamón ibérico...", en: "Delicious homemade Iberian ham croquettes..." },
      descripcionLarga: { es: "Deliciosas croquetas caseras de jamón ibérico con bechamel cremosa, servidas con un toque de perejil fresco.", en: "Delicious homemade Iberian ham croquettes with creamy béchamel, served with a touch of fresh parsley." },
      precio: 8.50,
      imagen: "/assets/croquetas.jpg",
      alergenos: ["gluten", "lactosa"],
      etiquetas: ["popular"],
      pairsWith: { main: 4 } // Pairs with Paella de Mariscos (ID 4)
    },
    // ... other entrantes
    {
      id: 2,
      nombre: { es: "Ensalada César", en: "Caesar Salad" },
      descripcionCorta: { es: "Lechuga romana, pollo a la parrilla, crutones...", en: "Romaine lettuce, grilled chicken, croutons..." },
      descripcionLarga: { es: "Clásica ensalada César con lechuga romana fresca, pollo a la parrilla jugoso, crutones caseros, lascas de queso parmesano y nuestro aderezo César especial.", en: "Classic Caesar salad with fresh romaine lettuce, juicy grilled chicken, homemade croutons, Parmesan cheese shavings, and our special Caesar dressing." },
      precio: 9.75,
      imagen: "/assets/ensalada-cesar.jpg",
      alergenos: ["gluten", "lactosa", "huevo", "pescado"],
      etiquetas: [],
      pairsWith: { main: 5 } // Pairs with Solomillo al Whisky (ID 5)
    },
    {
      id: 3,
      nombre: { es: "Gazpacho Andaluz", en: "Andalusian Gazpacho" },
      descripcionCorta: { es: "Sopa fría tradicional de tomate, pepino...", en: "Traditional cold soup of tomato, cucumber..." },
      descripcionLarga: { es: "Refrescante gazpacho andaluz, una sopa fría elaborada con tomates maduros, pepino, pimiento, ajo, aceite de oliva virgen extra y un toque de vinagre de Jerez.", en: "Refreshing Andalusian gazpacho, a cold soup made with ripe tomatoes, cucumber, pepper, garlic, extra virgin olive oil, and a touch of Sherry vinegar." },
      precio: 6.50,
      imagen: "/assets/gazpacho.jpg",
      alergenos: [],
      etiquetas: ["vegano", "sin_gluten"],
      pairsWith: { main: 6 } // Pairs with Risotto de Setas (ID 6)
    },
  ],
  principales: [
    {
      id: 4,
      nombre: { es: "Paella de Mariscos", en: "Seafood Paella" },
      descripcionCorta: { es: "Arroz con azafrán, calamares, gambas...", en: "Rice with saffron, squid, prawns..." },
      descripcionLarga: { es: "Auténtica paella de mariscos con arroz bomba, azafrán, calamares tiernos, gambas frescas, mejillones y almejas, cocinada lentamente en su caldo. Toque picante opcional.", en: "Authentic seafood paella with bomba rice, saffron, tender squid, fresh prawns, mussels, and clams, slowly cooked in its broth. Optional spicy touch." },
      precio: 18.50,
      imagen: "/assets/paella-marisco.jpg",
      alergenos: ["mariscos", "crustaceos", "moluscos"],
      etiquetas: ["popular", "recomendado", "picante_suave"],
      pairsWith: { drink: 11, dessert: 9 } // Drink: Sangría Casera (11), Dessert: Sorbete de Limón al Cava (9)
    },
    // ... other principales
    {
      id: 5,
      nombre: { es: "Solomillo al Whisky", en: "Whiskey Sirloin Steak" },
      descripcionCorta: { es: "Solomillo de ternera con salsa de whisky...", en: "Beef sirloin with whiskey sauce..." },
      descripcionLarga: { es: "Tierno solomillo de ternera nacional, marcado a la plancha y terminado con una suave y aromática salsa al whisky, acompañado de patatas panaderas y pimientos de padrón.", en: "Tender national beef sirloin, grilled and finished with a smooth and aromatic whiskey sauce, accompanied by baker potatoes and Padrón peppers." },
      precio: 22.00,
      imagen: "/assets/solomillo-al-whisky.jpg",
      alergenos: ["gluten"],
      etiquetas: ["recomendado"],
      pairsWith: { drink: 10, dessert: 7 } // Drink: Vino Tinto Rioja Crianza (10), Dessert: Tarta de Queso (7)
    },
    {
      id: 6,
      nombre: { es: "Risotto de Setas", en: "Mushroom Risotto" },
      descripcionCorta: { es: "Arroz cremoso con variedad de setas...", en: "Creamy rice with a variety of mushrooms..." },
      descripcionLarga: { es: "Risotto cremoso Arborio con una selección de setas silvestres de temporada (boletus, níscalos, champiñones portobello), mantecado con parmesano y un toque de trufa.", en: "Creamy Arborio risotto with a selection of seasonal wild mushrooms (boletus, chanterelles, portobello mushrooms), creamed with Parmesan and a touch of truffle." },
      precio: 14.50,
      imagen: "/assets/rissotto-setas.jpg",
      alergenos: ["lactosa"],
      etiquetas: ["vegetariano"],
      pairsWith: { drink: 12, dessert: 8 } // Drink: Agua Mineral Natural (12), Dessert: Crema Catalana (8)
    },
  ],
  postres: [
    {
      id: 7,
      nombre: { es: "Tarta de Queso", en: "Cheesecake" },
      descripcionCorta: { es: "Tarta cremosa de queso con base de galleta...", en: "Creamy cheesecake with a cookie base..." },
      descripcionLarga: { es: "Irresistible tarta de queso horneada al estilo neoyorquino, con una base crujiente de galleta y un suave coulis de frutos rojos casero.", en: "Irresistible New York-style baked cheesecake with a crispy cookie base and a smooth homemade red berry coulis." },
      precio: 6.50,
      imagen: "/assets/tarta-queso.jpg",
      alergenos: ["gluten", "lactosa", "huevo"],
      etiquetas: ["popular"],
      // Desserts are paired with by main dishes, they don't initiate a "pairsWith" currently.
    },
    // ... other postres
    {
      id: 8,
      nombre: { es: "Crema Catalana", en: "Catalan Cream" },
      descripcionCorta: { es: "Postre tradicional catalán con crema suave...", en: "Traditional Catalan dessert with smooth cream..." },
      descripcionLarga: { es: "Clásica crema catalana con una textura suave y delicada, aromatizada con limón y canela, y cubierta con una fina capa de azúcar caramelizado crujiente.", en: "Classic Catalan cream with a smooth and delicate texture, flavored with lemon and cinnamon, and covered with a thin layer of crispy caramelized sugar." },
      precio: 5.75,
      imagen: "/assets/crema-catalana.jpg",
      alergenos: ["lactosa", "huevo"],
      etiquetas: [],
    },
    {
      id: 9,
      nombre: { es: "Sorbete de Limón al Cava", en: "Lemon Sorbet with Cava" },
      descripcionCorta: { es: "Refrescante sorbete de limón con un toque de cava...", en: "Refreshing lemon sorbet with a touch of cava..." },
      descripcionLarga: { es: "Ligero y digestivo sorbete de limón natural, elaborado artesanalmente y terminado con un toque espumoso de cava brut nature.", en: "Light and digestive natural lemon sorbet, handcrafted and finished with a sparkling touch of brut nature cava." },
      precio: 4.50,
      imagen: "/assets/sorbete-limon.jpg",
      alergenos: [],
      etiquetas: ["vegano", "sin_gluten"],
    },
  ],
  bebidas: [
    {
      id: 10,
      nombre: { es: "Vino Tinto Rioja Crianza", en: "Rioja Crianza Red Wine" },
      descripcionCorta: { es: "Vino tinto D.O.Ca. Rioja, crianza...", en: "Red wine D.O.Ca. Rioja, crianza..." },
      descripcionLarga: { es: "Vino tinto de la Denominación de Origen Calificada Rioja, elaborado con uvas Tempranillo y Graciano, con una crianza de 12 meses en barrica de roble americano.", en: "Red wine from the Rioja Qualified Designation of Origin, made with Tempranillo and Graciano grapes, aged for 12 months in American oak barrels." },
      precio: 18.00,
      imagen: "/assets/vino-tinto.jpg",
      alergenos: ["sulfitos"],
      etiquetas: ["recomendado"],
      pairsWith: { main: 5 } // Pairs with Solomillo al Whisky (ID 5)
    },
    // ... other bebidas
     {
      id: 11,
      nombre: { es: "Sangría Casera", en: "Homemade Sangria" },
      descripcionCorta: { es: "Refrescante sangría con vino tinto, frutas...", en: "Refreshing sangria with red wine, fruits..." },
      descripcionLarga: { es: "Nuestra sangría especial, preparada al momento con vino tinto de calidad, una selección de frutas frescas de temporada, un toque de licor y canela.", en: "Our special sangria, prepared on the spot with quality red wine, a selection of fresh seasonal fruits, a touch of liquor, and cinnamon." },
      precio: 12.50,
      imagen: "/assets/sangria.jpg",
      alergenos: ["sulfitos"],
      etiquetas: ["popular"],
      pairsWith: { main: 4 } // Pairs with Paella de Mariscos (ID 4)
    },
    {
      id: 12,
      nombre: { es: "Agua Mineral Natural", en: "Natural Mineral Water" },
      descripcionCorta: { es: "Agua mineral natural de manantial.", en: "Natural spring mineral water." },
      descripcionLarga: { es: "Agua mineral natural de mineralización débil, proveniente de manantial protegido. Servida fría.", en: "Natural mineral water with low mineralization, from a protected spring. Served cold." },
      precio: 2.00,
      imagen: "/assets/agua-mineral.jpg",
      alergenos: [],
      etiquetas: [],
      pairsWith: { main: 6 } // Pairs with Risotto de Setas (ID 6)
    },
  ],
};

// Definitions for allergens
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

// Definitions for tags/labels
export const etiquetasDetails = {
  popular: { label: "Popular", label_en: "Popular", icon: "⭐" },
  recomendado: { label: "Recomendado", label_en: "Recommended", icon: "👨‍🍳" },
  vegano: { label: "Vegano", label_en: "Vegan", icon: "🌿" },
  vegetariano: { label: "Vegetariano", label_en: "Vegetarian", icon: "🥕" },
  sin_gluten: { label: "Sin Gluten", label_en: "Gluten-Free" },
  picante_suave: { label: "Picante Suave", label_en: "Mild Spicy", icon: "🌶️" },
  // Add more spicy levels if needed
};

// Helper functions (getTranslatedDishText, getAlergenoIcon, etc.) have been moved to src/utils/menuUtils.js
// findDishById has also been moved to src/utils/menuUtils.js