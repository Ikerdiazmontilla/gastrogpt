// frontend/src/features/Chat/Feedback.js
import React, { useState } from 'react';
import styles from './Feedback.module.css';
import { sendFeedback } from '../../services/apiService'; // Importamos la nueva función

const Feedback = ({ conversationId, onFeedbackSent }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleRatingClick = (newRating) => {
    setRating(newRating);
    // Si el usuario da 5 estrellas, se envía automáticamente.
    if (newRating === 5) {
      handleSubmit(newRating, '');
    } else {
      // Si da menos de 5, mostramos el cuadro para comentarios.
      setShowCommentBox(true);
    }
  };

  const handleSubmit = async (finalRating, finalComment) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    try {
      await sendFeedback({
        conversationId,
        rating: finalRating,
        comment: finalComment,
      });
      setSubmitted(true);
      // Opcional: notificar al componente padre que el feedback se ha enviado.
      if (onFeedbackSent) onFeedbackSent(); 
    } catch (err) {
      setError('No se pudo enviar tu valoración. Inténtalo de nuevo.');
      console.error('Error al enviar feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (submitted) {
    return (
      <div className={`${styles.feedbackContainer} ${styles.submitted}`}>
        <p>¡Gracias por tu opinión!</p>
      </div>
    );
  }

  return (
    <div className={styles.feedbackContainer}>
      {!showCommentBox && <p className={styles.feedbackTitle}>¿Te ha resultado útil?</p>}
      
      <div className={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={styles.star}
            onClick={() => handleRatingClick(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          >
            {(hoverRating || rating) >= star ? '★' : '☆'}
          </span>
        ))}
      </div>

      {showCommentBox && (
        <div className={styles.commentSection}>
          <p className={styles.feedbackTitle}>¿Qué mejorarías?</p>
          <textarea
            className={styles.commentTextarea}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tus sugerencias nos ayudan a mejorar..."
            rows="3"
            disabled={isSubmitting}
          />
          <button
            className={styles.submitButton}
            onClick={() => handleSubmit(rating, comment)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar opinión'}
          </button>
        </div>
      )}

      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default Feedback;