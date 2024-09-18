// backend/routes/createMenu.js

const express = require('express');
const router = express.Router();
const menu = require('../menus/menu'); // Importar el menú inventado

// Ruta POST para crear un menú personalizado
router.post('/', async (req, res) => {
  const { tipoComida, precio, alergias, nivelPicante } = req.body;

  // Filtrar el menú basado en las preferencias del usuario
  let filteredMenu = menu.filter(plato => {
    let match = true;

    if (tipoComida && plato.tipo !== tipoComida) {
      match = false;
    }

    if (precio && plato.precio !== precio) {
      match = false;
    }

    if (nivelPicante && plato.nivelPicante !== nivelPicante) {
      match = false;
    }

    // Puedes agregar más filtros según las necesidades

    return match;
  });

  // Manejar alergias o restricciones alimentarias
  if (alergias) {
    filteredMenu = filteredMenu.filter(plato => {
      // Simplemente verificando si la descripción incluye la alergia
      return !plato.descripcion.toLowerCase().includes(alergias.toLowerCase());
    });
  }

  res.json({ menu: filteredMenu });
});

module.exports = router;
