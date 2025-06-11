// backend/routes/configRoutes.js

const express = require('express');
const configController = require('../controllers/configController');

const router = express.Router();

// Ruta para que el frontend obtenga toda su configuración inicial.
router.get('/config', configController.getTenantConfig);

module.exports = router;