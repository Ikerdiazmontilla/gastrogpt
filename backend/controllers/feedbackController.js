// backend/controllers/feedbackController.js
const pool = require('../db/pool');

async function handleFeedbackSubmission(req, res) {
  // El tenant_id viene de nuestro middleware tenantResolver
  const tenantId = req.tenant.id;
  const { conversationId, rating, comment } = req.body;

  // Validación básica de los datos recibidos
  if (!conversationId || !rating) {
    return res.status(400).json({ error: 'Faltan datos esenciales (conversationId, rating).' });
  }
  const numericRating = parseInt(rating, 10);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: 'La valoración debe ser un número entre 1 y 5.' });
  }

  try {
    // Usamos el pool directamente porque la tabla está en el schema 'public'
    const query = `
      INSERT INTO public.feedback (tenant_id, conversation_id, rating, comment)
      VALUES ($1, $2, $3, $4)
    `;
    const values = [tenantId, conversationId, numericRating, comment || null];

    await pool.query(query, values);

    console.log(`Feedback recibido para tenant ${tenantId}: ConvID ${conversationId}, Rating ${numericRating}`);
    res.status(201).json({ message: 'Feedback recibido con éxito.' });

  } catch (error) {
    console.error('Error al guardar el feedback en la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor al procesar el feedback.' });
  }
}

module.exports = {
  handleFeedbackSubmission,
};