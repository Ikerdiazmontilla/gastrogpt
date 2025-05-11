// src/components/Questionnaire/Questionnaire.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './Questionnaire.module.css';
import ReactMarkdown from 'react-markdown';
import { findDishById } from '../../data/menuData';

const translations = {
  Español: {
    title: "¿Qué te gustaría comer hoy?",
    labels: { tipoComida: "Tipo de Comida:", precio: "Precio:", alergias: "Alergias:", nivelPicante: "Nivel de Picante:", consideraciones: "Consideraciones Adicionales (opcional):" },
    options: { tipoComida: { carne: "Carne", pescado: "Pescado", marisco: "Marisco", vegano: "Vegano", vegetariano: "Vegetariano", pasta: "Pasta", hamburguesa: "Hamburguesa", otro: "Otro (ver consideraciones)" }, precio: { selectPlaceholder: "Selecciona un rango", val1: "Menos de 15€", val2: "Menos de 20€", val3: "Menos de 30€", val4: "Sin límite" }, alergias: { nada: "Ninguna", gluten: "Gluten", lactosa: "Lactosa", nueces: "Nueces", mariscos: "Mariscos", otro: "Otra (ver consideraciones)" }, nivelPicante: { suave: "Suave", medio: "Medio", picante: "Picante", muyPicante: "Muy Picante" } },
    placeholders: { consideraciones: "Escribe aquí cualquier consideración adicional..." },
    buttons: { submit: "Crear Menú", loading: "Creando Menú..." },
    results: { recommendationsTitle: "Recomendaciones:" },
    errors: { requiredFields: "Por favor, completa todas las opciones requeridas (Tipo de Comida, Precio, Nivel de Picante).", requiredAlergias: "Por favor, selecciona al menos una opción para Alergias (puede ser \"Ninguna\").", fetchErrorPrefix: "Error: ", defaultFetchError: "Lo siento, ocurrió un error al generar las recomendaciones." }
  },
  English: {
    title: "What would you like to eat today?",
    labels: { tipoComida: "Type of Food:", precio: "Price:", alergias: "Allergies:", nivelPicante: "Spice Level:", consideraciones: "Additional Considerations (optional):" },
    options: { tipoComida: { carne: "Meat", pescado: "Fish", marisco: "Seafood", vegano: "Vegan", vegetariano: "Vegetarian", pasta: "Pasta", hamburguesa: "Burger", otro: "Other (see considerations)" }, precio: { selectPlaceholder: "Select a range", val1: "Less than €15", val2: "Less than €20", val3: "Less than €30", val4: "No limit" }, alergias: { nada: "None", gluten: "Gluten", lactosa: "Dairy", nueces: "Nuts", mariscos: "Shellfish", otro: "Other (see considerations)" }, nivelPicante: { suave: "Mild", medio: "Medium", picante: "Spicy", muyPicante: "Very Spicy" } },
    placeholders: { consideraciones: "Write any additional considerations here..." },
    buttons: { submit: "Create Menu", loading: "Creating Menu..." },
    results: { recommendationsTitle: "Recommendations:" },
    errors: { requiredFields: "Please complete all required options (Type of Food, Price, Spice Level).", requiredAlergias: "Please select at least one option for Allergies (can be \"None\").", fetchErrorPrefix: "Error: ", defaultFetchError: "Sorry, an error occurred while generating recommendations." }
  }
};

// Define CustomLink component outside Questionnaire
const CustomQuestionnaireLink = ({ href, children, node, onViewDishDetails, ...rest }) => {
  // console.log("Questionnaire CustomLink props:", JSON.stringify({ href, children }, null, 2));
  if (href && href.startsWith('dish:')) {
    const dishIdString = href.split(':')[1];
    const dish = findDishById(dishIdString);
    if (dish) {
      return (
        <button
          className={styles.dishLink}
          onClick={() => {
            if (onViewDishDetails) {
              onViewDishDetails(dish);
            } else {
              console.error("Questionnaire: onViewDishDetails prop not provided.");
            }
          }}
          {...rest}
        >
          {children}
        </button>
      );
    } else {
      console.warn(`Questionnaire: Dish with ID '${dishIdString}' not found. Markdown: [${String(children)}](${href})`);
      return <span {...rest}>{children} (detalle no disponible)</span>;
    }
  }
  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>;
  }
  return <span {...rest}>{children}</span>;
};


const Questionnaire = ({ currentLanguage, onViewDishDetails }) => {
  const initialFormState = {
    tipoComida: [], precio: [], alergias: [], nivelPicante: [], consideraciones: ''
  };
  const [form, setForm] = useState(initialFormState);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const T = translations[currentLanguage] || translations['Español'];

  useEffect(() => {
    // Optionally reset form and results when language changes
    // setForm(initialFormState);
    setResult('');
    setError('');
  }, [currentLanguage]);

  const handleChange = useCallback((e) => {
    const { name, options, value, tagName } = e.target;
    setError(''); // Clear error on any change

    setForm(prevForm => {
      let newFieldValue;
      if (tagName === 'SELECT') {
        if (e.target.multiple) {
          newFieldValue = Array.from(options)
            .filter(option => option.selected)
            .map(option => option.value);
        } else {
          newFieldValue = [value]; // Store single select as array for consistency
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
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/questionnaire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Error HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.recommendations) {
        setResult(data.recommendations);
      } else {
        setResult(T.errors.defaultFetchError);
        console.warn("Respuesta inesperada del backend (questionnaire):", data);
      }
    } catch (err) {
      console.error('Error al obtener las recomendaciones:', err);
      setError(`${T.errors.fetchErrorPrefix}${err.message || T.errors.defaultFetchError}`);
      setResult('');
    } finally {
      setLoading(false);
    }
  };

  const markdownComponents = useMemo(() => ({
    a: (props) => <CustomQuestionnaireLink {...props} onViewDishDetails={onViewDishDetails} />
  }), [onViewDishDetails]);

  const urlTransform = useCallback((uri) => {
    // console.log("Questionnaire urlTransform received:", uri);
    if (uri.startsWith('dish:')) {
      return uri;
    }
    try {
      const parsedUrl = new URL(uri);
      if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
        return uri;
      }
    } catch (e) { /* Not a standard absolute URL */ }
    return null;
  }, []);

  // Helper to generate select options, especially for i18n values
  const getOptionValue = (category, optionKey) => {
    const T_options = T.options[category];
    if (!T_options || !T_options[optionKey]) return optionKey; // Fallback to key if not found

    // Specific value mapping for backend if needed, otherwise use translated label or a fixed key
    switch (category) {
        case 'tipoComida':
            return optionKey === "otro" ? "lo que pone en consideraciones adicionales" : T_options[optionKey]; // Using translated label as value, or specific key
        case 'precio':
            // Backend expects specific string values like "menos de 15 euros"
            if (optionKey === 'val1') return "menos de 15 euros";
            if (optionKey === 'val2') return "menos de 20 euros";
            if (optionKey === 'val3') return "menos de 30 euros";
            if (optionKey === 'val4') return "sin limite";
            return T_options[optionKey]; // Fallback
        case 'alergias':
        case 'nivelPicante':
            return T_options[optionKey].toLowerCase(); // e.g., "gluten", "suave"
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
          <ReactMarkdown components={markdownComponents} urlTransform={urlTransform}>
            {result}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default Questionnaire;