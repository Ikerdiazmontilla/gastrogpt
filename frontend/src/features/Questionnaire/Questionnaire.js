import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './Questionnaire.module.css';
import ReactMarkdown from 'react-markdown';
import { questionnaireTranslations } from '../../data/translations';

import { submitQuestionnaire } from '../../services/apiService';

import { createMarkdownLinkRenderer, markdownUrlTransform } from '../../utils/markdownUtils';

const Questionnaire = ({ currentLanguage, onViewDishDetails }) => {
  const initialFormState = useMemo(() => ({
    tipoComida: [],
    precio: [15, 30],
    alergias: [],
    nivelPicante: [],
    consideraciones: ''
  }), []);

  const [form, setForm] = useState(initialFormState);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const T = questionnaireTranslations[currentLanguage] || questionnaireTranslations['Español'];

  useEffect(() => {
    setForm(initialFormState);
    setResult('');
    setError('');
  }, [currentLanguage, initialFormState]);

  const handleChange = useCallback((e) => {
    const { name, value: rawValue, options, tagName, type, checked } = e.target;
    setError('');

    setForm(prevForm => {
      let newForm = { ...prevForm };

      if (name === "precioMin") {
        const newMin = parseFloat(rawValue);
        if (newMin > prevForm.precio[1]) {
          newForm.precio = [newMin, newMin];
        } else {
          newForm.precio = [newMin, prevForm.precio[1]];
        }
      } else if (name === "precioMax") {
        const newMax = parseFloat(rawValue);
        if (newMax < prevForm.precio[0]) {
          newForm.precio = [newMax, newMax];
        } else {
          newForm.precio = [prevForm.precio[0], newMax];
        }
      } else if (tagName === 'SELECT') {
        let newFieldValue;
        if (e.target.multiple) {
          newFieldValue = Array.from(options)
            .filter(option => option.selected)
            .map(option => option.value);
        } else {
          newFieldValue = rawValue ? [rawValue] : [];
        }
        newForm[name] = newFieldValue;
      } else if (type === 'checkbox') {
        const currentValues = prevForm[name] || [];
        if (checked) {
          newForm[name] = [...currentValues, rawValue];
        } else {
          newForm[name] = currentValues.filter(item => item !== rawValue);
        }
      } else {
        newForm[name] = rawValue;
      }
      return newForm;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const { tipoComida, precio, alergias, nivelPicante } = form;

    if (tipoComida.length === 0 || nivelPicante.length === 0) {
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
        setResult(T.errors.defaultFetchError);
        console.warn("Unexpected response from backend (questionnaire):", data);
      }
    } catch (err) {
      console.error('Error getting recommendations:', err);
      setError(`${T.errors.fetchErrorPrefix}${err.message || T.errors.defaultFetchError}`);
      setResult('');
    } finally {
      setLoading(false);
    }
  };

  const markdownComponents = useMemo(() => ({
    a: createMarkdownLinkRenderer(onViewDishDetails, styles)
  }), [onViewDishDetails]);

  const getOptionValue = (category, optionKey) => {
    const T_options = T.options[category];
    if (!T_options || !T_options[optionKey]) return optionKey;
    switch (category) {
      case 'tipoComida':
        return optionKey === "otro" ? "lo que pone en consideraciones adicionales" : T_options[optionKey];
      case 'alergias':
      case 'nivelPicante':
        return T_options[optionKey].toLowerCase();
      default:
        return T_options[optionKey];
    }
  };

  const minPriceSlider = 15;
  const maxPriceSlider = 30;
  const priceRange = maxPriceSlider - minPriceSlider;
  const fillLeftPercent = ((form.precio[0] - minPriceSlider) / priceRange) * 100;
  const fillRightPercent = ((maxPriceSlider - form.precio[1]) / priceRange) * 100;


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

        {/* Precio - Dual Pointer Range Slider */}
        <div className={styles.formGroup}>
          <label htmlFor="precioMin">{T.labels.precio}</label>
          <div className={styles.priceRangeDisplay}>
            {T.options.precio.minLabel || 'Min'}: {form.precio[0]} € - {T.options.precio.maxLabel || 'Max'}: {form.precio[1]} €
          </div>
          <div
            className={styles.priceRangeSliderComposite}
            data-no-tab-swipe="true" // <-- ADDED ATTRIBUTE HERE
          >
            <div className={styles.sliderTrack}></div>
            <div
              className={styles.sliderFill}
              style={{ left: `${fillLeftPercent}%`, right: `${fillRightPercent}%` }}
            ></div>
            <input
              type="range"
              id="precioMin"
              name="precioMin"
              className={`${styles.rangeSliderInput} ${styles.minRangeSlider}`}
              min={minPriceSlider}
              max={maxPriceSlider}
              step="1"
              value={form.precio[0]}
              onChange={handleChange}
              aria-label={T.options.precio.minAriaLabel || "Minimum price"}
            />
            <input
              type="range"
              id="precioMax"
              name="precioMax"
              className={`${styles.rangeSliderInput} ${styles.maxRangeSlider}`}
              min={minPriceSlider}
              max={maxPriceSlider}
              step="1"
              value={form.precio[1]}
              onChange={handleChange}
              aria-label={T.options.precio.maxAriaLabel || "Maximum price"}
            />
          </div>
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