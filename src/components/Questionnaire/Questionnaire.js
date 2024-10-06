import React, { useState } from 'react';
import './Questionnaire.css';
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

  const handleChange = (e) => {
    const { name, options, type, value } = e.target;
    if (type === 'select-multiple' || name === 'precio') {
      const selectedOptions = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value);
      setForm({
        ...form,
        [name]: selectedOptions
      });
    } else {
      setForm({
        ...form,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { tipoComida, precio, alergias, nivelPicante } = form;
    if (tipoComida.length === 0 || precio.length === 0 || alergias.length === 0 || nivelPicante.length === 0) {
      alert('Por favor, completa todas las opciones.');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/questionnaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (data.recommendations) {
        setResult(data.recommendations);
      } else if (data.error) {
        setResult(`Error: ${data.error}`);
      } else {
        setResult('No se recibieron recomendaciones.');
      }
    } catch (error) {
      console.error('Error al obtener las recomendaciones:', error);
      setResult('Lo siento, ocurrió un error al generar las recomendaciones.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="questionnaire-container">

      <h1 className='questionnaire-title'>¿Que te gustaría comer hoy?</h1>

      <form onSubmit={handleSubmit} className='preferences-form'>
        <div className="form-group">
          <label htmlFor="tipoComida">Tipo de Comida:</label>
          <select
            id="tipoComida"
            name="tipoComida"
            multiple
            value={form.tipoComida}
            onChange={handleChange}
            className="multi-select"
          >
            <option value="carne">Carne</option>
            <option value="pescado">Pescado</option>
            <option value="marisco">Marisco</option>
            <option value="vegano">Vegano</option>
            <option value="vegetariano">Vegetariano</option>
            <option value="pasta">Pasta</option>
            <option value="hamburguesa">Hamburguesa</option>
            <option value="lo que pone en consideraciones adicionales">Otro (poner en consideraciones adicionales)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="precio">Precio:</label>
          <select
            id="precio"
            name="precio"
            // multiple
            value={form.precio}
            onChange={handleChange}
            // className="multi-select"
          >
            <option value="menos de 15 euros">Menos de 15€</option>
            <option value="menos de 20 euros">Menos de 20€</option>
            <option value="menos de 30 euros">Menos de 30€</option>
            <option value="sin limite">Sin límite</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="alergias">Alergias:</label>
          <select
            id="alergias"
            name="alergias"
            multiple
            value={form.alergias}
            onChange={handleChange}
            className="multi-select"
          >
            <option value="nada">Ninguna</option>
            <option value="gluten">Gluten</option>
            <option value="lactosa">Lactosa</option>
            <option value="nueces">Nueces</option>
            <option value="mariscos">Mariscos</option>
            <option value="otro">Otra (poner en consideraciones adicionales)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="nivelPicante">Nivel de Picante:</label>
          <select
            id="nivelPicante"
            name="nivelPicante"
            multiple
            value={form.nivelPicante}
            onChange={handleChange}
            className="multi-select"
          >
            <option value="suave">Suave</option>
            <option value="medio">Medio</option>
            <option value="picante">Picante</option>
            <option value="muy picante">Muy Picante</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="consideraciones">Consideraciones Adicionales:</label>
          <textarea
            id="consideraciones"
            name="consideraciones"
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

      {result && (
        <div className="result">
          <h3>Recomendaciones:</h3>
          <ReactMarkdown>{result}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default Questionnaire;
