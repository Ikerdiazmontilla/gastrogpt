// src/components/Questionnaire/Questionnaire.js
import React, { useState } from 'react';
import './Questionnaire.css';
import ReactMarkdown from 'react-markdown';

const Questionnaire = () => {
  const [form, setForm] = useState({
    tipoComida: [],
    precio: [], // Backend espera un array, frontend ahora maneja single select
    alergias: [],
    nivelPicante: [],
    consideraciones: ''
  });

  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // Estado para mensajes de error más específicos

  const handleChange = (e) => {
    const { name, options, type, value, tagName } = e.target;

    if (tagName === 'SELECT') {
      if (e.target.multiple) { // Para selects múltiples
        const selectedOptions = Array.from(options)
          .filter(option => option.selected)
          .map(option => option.value);
        setForm(prevForm => ({
          ...prevForm,
          [name]: selectedOptions
        }));
      } else { // Para selects simples (como precio)
        setForm(prevForm => ({
          ...prevForm,
          // El backend espera un array para 'precio', así que lo envolvemos
          [name]: name === 'precio' ? [value] : value
        }));
      }
    } else { // Para textarea
      setForm(prevForm => ({
        ...prevForm,
        [name]: value
      }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiar errores previos
    const { tipoComida, precio, alergias, nivelPicante } = form;

    // Validación Frontend (básica, el backend también valida)
    if (tipoComida.length === 0 || precio.length === 0 || nivelPicante.length === 0) {
      // Nota: Alergias puede ser "nada", así que no lo hacemos estrictamente obligatorio aquí si se envía "nada".
      // El backend espera un array, incluso para "nada" si se selecciona.
      setError('Por favor, completa todas las opciones requeridas (Tipo de Comida, Precio, Nivel de Picante).');
      // alert('Por favor, completa todas las opciones requeridas (Tipo de Comida, Precio, Nivel de Picante).'); // Usar estado de error en vez de alert
      return;
    }
    if (alergias.length === 0) { // Si se requiere que 'alergias' tenga al menos una selección (ej: "nada")
         setError('Por favor, selecciona al menos una opción para Alergias (puede ser "Ninguna").');
        //  alert('Por favor, selecciona al menos una opción para Alergias (puede ser "Ninguna").');
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
        // IMPORTANTE: Incluir credenciales para enviar la cookie de sesión
        credentials: 'include',
        body: JSON.stringify(form) // El 'form' ya está en el formato correcto
      });

      const data = await response.json();

      if (!response.ok) {
        // Si el backend envía un error estructurado, usarlo.
        throw new Error(data.error || `Error HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.recommendations) {
        setResult(data.recommendations);
      } else {
        // Esto no debería ocurrir si el backend responde bien
        setResult('No se recibieron recomendaciones válidas.');
        console.warn("Respuesta inesperada del backend (questionnaire):", data);
      }
    } catch (err) {
      console.error('Error al obtener las recomendaciones:', err);
      // Mostrar el mensaje de error al usuario
      setError(`Error: ${err.message || 'Lo siento, ocurrió un error al generar las recomendaciones.'}`);
      setResult(''); // Limpiar resultados previos si hay error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="questionnaire-container">
      <h1 className='questionnaire-title'>¿Qué te gustaría comer hoy?</h1>

      <form onSubmit={handleSubmit} className='preferences-form'>
        {/* Tipo de Comida */}
        <div className="form-group">
          <label htmlFor="tipoComida">Tipo de Comida:</label>
          <select
            id="tipoComida"
            name="tipoComida"
            multiple
            value={form.tipoComida}
            onChange={handleChange}
            className="multi-select"
            required // Añadir validación HTML5 básica
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

        {/* Precio */}
        <div className="form-group">
          <label htmlFor="precio">Precio:</label>
          <select
            id="precio"
            name="precio"
            // El backend espera un array, pero el select es simple.
            // El handleChange lo convierte a array [value]
            value={form.precio[0] || ''} // Tomar el primer elemento para el valor del select
            onChange={handleChange}
            required
          >
            <option value="" disabled>Selecciona un rango</option> {/* Opción placeholder */}
            <option value="menos de 15 euros">Menos de 15€</option>
            <option value="menos de 20 euros">Menos de 20€</option>
            <option value="menos de 30 euros">Menos de 30€</option>
            <option value="sin limite">Sin límite</option>
          </select>
        </div>

        {/* Alergias */}
        <div className="form-group">
          <label htmlFor="alergias">Alergias:</label>
          <select
            id="alergias"
            name="alergias"
            multiple
            value={form.alergias}
            onChange={handleChange}
            className="multi-select"
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

        {/* Nivel de Picante */}
        <div className="form-group">
          <label htmlFor="nivelPicante">Nivel de Picante:</label>
          <select
            id="nivelPicante"
            name="nivelPicante"
            multiple
            value={form.nivelPicante}
            onChange={handleChange}
            className="multi-select"
            required
          >
            <option value="suave">Suave</option>
            <option value="medio">Medio</option>
            <option value="picante">Picante</option>
            <option value="muy picante">Muy Picante</option>
          </select>
        </div>

        {/* Consideraciones Adicionales */}
        <div className="form-group">
          <label htmlFor="consideraciones">Consideraciones Adicionales (opcional):</label>
          <textarea
            id="consideraciones"
            name="consideraciones"
            className='consideraciones-adicionales'
            value={form.consideraciones}
            onChange={handleChange}
            placeholder="Escribe aquí cualquier consideración adicional..."
            rows="4"
          ></textarea>
        </div>

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Creando Menú...' : 'Crear Menú'}
        </button>
      </form>

      {/* Mostrar mensajes de error */}
      {error && (
        <div className="error-message result"> {/* Podrías darle un estilo específico a los errores */}
          <p>{error}</p>
        </div>
      )}

      {/* Mostrar resultados */}
      {result && !error && ( // Solo mostrar resultados si no hay error y hay resultado
        <div className="result">
          <h3>Recomendaciones:</h3>
          <ReactMarkdown>{result}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default Questionnaire;