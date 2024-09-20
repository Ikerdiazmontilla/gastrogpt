import React, { useState } from 'react';
import './Questionnaire.css';
import ReactMarkdown from 'react-markdown'; 

const Questionnaire = () => {
  const [form, setForm] = useState({
    tipoComida: '',
    precio: '',
    alergias: '',
    nivelPicante: ''
  });

  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { tipoComida, precio, alergias, nivelPicante } = form;
    if (!tipoComida || !precio || !alergias || !nivelPicante) {
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
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tipo de Comida:</label>
          <select name="tipoComida" value={form.tipoComida} onChange={handleChange}>
            <option value="">Seleccione</option>
            <option value="carne">Carne</option>
            <option value="pescado">Pescado</option>
            <option value="marisco">Marisco</option>
            <option value="vegano">Vegano</option>
            <option value="vegetariano">Vegetariano</option>
          </select>
        </div>

        <div className="form-group">
          <label>Precio:</label>
          <select name="precio" value={form.precio} onChange={handleChange}>
            <option value="">Seleccione</option>
            <option value="menos de 15 euros">Menos de 15€</option>
            <option value="menos de 20 euros">Menos de 20€</option>
            <option value="menos de 30 euros">Menos de 30€</option>
            <option value="sin limite">Sin límite</option>
          </select>
        </div>

        <div className="form-group">
          <label>Alergias:</label>
          <select name="alergias" value={form.alergias} onChange={handleChange}>
            <option value="">Seleccione</option>
            <option value="ninguna">Ninguna</option>
            <option value="gluten">Gluten</option>
            <option value="lactosa">Lactosa</option>
            <option value="nueces">Nueces</option>
            <option value="mariscos">Mariscos</option>
          </select>
        </div>

        <div className="form-group">
          <label>Nivel de Picante:</label>
          <select name="nivelPicante" value={form.nivelPicante} onChange={handleChange}>
            <option value="">Seleccione</option>
            <option value="suave">Suave</option>
            <option value="medio">Medio</option>
            <option value="picante">Picante</option>
            <option value="muy picante">Muy Picante</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creando Menú...' : 'Crear Menú'}
        </button>
      </form>

      {result && (
        <div className="result">
          <h3>Recomendaciones:</h3>
          <p><ReactMarkdown>{result}</ReactMarkdown></p>
        </div>
      )}
    </div>
  );
};

export default Questionnaire;
