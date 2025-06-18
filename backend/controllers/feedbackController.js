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


/**
 * New function to handle tracking when a user clicks the Google Review link.
 */
async function handleGoogleReviewClick(req, res) {
  const { conversationId } = req.body;

  if (!conversationId) {
    return res.status(400).json({ error: 'Falta conversationId.' });
  }

  try {
    // This query updates the existing feedback entry to record the click timestamp.
    // It only affects rows where a click hasn't been recorded yet.
    const query = `
      UPDATE public.feedback
      SET google_review_link_clicked_at = CURRENT_TIMESTAMP
      WHERE conversation_id = $1 AND google_review_link_clicked_at IS NULL
    `;
    const values = [conversationId];

    const result = await pool.query(query, values);

    if (result.rowCount > 0) {
      console.log(`Click en enlace de Google Review registrado para la conversación: ${conversationId}`);
    } else {
      // This can happen if the feedback entry doesn't exist or was already updated. It's not a critical error.
      console.warn(`Se intentó registrar un click para una conversación no encontrada o ya registrada: ${conversationId}`);
    }
    
    // Always return a success status to not block the user's redirection on the frontend.
    res.status(200).json({ message: 'Click registrado.' });

  } catch (error) {
    console.error('Error al registrar el click en el enlace de Google Review:', error);
    // Even if tracking fails, we respond with success so the user is still redirected.
    res.status(200).json({ error: 'Error interno, pero el usuario no será bloqueado.' });
  }
}

module.exports = {
  handleFeedbackSubmission,
  handleGoogleReviewClick, // Export the new function
};