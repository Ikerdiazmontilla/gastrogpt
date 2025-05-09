// src/components/Questionnaire/Questionnaire.js
import React, { useState, useEffect } from 'react'; // Added useEffect for potential future use if needed
import styles from './Questionnaire.module.css';
import ReactMarkdown from 'react-markdown';

const translations = {
  Español: {
    title: "¿Qué te gustaría comer hoy?",
    labels: {
      tipoComida: "Tipo de Comida:",
      precio: "Precio:",
      alergias: "Alergias:",
      nivelPicante: "Nivel de Picante:",
      consideraciones: "Consideraciones Adicionales (opcional):"
    },
    options: {
      tipoComida: {
        carne: "Carne",
        pescado: "Pescado",
        marisco: "Marisco",
        vegano: "Vegano",
        vegetariano: "Vegetariano",
        pasta: "Pasta",
        hamburguesa: "Hamburguesa",
        otro: "Otro (ver consideraciones)" // "lo que pone en consideraciones adicionales"
      },
      precio: {
        selectPlaceholder: "Selecciona un rango",
        val1: "Menos de 15€", // value="menos de 15 euros"
        val2: "Menos de 20€", // value="menos de 20 euros"
        val3: "Menos de 30€", // value="menos de 30 euros"
        val4: "Sin límite"     // value="sin limite"
      },
      alergias: {
        nada: "Ninguna",
        gluten: "Gluten",
        lactosa: "Lactosa",
        nueces: "Nueces",
        mariscos: "Mariscos",
        otro: "Otra (ver consideraciones)"
      },
      nivelPicante: {
        suave: "Suave",
        medio: "Medio",
        picante: "Picante",
        muyPicante: "Muy Picante"
      }
    },
    placeholders: {
      consideraciones: "Escribe aquí cualquier consideración adicional..."
    },
    buttons: {
      submit: "Crear Menú",
      loading: "Creando Menú..."
    },
    results: {
      recommendationsTitle: "Recomendaciones:"
    },
    errors: {
      requiredFields: "Por favor, completa todas las opciones requeridas (Tipo de Comida, Precio, Nivel de Picante).",
      requiredAlergias: "Por favor, selecciona al menos una opción para Alergias (puede ser \"Ninguna\").",
      fetchErrorPrefix: "Error: ",
      defaultFetchError: "Lo siento, ocurrió un error al generar las recomendaciones."
    }
  },
  English: {
    title: "What would you like to eat today?",
    labels: {
      tipoComida: "Type of Food:",
      precio: "Price:",
      alergias: "Allergies:",
      nivelPicante: "Spice Level:",
      consideraciones: "Additional Considerations (optional):"
    },
    options: {
      tipoComida: {
        carne: "Meat",
        pescado: "Fish",
        marisco: "Seafood",
        vegano: "Vegan",
        vegetariano: "Vegetarian",
        pasta: "Pasta",
        hamburguesa: "Burger",
        otro: "Other (see considerations)"
      },
      precio: {
        selectPlaceholder: "Select a range",
        val1: "Less than €15",
        val2: "Less than €20",
        val3: "Less than €30",
        val4: "No limit"
      },
      alergias: {
        nada: "None",
        gluten: "Gluten",
        lactosa: "Dairy",
        nueces: "Nuts",
        mariscos: "Shellfish",
        otro: "Other (see considerations)"
      },
      nivelPicante: {
        suave: "Mild",
        medio: "Medium",
        picante: "Spicy",
        muyPicante: "Very Spicy"
      }
    },
    placeholders: {
      consideraciones: "Write any additional considerations here..."
    },
    buttons: {
      submit: "Create Menu",
      loading: "Creating Menu..."
    },
    results: {
      recommendationsTitle: "Recommendations:"
    },
    errors: {
      requiredFields: "Please complete all required options (Type of Food, Price, Spice Level).",
      requiredAlergias: "Please select at least one option for Allergies (can be \"None\").",
      fetchErrorPrefix: "Error: ",
      defaultFetchError: "Sorry, an error occurred while generating recommendations."
    }
  }
};

