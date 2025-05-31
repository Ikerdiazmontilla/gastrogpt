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
      etiquetas: ["recomendado"],
      pairsWith: { main: 5 }
    },
    {
      id: 2,
      nombre: { es: "Ensalada de Espinacas con Queso de Cabra", en: "Spinach Salad with Goat Cheese" },
      descripcionCorta: { es: "Espinacas frescas, queso de cabra, nueces caramelizadas...", en: "Fresh spinach, goat cheese, caramelized walnuts..." },
      descripcionLarga: { es: "Ensalada gourmet con espinacas baby, medallones de queso de cabra gratinado, nueces caramelizadas, manzana verde y vinagreta de miel y mostaza.", en: "Gourmet salad with baby spinach, grilled goat cheese medallions, caramelized walnuts, green apple, and honey mustard vinaigrette." },
      precio: 10.25,
      imagen: "/assets/ensalada-espinacas.jpg",
      alergenos: ["lactosa", "frutos_secos"],
      etiquetas: [ "vegetariano"],
      pairsWith: { main: 6 }
    },
    {
      id: 3,
      nombre: { es: "Gazpacho Andaluz", en: "Andalusian Gazpacho" },
      descripcionCorta: { es: "Sopa fría tradicional de tomate, pepino...", en: "Traditional cold soup of tomato, cucumber..." },
      descripcionLarga: { es: "Refrescante gazpacho andaluz, una sopa fría elaborada con tomates maduros, pepino, pimiento, ajo, aceite de oliva virgen extra y un toque de vinagre de Jerez.", en: "Refreshing Andalusian gazpacho, a cold soup made with ripe tomatoes, cucumber, pepper, garlic, extra virgin olive oil, and a touch of Sherry vinegar." },
      precio: 6.50,
      imagen: "/assets/gazpacho.jpg",
      alergenos: [],
      etiquetas: ["vegano", "popular", "sin_gluten",],
      pairsWith: { main: 7 }
    },
    {
      id: 4,
      nombre: { es: "Timbal de Mango, Aguacate y Queso Fresco", en: "Mango, Avocado & Fresh Cheese Timbale" },
      descripcionCorta: { es: "Entrante fresco con capas de mango, aguacate y queso.", en: "Fresh starter with layers of mango, avocado, and cheese." },
      descripcionLarga: { es: "Colorido timbal de mango maduro, aguacate cremoso, y queso fresco, aliñado con lima, cilantro y un toque de aceite de oliva virgen extra. Ligero y sabroso.", en: "Colorful stack of ripe mango, creamy avocado, and fresh cheese, dressed with lime, coriander, and a touch of extra virgin olive oil. Light and flavorful." },
      precio: 11.00,
      imagen: "/assets/timbal-mango.jpg",
      alergenos: ["lactosa"],
      etiquetas: [ "vegetariano"],
      pairsWith: { main: 5 }
    }
  ],
  principales: [
    {
      id: 8,
      nombre: { es: "Lasaña de Verduras", en: "Vegetable Lasagna" },
      descripcionCorta: { es: "Capas de pasta, verduras de temporada y bechamel vegana.", en: "Layers of pasta, seasonal vegetables, and vegan béchamel." },
      descripcionLarga: { es: "Deliciosa lasaña vegana con láminas de pasta fresca, rellena de una rica mezcla de verduras de temporada (calabacín, berenjena, pimientos, espinacas) y una cremosa bechamel a base de leche vegetal, gratinada con queso vegano.", en: "Delicious vegan lasagna with fresh pasta sheets, filled with a rich mix of seasonal vegetables (zucchini, eggplant, peppers, spinach) and a creamy plant-based milk béchamel, topped with melted vegan cheese." },
      precio: 15.00,
      imagen: "/assets/lasana-vegana.jpg",
      alergenos: ["gluten", "soja"],
      etiquetas: ["recomendado", "vegano"],
      pairsWith: { drink: 16, dessert: 13 }
    },
    {
      id: 6,
      nombre: { es: "Carrillera de Ternera al Vino Tinto", en: "Beef Cheeks in Red Wine" },
      descripcionCorta: { es: "Carrillera melosa al vino tinto con puré de boniato y zanahorias glaseadas.", en: "Tender beef cheeks in red wine with sweet potato purée and glazed carrots." },
      descripcionLarga: {
        es: "Carrillera de ternera cocinada a baja temperatura durante horas en una reducción de vino tinto con laurel y romero. Servida sobre un cremoso puré de boniato y acompañada de zanahorias baby glaseadas en mantequilla y miel.",
        en: "Beef cheeks slow-cooked for hours in a red wine reduction with bay leaf and rosemary. Served over creamy sweet potato purée and accompanied by butter and honey glazed baby carrots."
      },
      precio: 24.50,
      imagen: "/assets/carrillera-vino-tinto.jpeg",
      alergenos: ["lactosa"],
      etiquetas: ["popular"],
      pairsWith: { drink: 15, dessert: 10 }
    }    
    ,
    {
      id: 5,
      nombre: { es: "Dorada con Salsa de Chile Dulce", en: "Sea Bream with Sweet Chili Sauce" },
      descripcionCorta: { es: "Dorada al horno con crujiente de piel y salsa agridulce.", en: "Oven-baked sea bream with crispy skin and sweet chili glaze." },
      descripcionLarga: { es: "Dorada entera horneada con la piel crujiente, acompañada de una salsa de chile dulce casera con toques cítricos y jengibre, sobre base de verduras salteadas al wok.", en: "Whole oven-baked sea bream with crispy skin, served with a homemade sweet chili sauce featuring citrus and ginger notes, over stir-fried vegetables." },
      precio: 23.50,
      imagen: "/assets/dorada.jpg",
      alergenos: ["pescado", "soja"],
      etiquetas: [],
      pairsWith: { drink: 16, dessert: 12 }
    },
    {
      id: 7,
      nombre: { es: "Berenjena Asada con Labneh y Granada", en: "Roasted Eggplant with Labneh and Pomegranate" },
      descripcionCorta: { es: "Berenjena asada con crema de yogur, granada y pistacho.", en: "Roasted eggplant with yogurt cream, pomegranate and pistachio." },
      descripcionLarga: {
        es: "Berenjena asada lentamente hasta quedar melosa, servida sobre una base de labneh con limón, espolvoreada con pistachos tostados y granos de granada. Finalizada con aceite de oliva virgen extra y menta fresca.",
        en: "Slow-roasted eggplant until tender, served on a bed of lemony labneh, topped with toasted pistachios and pomegranate seeds. Finished with extra virgin olive oil and fresh mint."
      },
      precio: 16.50,
      imagen: "/assets/berenjena-asada.jpg",
      alergenos: ["lactosa", "frutos_secos"],
      etiquetas: ["vegetariano"],
      pairsWith: { drink: 17, dessert: 11 }
    }
  ],
  postres: [
    {
      id: 10,
      nombre: { es: "Tarta de Queso", en: "Cheesecake" },
      descripcionCorta: { es: "Tarta cremosa de queso con base de galleta...", en: "Creamy cheesecake with a cookie base..." },
      descripcionLarga: { es: "Irresistible tarta de queso horneada al estilo neoyorquino, con una base crujiente de galleta y un suave coulis de frutos rojos casero.", en: "Irresistible New York-style baked cheesecake with a crispy cookie base and a smooth homemade red berry coulis." },
      precio: 6.50,
      imagen: "/assets/tarta-queso.jpg",
      alergenos: ["gluten", "lactosa", "huevo"],
      etiquetas: ["popular"]
    },
    {
      id: 11,
      nombre: { es: "Crema Catalana", en: "Catalan Cream" },
      descripcionCorta: { es: "Postre tradicional catalán con crema suave...", en: "Traditional Catalan dessert with smooth cream..." },
      descripcionLarga: { es: "Clásica crema catalana con una textura suave y delicada, aromatizada con limón y canela, y cubierta con una fina capa de azúcar caramelizado crujiente.", en: "Classic Catalan cream with a smooth and delicate texture, flavored with lemon and cinnamon, and covered with a thin layer of crispy caramelized sugar." },
      precio: 5.75,
      imagen: "/assets/crema-catalana.jpg",
      alergenos: ["lactosa", "huevo"],
      etiquetas: []
    },
    {
      id: 12,
      nombre: { es: "Sorbete de Limón al Cava", en: "Lemon Sorbet with Cava" },
      descripcionCorta: { es: "Refrescante sorbete de limón con un toque de cava...", en: "Refreshing lemon sorbet with a touch of cava..." },
      descripcionLarga: { es: "Ligero y digestivo sorbete de limón natural, elaborado artesanalmente y terminado con un toque espumoso de cava brut nature.", en: "Light and digestive natural lemon sorbet, handcrafted and finished with a sparkling touch of brut nature cava." },
      precio: 4.50,
      imagen: "/assets/sorbete-limon.jpg",
      alergenos: [],
      etiquetas: ["vegano", "sin_gluten"]
    },
    {
      id: 13,
      nombre: { es: "Brownie con Helado", en: "Brownie with Ice Cream" },
      descripcionCorta: { es: "Brownie de chocolate vegano acompañado de helado de vainilla vegano.", en: "Vegan chocolate brownie served with vegan vanilla ice cream." },
      descripcionLarga: { es: "Intenso brownie de chocolate negro vegano, jugoso por dentro y con una ligera costra por fuera, acompañado de una bola de helado de vainilla cremoso a base de leche vegetal.", en: "Intense vegan dark chocolate brownie, moist on the inside with a slight crust on the outside, served with a scoop of creamy plant-based vanilla ice cream." },
      precio: 7.00,
      imagen: "/assets/brownie-con-helado.jpg",
      alergenos: ["gluten", "frutos_secos"],
      etiquetas: ["vegano"]
    }
  ],
  
  bebidas: [
    {
      id: 15,
      nombre: { es: "Vino Tinto Rioja Crianza", en: "Rioja Crianza Red Wine" },
      descripcionCorta: { es: "Vino tinto D.O.Ca. Rioja, crianza...", en: "Red wine D.O.Ca. Rioja, crianza..." },
      descripcionLarga: { es: "Vino tinto de la Denominación de Origen Calificada Rioja, elaborado con uvas Tempranillo y Graciano, con una crianza de 12 meses en barrica de roble americano.", en: "Red wine from the Rioja Qualified Designation of Origin, made with Tempranillo and Graciano grapes, aged for 12 months in American oak barrels." },
      precio: 18.00,
      imagen: "/assets/vino-tinto.jpg",
      alergenos: ["sulfitos"],
      etiquetas: ["recomendado"],
      pairsWith: { main: 6 }
    },
    {
      id: 19,
      nombre: { es: "Zumo Tropical de la Casa", en: "House Tropical Juice" },
      descripcionCorta: { es: "Zumo de frutas frescas sin alcohol.", en: "Fresh fruit juice, alcohol-free." },
      descripcionLarga: { es: "Refrescante mezcla de piña, mango, naranja y maracuyá, exprimida al momento y servida muy fría.", en: "Refreshing blend of pineapple, mango, orange and passion fruit, freshly squeezed and served chilled." },
      precio: 4.00,
      imagen: "/assets/zumo-tropical.jpg",
      alergenos: [],
      etiquetas: ["recomendado", "sin_gluten"],
      pairsWith: { main: 8 }
    },
    {
      id: 16,
      nombre: { es: "Sangría Casera", en: "Homemade Sangria" },
      descripcionCorta: { es: "Refrescante sangría con vino tinto, frutas...", en: "Refreshing sangria with red wine, fruits..." },
      descripcionLarga: { es: "Nuestra sangría especial, preparada al momento con vino tinto de calidad, una selección de frutas frescas de temporada, un toque de licor y canela.", en: "Our special sangria, prepared on the spot with quality red wine, a selection of fresh seasonal fruits, a touch of liquor, and cinnamon." },
      precio: 12.50,
      imagen: "/assets/sangria.jpg",
      alergenos: ["sulfitos"],
      etiquetas: ["popular"],
      pairsWith: { main: 5 }
    },
    {
      id: 18,
      nombre: { es: "Cerveza Artesana Local", en: "Local Craft Beer" },
      descripcionCorta: { es: "Selección de cervezas artesanas de productores locales.", en: "Selection of craft beers from local producers." },
      descripcionLarga: { es: "Descubre nuestra selección rotativa de cervezas artesanas elaboradas por pequeños productores de la región. Pregunta a nuestro personal por las variedades disponibles (IPA, Lager, Stout, etc.).", en: "Discover our rotating selection of craft beers brewed by small local producers. Ask our staff about the available varieties (IPA, Lager, Stout, etc.)." },
      precio: 5.50,
      imagen: "/assets/cerveza-artesana.jpg",
      alergenos: ["gluten"],
      etiquetas: [],
      pairsWith: { main: 6 }
    },
    {
      id: 17,
      nombre: { es: "Agua Mineral Natural", en: "Natural Mineral Water" },
      descripcionCorta: { es: "Agua mineral natural de manantial.", en: "Natural spring mineral water." },
      descripcionLarga: { es: "Agua mineral natural de mineralización débil, proveniente de manantial protegido. Servida fría.", en: "Natural mineral water with low mineralization, from a protected spring. Served cold." },
      precio: 2.00,
      imagen: "/assets/agua-mineral.jpg",
      alergenos: [],
      etiquetas: [],
      pairsWith: { main: 7 }
    }
  ]
  
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
// </file>