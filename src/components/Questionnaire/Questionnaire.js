// src/components/Questionnaire/Questionnaire.js
// src/components/Questionnaire/Questionnaire.js
import React, { useState } from 'react';
import styles from './Questionnaire.module.css'; // Changed import
import ReactMarkdown from 'react-markdown';

const Questionnaire = () => {
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

  const handleChange = (e) => {
    const { name, options, value, tagName } = e.target;

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
          [name]: name === 'precio' ? [value] : value
        }));
      }
    } else {
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
      setError('Por favor, completa todas las opciones requeridas (Tipo de Comida, Precio, Nivel de Picante).');
      return;
    }
    if (alergias.length === 0) {
         setError('Por favor, selecciona al menos una opción para Alergias (puede ser "Ninguna").');
         return;
    }

    setLoading(true);
    setResult('');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/questionnaire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.recommendations) {
        setResult(data.recommendations);
      } else {
        setResult('No se recibieron recomendaciones válidas.');
        console.warn("Respuesta inesperada del backend (questionnaire):", data);
      }
    } catch (err) {
      console.error('Error al obtener las recomendaciones:', err);
      setError(`Error: ${err.message || 'Lo siento, ocurrió un error al generar las recomendaciones.'}`);
      setResult('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.questionnaireContainer}>
      <h1 className={styles.questionnaireTitle}>¿Qué te gustaría comer hoy?</h1>

      <form onSubmit={handleSubmit} className={styles.preferencesForm}>
        <div className={styles.formGroup}>
          <label htmlFor="tipoComida">Tipo de Comida:</label>
          <select
            id="tipoComida"
            name="tipoComida"
            multiple
            value={form.tipoComida}
            onChange={handleChange}
            className={styles.multiSelect} // Assuming multiSelect is a defined style
            required
          >
            <option value="carne">Carne</option>
            <option value="pescado">Pescado</option>
            <option value="marisco">Marisco</option>
            <option value="vegano">Vegano</option>
            <option value="vegetariano">Vegetariano</option>
            <option value="pasta">Pasta</option>
            <option value="hamburguesa">Hamburguesa</option>
            <option value="lo que pone en consideraciones adicionales">Otro (ver consideraciones)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="precio">Precio:</label>
          <select
            id="precio"
            name="precio"
            value={form.precio[0] || ''}
            onChange={handleChange}
            required
            // No specific class here, will inherit from .formGroup select if defined
          >
            <option value="" disabled>Selecciona un rango</option>
            <option value="menos de 15 euros">Menos de 15€</option>
            <option value="menos de 20 euros">Menos de 20€</option>
            <option value="menos de 30 euros">Menos de 30€</option>
            <option value="sin limite">Sin límite</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="alergias">Alergias:</label>
          <select
            id="alergias"
            name="alergias"
            multiple
            value={form.alergias}
            onChange={handleChange}
            className={styles.multiSelect} // Assuming multiSelect is a defined style
            required
          >
            <option value="nada">Ninguna</option>
            <option value="gluten">Gluten</option>
            <option value="lactosa">Lactosa</option>
            <option value="nueces">Nueces</option>
            <option value="mariscos">Mariscos</option>
            <option value="otro">Otra (ver consideraciones)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="nivelPicante">Nivel de Picante:</label>
          <select
            id="nivelPicante"
            name="nivelPicante"
            multiple
            value={form.nivelPicante}
            onChange={handleChange}
            className={styles.multiSelect} // Assuming multiSelect is a defined style
            required
          >
            <option value="suave">Suave</option>
            <option value="medio">Medio</option>
            <option value="picante">Picante</option>
            <option value="muy picante">Muy Picante</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="consideraciones">Consideraciones Adicionales (opcional):</label>
          <textarea
            id="consideraciones"
            name="consideraciones"
            className={styles.consideracionesAdicionales} // was consideraciones-adicionales
            value={form.consideraciones}
            onChange={handleChange}
            placeholder="Escribe aquí cualquier consideración adicional..."
            rows="4"
          ></textarea>
        </div>

        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? 'Creando Menú...' : 'Crear Menú'}
        </button>
      </form>

      {error && (
        <div className={`${styles.result} ${styles.errorMessage}`}> {/* Add specific error style if needed */}
          <p>{error}</p>
        </div>
      )}

      {result && !error && (
        <div className={styles.result}>
          <h3>Recomendaciones:</h3>
          <ReactMarkdown>{result}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default Questionnaire;