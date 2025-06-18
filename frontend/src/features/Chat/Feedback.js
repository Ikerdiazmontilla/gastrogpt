// frontend/src/features/Chat/Feedback.js
import React, { useState } from 'react';
import styles from './Feedback.module.css';
import { useTenant } from '../../context/TenantContext';
import { sendFeedback, trackGoogleReviewClick } from '../../services/apiService';

const Feedback = ({ conversationId, onFeedbackSent }) => {
  // Get tenant config to access the Google Reviews URL
  const { tenantConfig } = useTenant();
  const googleReviewsUrl = tenantConfig?.googleReviewsUrl;

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // State to manage the different views of the component
  const [view, setView] = useState('ask_initial'); // 'ask_initial', 'ask_comment', 'show_google_link', 'final_thanks'

  const handleSubmit = async (finalRating, finalComment = '') => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    try {
      await sendFeedback({
        conversationId,
        rating: finalRating,
        comment: finalComment,
      });

      // Logic to decide the next view based on the rating and if a URL exists
      if (finalRating === 5 && googleReviewsUrl) {
        setView('show_google_link');
      } else {
        setView('final_thanks');
        // If the flow ends here, notify the parent to unmount after a delay
        setTimeout(() => { if (onFeedbackSent) onFeedbackSent() }, 2000);
      }
      
    } catch (err) {
      setError('No se pudo enviar tu valoración. Inténtalo de nuevo.');
      console.error('Error al enviar feedback:', err);
      setIsSubmitting(false); // Re-enable on error
    }
    // Do not set isSubmitting to false on success, as the view changes and buttons disappear.
  };

  const handleRatingClick = (newRating) => {
    setRating(newRating);
    if (newRating === 5) {
      // If 5 stars, submit immediately. handleSubmit will decide the next step.
      handleSubmit(newRating);
    } else {
      // If less than 5, show the comment box.
      setView('ask_comment');
    }
  };

  const handleGoogleLinkClick = (e) => {
    e.preventDefault(); // Prevent default navigation to track first
    
    // Asynchronously track the click. We don't wait for the result to navigate the user.
    trackGoogleReviewClick(conversationId).catch(err => {
      console.error("Failed to track Google Review click, but proceeding with navigation.", err);
    });

    // Open the review link in a new tab
    window.open(googleReviewsUrl, '_blank', 'noopener,noreferrer');
    
    // Show the final "thank you" message in our app and then notify parent
    setView('final_thanks');
    setTimeout(() => { if (onFeedbackSent) onFeedbackSent() }, 2000);
  };
  
  // Render different content based on the current 'view' state
  
  if (view === 'final_thanks') {
    return (
      <div className={`${styles.feedbackContainer} ${styles.submitted}`}>
        <p>¡Gracias por tu opinión!</p>
      </div>
    );
  }

  if (view === 'show_google_link') {
    return (
      <div className={styles.feedbackContainer}>
        <p className={styles.feedbackTitle}>¡Genial! Nos alegra haberte ayudado.</p>
        <p>¿Te importaría dejar una reseña en Google? Ayuda mucho a nuestro restaurante.</p>
        <a
          href={googleReviewsUrl}
          onClick={handleGoogleLinkClick}
          className={styles.googleReviewButton}
        >
          Dejar reseña en Google
        </a>
      </div>
    );
  }

  return (
    <div className={styles.feedbackContainer}>
      <p className={styles.feedbackTitle}>
        {view === 'ask_comment' ? '¿Qué podríamos mejorar?' : '¿Te ha resultado útil la conversación?'}
      </p>
      
      {/* Show stars only when initially asking */}
      {view === 'ask_initial' && (
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
      )}

      {/* Show comment section only when asking for a comment */}
      {view === 'ask_comment' && (
        <div className={styles.commentSection}>
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