const Questionnaire = ({ currentLanguage }) => { // Ensure currentLanguage is passed as a prop
  const [form, setForm] = useState({
    tipoComida: [],
    precio: [],
    alergias: [],
    nivelPicante: [],
    consideraciones: ''
  });

  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const T = translations[currentLanguage] || translations['Español']; // Fallback

  const handleChange = (e) => {
    const { name, options, value, tagName, type, checked } = e.target;

    if (tagName === 'SELECT') {
      if (e.target.multiple) {
        const selectedOptions = Array.from(options)
          .filter(option => option.selected)
          .map(option => option.value);
        setForm(prevForm => ({
          ...prevForm,
          [name]: selectedOptions
        }));
      } else {
        setForm(prevForm => ({
          ...prevForm,
          [name]: name === 'precio' ? [value] : value // Store precio as array to align with others
        }));
      }
    } else { // For textarea
      setForm(prevForm => ({
        ...prevForm,
        [name]: value
      }));
    }
  };

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

    const payload = {
      ...form,
      language: currentLanguage // Add current language to the payload
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/questionnaire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload) // Send payload with language
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.recommendations) {
        setResult(data.recommendations);
      } else {
        setResult(T.errors.defaultFetchError); // Or a more specific message
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

  return (
    <div className={styles.questionnaireContainer}>
      <h1 className={styles.questionnaireTitle}>{T.title}</h1>

      <form onSubmit={handleSubmit} className={styles.preferencesForm}>
        <div className={styles.formGroup}>
          <label htmlFor="tipoComida">{T.labels.tipoComida}</label>
          <select
            id="tipoComida"
            name="tipoComida"
            multiple
            value={form.tipoComida}
            onChange={handleChange}
            className={styles.multiSelect}
            required
          >
            <option value="carne">{T.options.tipoComida.carne}</option>
            <option value="pescado">{T.options.tipoComida.pescado}</option>
            <option value="marisco">{T.options.tipoComida.marisco}</option>
            <option value="vegano">{T.options.tipoComida.vegano}</option>
            <option value="vegetariano">{T.options.tipoComida.vegetariano}</option>
            <option value="pasta">{T.options.tipoComida.pasta}</option>
            <option value="hamburguesa">{T.options.tipoComida.hamburguesa}</option>
            <option value="lo que pone en consideraciones adicionales">{T.options.tipoComida.otro}</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="precio">{T.labels.precio}</label>
          <select
            id="precio"
            name="precio"
            value={form.precio[0] || ''} // Expects form.precio to be an array
            onChange={handleChange}
            required
          >
            <option value="" disabled>{T.options.precio.selectPlaceholder}</option>
            <option value="menos de 15 euros">{T.options.precio.val1}</option>
            <option value="menos de 20 euros">{T.options.precio.val2}</option>
            <option value="menos de 30 euros">{T.options.precio.val3}</option>
            <option value="sin limite">{T.options.precio.val4}</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="alergias">{T.labels.alergias}</label>
          <select
            id="alergias"
            name="alergias"
            multiple
            value={form.alergias}
            onChange={handleChange}
            className={styles.multiSelect}
            required
          >
            <option value="nada">{T.options.alergias.nada}</option>
            <option value="gluten">{T.options.alergias.gluten}</option>
            <option value="lactosa">{T.options.alergias.lactosa}</option>
            <option value="nueces">{T.options.alergias.nueces}</option>
            <option value="mariscos">{T.options.alergias.mariscos}</option>
            <option value="otro">{T.options.alergias.otro}</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="nivelPicante">{T.labels.nivelPicante}</label>
          <select
            id="nivelPicante"
            name="nivelPicante"
            multiple
            value={form.nivelPicante}
            onChange={handleChange}
            className={styles.multiSelect}
            required
          >
            <option value="suave">{T.options.nivelPicante.suave}</option>
            <option value="medio">{T.options.nivelPicante.medio}</option>
            <option value="picante">{T.options.nivelPicante.picante}</option>
            <option value="muy picante">{T.options.nivelPicante.muyPicante}</option>
          </select>
        </div>

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
          ></textarea>
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
          <ReactMarkdown>{result}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default Questionnaire;