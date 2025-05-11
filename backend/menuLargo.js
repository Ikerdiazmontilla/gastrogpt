const menu = {
  bebidas: [
    { nombre: "Agua Mineral", tipo: "bebida sin alcohol", precio: "3", descripcion: "Agua mineral natural o con gas." },
    { nombre: "Zumo de Naranja", tipo: "bebida sin alcohol", precio: "4", descripcion: "Zumo de naranja exprimido al momento." },
    { nombre: "Café Espresso", tipo: "bebida caliente", precio: "2.5", descripcion: "Café espresso intenso y aromático." },
    { nombre: "Té Verde", tipo: "bebida caliente", precio: "3.5", descripcion: "Té verde con hojas premium." },
    { nombre: "Limonada Casera", tipo: "refresco", precio: "4", descripcion: "Limonada fresca con hierbabuena." },
    { nombre: "Refresco de Cola", tipo: "refresco", precio: "3", descripcion: "Bebida carbonatada sabor cola." },
    { nombre: "Cerveza Artesanal", tipo: "bebida con alcohol", precio: "5", descripcion: "Cerveza local de sabor intenso." },
    { nombre: "Vino Tinto de la Casa", tipo: "bebida con alcohol", precio: "6", descripcion: "Vino tinto joven con cuerpo suave." },
    { nombre: "Margarita", tipo: "cóctel", precio: "8", descripcion: "Tequila, triple seco y lima." },
    { nombre: "Batido de Fresa", tipo: "bebida fría", precio: "5", descripcion: "Fresas frescas con leche y hielo." }
  ],
  entrantes: [
    {
      nombre: "Gazpacho Andaluz",
      tipo: "entrante",
      precio: "8",
      descripcion: "Sopa fría de tomate y verduras.",
      nivelPicante: "suave",
      alergias: "gluten",
      ingredientes: ["tomate", "pepino", "pimiento", "pan", "aceite de oliva", "vinagre"]
    },
    {
      nombre: "Croquetas de Jamón",
      tipo: "entrante",
      precio: "9",
      descripcion: "Crujientes croquetas rellenas de jamón.",
      nivelPicante: "suave",
      alergias: "gluten,lactosa",
      ingredientes: ["jamón", "bechamel", "pan rallado", "huevo", "aceite"]
    },
    {
      nombre: "Bruschetta de Tomate",
      tipo: "entrante",
      precio: "7",
      descripcion: "Pan tostado con tomate, ajo y albahaca.",
      nivelPicante: "suave",
      alergias: "gluten",
      ingredientes: ["pan", "tomate", "albahaca", "aceite de oliva", "ajo"]
    },
    {
      nombre: "Tortilla Española",
      tipo: "entrante",
      precio: "8",
      descripcion: "Tortilla de patata y cebolla jugosa.",
      nivelPicante: "suave",
      alergias: "ninguna",
      ingredientes: ["patata", "huevo", "cebolla", "aceite de oliva", "sal"]
    },
    {
      nombre: "Patatas Bravas",
      tipo: "entrante",
      precio: "8",
      descripcion: "Patatas con salsa brava y alioli.",
      nivelPicante: "medio",
      alergias: "ninguna",
      ingredientes: ["patatas", "salsa brava", "alioli", "aceite", "sal"]
    },
    {
      nombre: "Empanadilla de Atún",
      tipo: "entrante",
      precio: "7",
      descripcion: "Empanadillas rellenas de atún y tomate.",
      nivelPicante: "suave",
      alergias: "gluten",
      ingredientes: ["masa de empanadilla", "atún", "tomate", "cebolla", "huevo"]
    },
    {
      nombre: "Tabla de Quesos",
      tipo: "entrante",
      precio: "12",
      descripcion: "Selección de quesos artesanos con uvas.",
      nivelPicante: "suave",
      alergias: "lactosa",
      ingredientes: ["queso manchego", "queso azul", "queso de cabra", "uvas", "pan"]
    },
    {
      nombre: "Calamares a la Romana",
      tipo: "entrante",
      precio: "10",
      descripcion: "Calamares rebozados con limón.",
      nivelPicante: "suave",
      alergias: "gluten",
      ingredientes: ["calamares", "harina", "huevo", "aceite", "limón"]
    },
    {
      nombre: "Ensalada Caprese",
      tipo: "entrante",
      precio: "9",
      descripcion: "Tomate, mozzarella y albahaca fresca.",
      nivelPicante: "suave",
      alergias: "lactosa",
      ingredientes: ["tomate", "mozzarella", "albahaca", "aceite de oliva", "sal"]
    },
    {
      nombre: "Nachos con Guacamole",
      tipo: "entrante",
      precio: "11",
      descripcion: "Nachos crujientes con guacamole casero.",
      nivelPicante: "medio",
      alergias: "ninguna",
      ingredientes: ["totopos", "aguacate", "cilantro", "cebolla", "tomate", "limón"]
    }
  ],
  platosPrincipales: {
    carne: [
      {
        nombre: "Filete a la Parrilla",
        tipo: "carne",
        precio: "17",
        descripcion: "Filete de res a la parrilla con vegetales asados.",
        nivelPicante: "suave",
        alergias: "ninguna",
        ingredientes: ["filete de res", "sal", "pimienta", "aceite de oliva", "vegetales asados"]
      },
      {
        nombre: "Pollo al Curry",
        tipo: "carne",
        precio: "18",
        descripcion: "Pechuga de pollo al curry con arroz basmati.",
        nivelPicante: "picante",
        alergias: "ninguna",
        ingredientes: ["pechuga de pollo", "curry en polvo", "leche de coco", "arroz basmati", "cebolla", "ajo"]
      },
      {
        nombre: "Wrap de Pollo",
        tipo: "carne",
        precio: "13",
        descripcion: "Wrap de pollo a la parrilla con verduras y yogur.",
        nivelPicante: "suave",
        alergias: "lactosa",
        ingredientes: ["tortilla de trigo", "pechuga de pollo", "lechuga", "tomate", "salsa de yogur"]
      },
      {
        nombre: "Chili con Carne",
        tipo: "carne",
        precio: "14",
        descripcion: "Carne molida con frijoles y especias picantes.",
        nivelPicante: "muyPicante",
        alergias: "ninguna",
        ingredientes: ["carne molida", "frijoles", "tomate", "pimiento", "cebolla", "chile en polvo"]
      }
    ],
    pescado: [
      {
        nombre: "Salmón al Horno",
        tipo: "pescado",
        precio: "23",
        descripcion: "Salmón fresco al horno con limón y hierbas.",
        nivelPicante: "medio",
        alergias: "ninguna",
        ingredientes: ["salmón", "limón", "hierbas frescas", "aceite de oliva", "sal"]
      },
      {
        nombre: "Atún a la Parrilla",
        tipo: "pescado",
        precio: "13",
        descripcion: "Atún a la parrilla con espárragos.",
        nivelPicante: "medio",
        alergias: "ninguna",
        ingredientes: ["filete de atún", "espárragos", "aceite de oliva", "limón", "sal"]
      },
      {
        nombre: "Carpaccio de Salmón",
        tipo: "pescado",
        precio: "29",
        descripcion: "Lonchas finas de salmón con limón y eneldo.",
        nivelPicante: "suave",
        alergias: "ninguna",
        ingredientes: ["salmón fresco", "limón", "eneldo", "aceite de oliva", "sal", "pimienta"]
      }
    ],
    vegetariano: [
      {
        nombre: "Ensalada Vegetariana",
        tipo: "vegetariano",
        precio: "12",
        descripcion: "Ensalada variada con vinagreta.",
        nivelPicante: "suave",
        alergias: "ninguna",
        ingredientes: ["lechuga", "tomate", "pepino", "zanahoria", "aderezo vinagreta"]
      },
      {
        nombre: "Risotto de Champiñones",
        tipo: "vegetariano",
        precio: "16",
        descripcion: "Risotto cremoso con champiñones y parmesano.",
        nivelPicante: "suave",
        alergias: "lactosa",
        ingredientes: ["arroz arborio", "champiñones", "caldo de verduras", "queso parmesano", "cebolla"]
      },
      {
        nombre: "Ensalada de Quinoa",
        tipo: "vegetariano",
        precio: "15",
        descripcion: "Quinoa con tomates cherry y aguacate.",
        nivelPicante: "suave",
        alergias: "ninguna",
        ingredientes: ["quinoa", "tomates cherry", "aguacate", "cebolla roja", "aceite de oliva"]
      },
      {
        nombre: "Falafel con Hummus",
        tipo: "vegetariano",
        precio: "14",
        descripcion: "Falafel casero con hummus y pan pita.",
        nivelPicante: "suave",
        alergias: "gluten",
        ingredientes: ["garbanzos", "cilantro", "comino", "pan pita", "hummus", "aceite"]
      }
    ],
    vegano: [
      {
        nombre: "Curry Vegano",
        tipo: "vegano",
        precio: "21",
        descripcion: "Curry de verduras con leche de coco.",
        nivelPicante: "muyPicante",
        alergias: "ninguna",
        ingredientes: ["verduras mixtas", "leche de coco", "curry", "arroz", "aceite de oliva"]
      },
      {
        nombre: "Hamburguesa Vegana",
        tipo: "vegano",
        precio: "14",
        descripcion: "Hamburguesa de lentejas y quinoa con papas.",
        nivelPicante: "suave",
        alergias: "gluten",
        ingredientes: ["lentejas", "quinoa", "pan integral", "lechuga", "tomate", "patatas"]
      },
      {
        nombre: "Tofu Salteado",
        tipo: "vegano",
        precio: "12",
        descripcion: "Tofu con verduras frescas y soja.",
        nivelPicante: "suave",
        alergias: "gluten",
        ingredientes: ["tofu", "brócoli", "zanahoria", "salsa de soja", "aceite de sésamo"]
      },
      {
        nombre: "Pizza Vegana",
        tipo: "vegano",
        precio: "20",
        descripcion: "Base integral con vegetales frescos.",
        nivelPicante: "medio",
        alergias: "gluten",
        ingredientes: ["harina integral", "tomate", "pimientos", "cebolla", "aceitunas"]
      }
    ],
    mariscos: [
      {
        nombre: "Tacos de Camarón",
        tipo: "mariscos",
        precio: "16",
        descripcion: "Tacos de camarón con especias mexicanas.",
        nivelPicante: "picante",
        alergias: "mariscos",
        ingredientes: ["tortilla de maíz", "camarones", "especias mexicanas", "salsa picante", "cilantro"]
      },
      {
        nombre: "Paella de Mariscos",
        tipo: "mariscos",
        precio: "35",
        descripcion: "Paella tradicional con variedad de mariscos.",
        nivelPicante: "medio",
        alergias: "mariscos",
        ingredientes: ["arroz", "mejillones", "camarones", "calamares", "azafrán", "pimiento"]
      },
      {
        nombre: "Sopa de Mariscos",
        tipo: "mariscos",
        precio: "22",
        descripcion: "Caldo caliente con camarones y mejillones.",
        nivelPicante: "medio",
        alergias: "mariscos",
        ingredientes: ["camarones", "mejillones", "calamares", "caldo de pescado", "verduras"]
      },
      {
        nombre: "Camarones a la Diabla",
        tipo: "mariscos",
        precio: "24",
        descripcion: "Camarones en salsa muy picante.",
        nivelPicante: "muyPicante",
        alergias: "mariscos",
        ingredientes: ["camarones", "chile rojo", "ajo", "aceite", "arroz"]
      }
    ]
  },
  postres: [
    {
      nombre: "Flan de Vainilla",
      tipo: "postre",
      precio: "6",
      descripcion: "Flan casero con caramelo.",
      nivelPicante: "suave",
      alergias: "lactosa",
      ingredientes: ["huevo", "leche", "azúcar", "vainilla"]
    },
    {
      nombre: "Tarta de Queso",
      tipo: "postre",
      precio: "7",
      descripcion: "Tarta de queso cremosa con base de galleta.",
      nivelPicante: "suave",
      alergias: "gluten,lactosa",
      ingredientes: ["queso crema", "galletas", "mantequilla", "azúcar"]
    },
    {
      nombre: "Brownie de Chocolate",
      tipo: "postre",
      precio: "6",
      descripcion: "Brownie húmedo con nueces.",
      nivelPicante: "suave",
      alergias: "gluten,lactosa",
      ingredientes: ["chocolate", "harina", "huevo", "azúcar", "mantequilla"]
    },
    {
      nombre: "Crema Catalana",
      tipo: "postre",
      precio: "6.5",
      descripcion: "Crema quemada con canela.",
      nivelPicante: "suave",
      alergias: "lactosa",
      ingredientes: ["leche", "huevo", "azúcar", "canela"]
    },
    {
      nombre: "Helado de Vainilla",
      tipo: "postre",
      precio: "5",
      descripcion: "Helado cremoso de vainilla.",
      nivelPicante: "suave",
      alergias: "lactosa",
      ingredientes: ["leche", "huevo", "azúcar", "vainilla"]
    },
    {
      nombre: "Fruta Fresca",
      tipo: "postre",
      precio: "5",
      descripcion: "Selección de fruta de temporada.",
      nivelPicante: "suave",
      alergias: "ninguna",
      ingredientes: ["fresa", "kiwi", "manzana", "plátano"]
    },
    {
      nombre: "Tarta de Manzana",
      tipo: "postre",
      precio: "6",
      descripcion: "Tarta casera de manzana con canela.",
      nivelPicante: "suave",
      alergias: "gluten,lactosa",
      ingredientes: ["manzana", "harina", "azúcar", "mantequilla"]
    },
    {
      nombre: "Mousse de Limón",
      tipo: "postre",
      precio: "6",
      descripcion: "Mousse ligera de limón.",
      nivelPicante: "suave",
      alergias: "lactosa",
      ingredientes: ["limón", "nata", "azúcar", "huevo"]
    },
    {
      nombre: "Churros con Chocolate",
      tipo: "postre",
      precio: "5",
      descripcion: "Churros caseros con salsa de chocolate.",
      nivelPicante: "suave",
      alergias: "gluten",
      ingredientes: ["harina", "agua", "azúcar", "chocolate"]
    },
    {
      nombre: "Panna Cotta",
      tipo: "postre",
      precio: "6",
      descripcion: "Panna cotta suave con coulis de frutos rojos.",
      nivelPicante: "suave",
      alergias: "lactosa",
      ingredientes: ["nata", "azúcar", "gelatina", "vainilla"]
    }
  ]
};

module.exports = menu;

