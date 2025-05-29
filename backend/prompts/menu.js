// <file path="gastrogpts/backend/prompts/menu.js">
const menuData = {
  entrantes: [
    {
      id: 1, // Original ID 1
      nombre: { es: "Croquetas de Jamón", en: "Ham Croquettes" },
      descripcionCorta: { es: "Deliciosas croquetas caseras de jamón ibérico...", en: "Delicious homemade Iberian ham croquettes..." },
      descripcionLarga: { es: "Deliciosas croquetas caseras de jamón ibérico con bechamel cremosa, servidas con un toque de perejil fresco.", en: "Delicious homemade Iberian ham croquettes with creamy béchamel, served with a touch of fresh parsley." },
      precio: 8.50,
      imagen: "/assets/croquetas.jpg",
      alergenos: ["gluten", "lactosa"],
      etiquetas: ["recomendado"],
      pairsWith: { main: 5 } // Pairs with Paella de Mariscos (Original ID 4, now ID 5)
    },
    {
      id: 2, // Original ID 2
      nombre: { es: "Ensalada César", en: "Caesar Salad" },
      descripcionCorta: { es: "Lechuga romana, pollo a la parrilla, crutones...", en: "Romaine lettuce, grilled chicken, croutons..." },
      descripcionLarga: { es: "Clásica ensalada César con lechuga romana fresca, pollo a la parrilla jugoso, crutones caseros, lascas de queso parmesano y nuestro aderezo César especial.", en: "Classic Caesar salad with fresh romaine lettuce, juicy grilled chicken, homemade croutons, Parmesan cheese shavings, and our special Caesar dressing." },
      precio: 9.75,
      imagen: "/assets/ensalada-cesar.jpg",
      alergenos: ["gluten", "lactosa", "huevo", "pescado"],
      etiquetas: [],
      pairsWith: { main: 6 } // Pairs with Solomillo al Whisky (Original ID 5, now ID 6)
    },
    {
      id: 3, // Original ID 3
      nombre: { es: "Gazpacho Andaluz", en: "Andalusian Gazpacho" },
      descripcionCorta: { es: "Sopa fría tradicional de tomate, pepino...", en: "Traditional cold soup of tomato, cucumber..." },
      descripcionLarga: { es: "Refrescante gazpacho andaluz, una sopa fría elaborada con tomates maduros, pepino, pimiento, ajo, aceite de oliva virgen extra y un toque de vinagre de Jerez.", en: "Refreshing Andalusian gazpacho, a cold soup made with ripe tomatoes, cucumber, pepper, garlic, extra virgin olive oil, and a touch of Sherry vinegar." },
      precio: 6.50,
      imagen: "/assets/gazpacho.jpg",
      alergenos: [],
      etiquetas: ["popular","vegano", "sin_gluten"],
      pairsWith: { main: 7 } // Pairs with Risotto de Setas (Original ID 6, now ID 7)
    },
    {
      id: 4, // Original ID 14
      nombre: { es: "Gambas al Ajillo", en: "Garlic Prawns" },
      descripcionCorta: { es: "Gambas frescas salteadas en aceite de oliva con ajo y guindilla.", en: "Fresh prawns sautéed in olive oil with garlic and chili." },
      descripcionLarga: { es: "Jugosas gambas frescas salteadas en abundante aceite de oliva virgen extra con láminas de ajo dorado y un toque de guindilla picante. Perfectas para mojar pan.", en: "Juicy fresh prawns sautéed in plenty of extra virgin olive oil with golden garlic slices and a hint of spicy chili. Perfect for dipping bread." },
      precio: 11.50,
      imagen: "/assets/gambas-al-ajillo.jpg",
      alergenos: ["crustaceos"],
      etiquetas: [],
      pairsWith: { main: 5 } // Pairs with Paella de Mariscos (Original ID 4, now ID 5)
    },
  ],
  principales: [
    {
      id: 8, // Original ID 15
      nombre: { es: "Lasaña de Verduras", en: "Vegetable Lasagna" },
      descripcionCorta: { es: "Capas de pasta, verduras de temporada y bechamel vegana.", en: "Layers of pasta, seasonal vegetables, and vegan béchamel." },
      descripcionLarga: { es: "Deliciosa lasaña vegana con láminas de pasta fresca, rellena de una rica mezcla de verduras de temporada (calabacín, berenjena, pimientos, espinacas) y una cremosa bechamel a base de leche vegetal, gratinada con queso vegano.", en: "Delicious vegan lasagna with fresh pasta sheets, filled with a rich mix of seasonal vegetables (zucchini, eggplant, peppers, spinach) and a creamy plant-based milk béchamel, topped with melted vegan cheese." },
      precio: 15.00,
      imagen: "/assets/lasana-vegana.jpg",
      alergenos: ["gluten", "soja"],
      etiquetas: ["recomendado","vegano"],
      pairsWith: { drink: 16, dessert: 13 } // Pairs with Zumo de Naranja (ID 19 - not in current re-IDed bebidas list) and Brownie Vegano (Original ID 17, now 13)
    },
    {
      id: 6, // Original ID 5
      nombre: { es: "Solomillo al Whisky", en: "Whiskey Sirloin Steak" },
      descripcionCorta: { es: "Solomillo de ternera con salsa de whisky...", en: "Beef sirloin with whiskey sauce..." },
      descripcionLarga: { es: "Tierno solomillo de ternera nacional, marcado a la plancha y terminado con una suave y aromática salsa al whisky, acompañado de patatas panaderas y pimientos de padrón.", en: "Tender national beef sirloin, grilled and finished with a smooth and aromatic whiskey sauce, accompanied by baker potatoes and Padrón peppers." },
      precio: 22.00,
      imagen: "/assets/solomillo-al-whisky.jpg",
      alergenos: ["gluten"],
      etiquetas: ["popular"],
      pairsWith: { drink: 15, dessert: 10 } // Drink: Vino Tinto Rioja Crianza (Original ID 10, now 15), Dessert: Tarta de Queso (Original ID 7, now 10)
    },
    {
      id: 5, // Original ID 4
      nombre: { es: "Paella de Mariscos", en: "Seafood Paella" },
      descripcionCorta: { es: "Arroz con azafrán, calamares, gambas...", en: "Rice with saffron, squid, prawns..." },
      descripcionLarga: { es: "Auténtica paella de mariscos con arroz bomba, azafrán, calamares tiernos, gambas frescas, mejillones y almejas, cocinada lentamente en su caldo. Toque picante opcional.", en: "Authentic seafood paella with bomba rice, saffron, tender squid, fresh prawns, mussels, and clams, slowly cooked in its broth. Optional spicy touch." },
      precio: 18.50,
      imagen: "/assets/paella-marisco.jpg",
      alergenos: ["mariscos", "crustaceos", "moluscos"],
      etiquetas: ["picante_suave"],
      pairsWith: { drink: 16, dessert: 12 } // Drink: Sangría Casera (Original ID 11, now 16), Dessert: Sorbete de Limón al Cava (Original ID 9, now 12)
    },
    {
      id: 7, // Original ID 6
      nombre: { es: "Risotto de Setas", en: "Mushroom Risotto" },
      descripcionCorta: { es: "Arroz cremoso con variedad de setas...", en: "Creamy rice with a variety of mushrooms..." },
      descripcionLarga: { es: "Risotto cremoso Arborio con una selección de setas silvestres de temporada (boletus, níscalos, champiñones portobello), mantecado con parmesano y un toque de trufa.", en: "Creamy Arborio risotto with a selection of seasonal wild mushrooms (boletus, chanterelles, portobello mushrooms), creamed with Parmesan and a touch of truffle." },
      precio: 14.50,
      imagen: "/assets/rissotto-setas.jpg",
      alergenos: ["lactosa"],
      etiquetas: ["vegetariano"],
      pairsWith: { drink: 17, dessert: 11 } // Drink: Agua Mineral Natural (Original ID 12, now 17), Dessert: Crema Catalana (Original ID 8, now 11)
    },

    // {
    //   id: 9, // Original ID 16
    //   nombre: { es: "Bacalao a la Vizcaína", en: "Biscayan Style Cod" },
    //   descripcionCorta: { es: "Lomos de bacalao en salsa vizcaína tradicional.", en: "Cod loins in traditional Biscayan sauce." },
    //   descripcionLarga: { es: "Suculentos lomos de bacalao desalado, cocinados a fuego lento en una auténtica salsa vizcaína elaborada con pimientos choriceros, cebolla, ajo y tomate. Servido con patatas cocidas.", en: "Succulent desalted cod loins, slow-cooked in an authentic Biscayan sauce made with choricero peppers, onion, garlic, and tomato. Served with boiled potatoes." },
    //   precio: 19.75,
    //   imagen: "/assets/bacalao-vizcaina.jpg",
    //   alergenos: ["pescado"],
    //   etiquetas: [],
    //   pairsWith: { drink: 15, dessert: 11 } // Pairs with Vino Tinto Rioja Crianza (Original ID 10, now 15) and Crema Catalana (Original ID 8, now 11)
    // },
  ],
  postres: [
    {
      id: 10, // Original ID 7
      nombre: { es: "Tarta de Queso", en: "Cheesecake" },
      descripcionCorta: { es: "Tarta cremosa de queso con base de galleta...", en: "Creamy cheesecake with a cookie base..." },
      descripcionLarga: { es: "Irresistible tarta de queso horneada al estilo neoyorquino, con una base crujiente de galleta y un suave coulis de frutos rojos casero.", en: "Irresistible New York-style baked cheesecake with a crispy cookie base and a smooth homemade red berry coulis." },
      precio: 6.50,
      imagen: "/assets/tarta-queso.jpg",
      alergenos: ["gluten", "lactosa", "huevo"],
      etiquetas: ["popular"],
    },
    {
      id: 11, // Original ID 8
      nombre: { es: "Crema Catalana", en: "Catalan Cream" },
      descripcionCorta: { es: "Postre tradicional catalán con crema suave...", en: "Traditional Catalan dessert with smooth cream..." },
      descripcionLarga: { es: "Clásica crema catalana con una textura suave y delicada, aromatizada con limón y canela, y cubierta con una fina capa de azúcar caramelizado crujiente.", en: "Classic Catalan cream with a smooth and delicate texture, flavored with lemon and cinnamon, and covered with a thin layer of crispy caramelized sugar." },
      precio: 5.75,
      imagen: "/assets/crema-catalana.jpg",
      alergenos: ["lactosa", "huevo"],
      etiquetas: [],
    },
    {
      id: 12, // Original ID 9
      nombre: { es: "Sorbete de Limón al Cava", en: "Lemon Sorbet with Cava" },
      descripcionCorta: { es: "Refrescante sorbete de limón con un toque de cava...", en: "Refreshing lemon sorbet with a touch of cava..." },
      descripcionLarga: { es: "Ligero y digestivo sorbete de limón natural, elaborado artesanalmente y terminado con un toque espumoso de cava brut nature.", en: "Light and digestive natural lemon sorbet, handcrafted and finished with a sparkling touch of brut nature cava." },
      precio: 4.50,
      imagen: "/assets/sorbete-limon.jpg",
      alergenos: [],
      etiquetas: ["vegano", "sin_gluten"],
    },
    {
      id: 13, // Original ID 17
      nombre: { es: "Brownie con Helado", en: "Brownie with Ice Cream" },
      descripcionCorta: { es: "Brownie de chocolate vegano acompañado de helado de vainilla vegano.", en: "Vegan chocolate brownie served with vegan vanilla ice cream." },
      descripcionLarga: { es: "Intenso brownie de chocolate negro vegano, jugoso por dentro y con una ligera costra por fuera, acompañado de una bola de helado de vainilla cremoso a base de leche vegetal.", en: "Intense vegan dark chocolate brownie, moist on the inside with a slight crust on the outside, served with a scoop of creamy plant-based vanilla ice cream." },
      precio: 7.00,
      imagen: "/assets/brownie-con-helado.jpg",
      alergenos: ["gluten", "frutos_secos"],
      etiquetas: ["vegano"],
    },
  ],
  bebidas: [
    {
      id: 15, // Original ID 10
      nombre: { es: "Vino Tinto", en: "Rioja Crianza Red Wine" },
      descripcionCorta: { es: "Vino tinto D.O.Ca. Rioja, crianza...", en: "Red wine D.O.Ca. Rioja, crianza..." },
      descripcionLarga: { es: "Vino tinto de la Denominación de Origen Calificada Rioja, elaborado con uvas Tempranillo y Graciano, con una crianza de 12 meses en barrica de roble americano.", en: "Red wine from the Rioja Qualified Designation of Origin, made with Tempranillo and Graciano grapes, aged for 12 months in American oak barrels." },
      precio: 18.00,
      imagen: "/assets/vino-tinto.jpg",
      alergenos: ["sulfitos"],
      etiquetas: ["recomendado"],
      pairsWith: { main: 6 } // Pairs with Solomillo al Whisky (Original ID 5, now ID 6)
    },
    {
      id: 19,
      nombre: { es: "Zumo Tropical", en: "House Tropical Juice" },
      descripcionCorta: {
        es: "Zumo de frutas frescas sin alcohol.",
        en: "Fresh fruit juice, alcohol-free."
      },
      descripcionLarga: {
        es: "Refrescante mezcla de piña, mango, naranja y maracuyá, exprimida al momento y servida muy fría.",
        en: "Refreshing blend of pineapple, mango, orange and passion fruit, freshly squeezed and served chilled."
      },
      precio: 4.00,
      imagen: "/assets/zumo-tropical.jpg",
      alergenos: [],
      etiquetas: ["recomendado", "sin_gluten"],
      pairsWith: { main: 8 } // Lasaña de Verduras
    },
    {
      id: 16, // Original ID 11
      nombre: { es: "Sangría Casera", en: "Homemade Sangria" },
      descripcionCorta: { es: "Refrescante sangría con vino tinto, frutas...", en: "Refreshing sangria with red wine, fruits..." },
      descripcionLarga: { es: "Nuestra sangría especial, preparada al momento con vino tinto de calidad, una selección de frutas frescas de temporada, un toque de licor y canela.", en: "Our special sangria, prepared on the spot with quality red wine, a selection of fresh seasonal fruits, a touch of liquor, and cinnamon." },
      precio: 12.50,
      imagen: "/assets/sangria.jpg",
      alergenos: ["sulfitos"],
      etiquetas: ["popular"],
      pairsWith: { main: 5 } // Pairs with Paella de Mariscos (Original ID 4, now ID 5)
    },
    {
      id: 18, // Original ID 20
      nombre: { es: "Cerveza Artesana", en: "Local Craft Beer" },
      descripcionCorta: { es: "Selección de cervezas artesanas de productores locales.", en: "Selection of craft beers from local producers." },
      descripcionLarga: { es: "Descubre nuestra selección rotativa de cervezas artesanas elaboradas por pequeños productores de la región. Pregunta a nuestro personal por las variedades disponibles (IPA, Lager, Stout, etc.).", en: "Discover our rotating selection of craft beers brewed by small local producers. Ask our staff about the available varieties (IPA, Lager, Stout, etc.)." },
      precio: 5.50,
      imagen: "/assets/cerveza-artesana.jpg",
      alergenos: ["gluten"],
      etiquetas: [],
      pairsWith: { main: 6 } // Pairs well with Solomillo al Whisky (Original ID 5, now ID 6)
    },
    {
      id: 17, // Original ID 12
      nombre: { es: "Agua Mineral", en: "Natural Mineral Water" },
      descripcionCorta: { es: "Agua mineral natural de manantial.", en: "Natural spring mineral water." },
      descripcionLarga: { es: "Agua mineral natural de mineralización débil, proveniente de manantial protegido. Servida fría.", en: "Natural mineral water with low mineralization, from a protected spring. Served cold." },
      precio: 2.00,
      imagen: "/assets/agua-mineral.jpg",
      alergenos: [],
      etiquetas: [],
      pairsWith: { main: 7 } // Pairs with Risotto de Setas (Original ID 6, now ID 7)
    },

  ],
};

module.exports = menuData;