// src/features/Questionnaire/Questionnaire.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './Questionnaire.module.css';
import ReactMarkdown from 'react-markdown';
import { questionnaireTranslations } from '../../data/translations'; // Translations

// API service
import { submitQuestionnaire } from '../../services/apiService';

// Markdown utilities
import { createMarkdownLinkRenderer, markdownUrlTransform } from '../../utils/markdownUtils';
// Note: findDishById is used by createMarkdownLinkRenderer, so it's indirectly used.

const Questionnaire = ({ currentLanguage, onViewDishDetails }) => {
  const initialFormState = useMemo(() => ({ // Memoize initial state
    tipoComida: [], precio: [], alergias: [], nivelPicante: [], consideraciones: ''
  }), []);

  const [form, setForm] = useState(initialFormState);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get translated texts
  const T = questionnaireTranslations[currentLanguage] || questionnaireTranslations['Español'];

  // Reset form and results if language changes or component re-initializes
  useEffect(() => {
    setForm(initialFormState);
    setResult('');
    setError('');
  }, [currentLanguage, initialFormState]);

  const handleChange = useCallback((e) => {
    const { name, options, value, tagName, type, checked } = e.target;
    setError(''); // Clear error on any change

    setForm(prevForm => {
      let newFieldValue;
      if (tagName === 'SELECT') {
        if (e.target.multiple) {
          newFieldValue = Array.from(options)
            .filter(option => option.selected)
            .map(option => option.value);
        } else {
          // For single select, store as an array with one item or empty if placeholder
          newFieldValue = value ? [value] : [];
        }
      } else if (type === 'checkbox') { // Example if using checkboxes for multi-select
        const currentValues = prevForm[name] || [];
        if (checked) {
          newFieldValue = [...currentValues, value];
        } else {
          newFieldValue = currentValues.filter(item => item !== value);
        }
      } else { // Textarea
        newFieldValue = value;
      }
      return { ...prevForm, [name]: newFieldValue };
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const { tipoComida, precio, alergias, nivelPicante } = form;

    // Validation
    if (tipoComida.length === 0 || precio.length === 0 || nivelPicante.length === 0) {
      setError(T.errors.requiredFields);
      return;
    }
    if (alergias.length === 0) {
      setError(T.errors.requiredAlergias);
      return;
    }

    setLoading(true);
    setResult('');

    const payload = { ...form, language: currentLanguage };

    try {
      const data = await submitQuestionnaire(payload);
      if (data.recommendations) {
        setResult(data.recommendations);
      } else {
        setResult(T.errors.defaultFetchError); // Fallback, though apiService should throw
        console.warn("Unexpected response from backend (questionnaire):", data);
      }
    } catch (err) {
      console.error('Error getting recommendations:', err);
      setError(`${T.errors.fetchErrorPrefix}${err.message || T.errors.defaultFetchError}`);
      setResult(''); // Clear previous results on error
    } finally {
      setLoading(false);
    }
  };

  // Memoized Markdown components, passing onViewDishDetails and local styles
  const markdownComponents = useMemo(() => ({
    a: createMarkdownLinkRenderer(onViewDishDetails, styles) // styles from Questionnaire.module.css
  }), [onViewDishDetails, styles]);


  // Helper to generate select option values for backend, using translated labels for display.
  // This logic remains, as it's specific to how Questionnaire maps form values.
  const getOptionValue = (category, optionKey) => {
    const T_options = T.options[category];
    if (!T_options || !T_options[optionKey]) return optionKey;

    switch (category) {
        case 'tipoComida':
            return optionKey === "otro" ? "lo que pone en consideraciones adicionales" : T_options[optionKey];
        case 'precio':
            if (optionKey === 'val1') return "menos de 15 euros";
            if (optionKey === 'val2') return "menos de 20 euros";
            if (optionKey === 'val3') return "menos de 30 euros";
            if (optionKey === 'val4') return "sin limite";
            return T_options[optionKey];
        case 'alergias': // For alergias, send the key itself (e.g., "gluten", "lactosa") or translated value if AI expects that.
        case 'nivelPicante': // Assuming backend expects lowercase translated values or specific keys.
            // The current implementation seems to send translated lowercase value.
            return T_options[optionKey].toLowerCase();
        default:
            return T_options[optionKey];
    }
  };

  return (
    <div className={styles.questionnaireContainer}>
      <h1 className={styles.questionnaireTitle}>{T.title}</h1>

      <form onSubmit={handleSubmit} className={styles.preferencesForm}>
        {/* Tipo de Comida */}
        <div className={styles.formGroup}>
          <label htmlFor="tipoComida">{T.labels.tipoComida}</label>
          <select id="tipoComida" name="tipoComida" multiple value={form.tipoComida} onChange={handleChange} className={styles.multiSelect} required>
            {Object.entries(T.options.tipoComida).map(([key, label]) => (
              <option key={key} value={getOptionValue('tipoComida', key)}>{label}</option>
            ))}
          </select>
        </div>

        {/* Precio */}
        <div className={styles.formGroup}>
          <label htmlFor="precio">{T.labels.precio}</label>
          <select id="precio" name="precio" value={form.precio[0] || ''} onChange={handleChange} required>
            <option value="" disabled>{T.options.precio.selectPlaceholder}</option>
            {Object.entries(T.options.precio).filter(([key]) => key !== 'selectPlaceholder').map(([key, label]) => (
              <option key={key} value={getOptionValue('precio', key)}>{label}</option>
            ))}
          </select>
        </div>

        {/* Alergias */}
        <div className={styles.formGroup}>
          <label htmlFor="alergias">{T.labels.alergias}</label>
          <select id="alergias" name="alergias" multiple value={form.alergias} onChange={handleChange} className={styles.multiSelect} required>
            {Object.entries(T.options.alergias).map(([key, label]) => (
              <option key={key} value={getOptionValue('alergias', key)}>{label}</option>
            ))}
          </select>
        </div>

        {/* Nivel de Picante */}
        <div className={styles.formGroup}>
          <label htmlFor="nivelPicante">{T.labels.nivelPicante}</label>
          <select id="nivelPicante" name="nivelPicante" multiple value={form.nivelPicante} onChange={handleChange} className={styles.multiSelect} required>
            {Object.entries(T.options.nivelPicante).map(([key, label]) => (
              <option key={key} value={getOptionValue('nivelPicante', key)}>{label}</option>
            ))}
          </select>
        </div>

        {/* Consideraciones Adicionales */}
        <div className={styles.formGroup}>
          <label htmlFor="consideraciones">{T.labels.consideraciones}</label>
          <textarea
            id="consideraciones"
            name="consideraciones"
            className={styles.consideracionesAdicionales}
            value={form.consideraciones}
            onChange={handleChange}
            placeholder={T.placeholders.consideraciones}
            rows="4"
          />
        </div>

        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? T.buttons.loading : T.buttons.submit}
        </button>
      </form>

      {error && (
        <div className={`${styles.result} ${styles.errorMessage}`}>
          <p>{error}</p>
        </div>
      )}

      {result && !error && (
        <div className={styles.result}>
          <h3>{T.results.recommendationsTitle}</h3>
          <ReactMarkdown components={markdownComponents} urlTransform={markdownUrlTransform}>
            {result}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default Questionnaire;