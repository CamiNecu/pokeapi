import React, { useState, useEffect } from 'react';
import './PokemonFetcher.css';

// Función para capitalizar nombres
const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

const PokemonFetcher = () => {
  const [pokemonesAleatorios, setPokemonesAleatorios] = useState([]);
  const [pokemonesPorTipo, setPokemonesPorTipo] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Cargar Pokémon aleatorios al montar el componente
  const fetchPokemonesAleatorios = async () => {
    try {
      setCargando(true);
      setError(null);
      const fetchedPokemones = [];
      const pokemonIds = new Set();

      while (pokemonIds.size < 8) {
        const randomId = Math.floor(Math.random() * 898) + 1;
        pokemonIds.add(randomId);
      }

      const idsArray = Array.from(pokemonIds);

      for (const id of idsArray) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
        if (!response.ok) {
          throw new Error(`Error al cargar el Pokémon con ID ${id}: ${response.statusText}`);
        }
        const data = await response.json();
        fetchedPokemones.push({
          id: data.id,
          nombre: data.name,
          imagen: data.sprites.front_default,
          tipos: data.types.map(typeInfo => typeInfo.type.name),
        });
      }

      setPokemonesAleatorios(fetchedPokemones);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchPokemonesAleatorios();
  }, []);

  // Obtener lista de tipos desde la API
  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const res = await fetch('https://pokeapi.co/api/v2/type/');
        const data = await res.json();
        const tiposValidos = data.results.filter(t => !["shadow", "unknown"].includes(t.name));
        setTipos(tiposValidos);
      } catch (err) {
        console.error('Error al obtener tipos:', err);
      }
    };

    fetchTipos();
  }, []);

  // Manejar cambio de tipo
  const handleTipoChange = async (e) => {
    const tipo = e.target.value;
    setTipoSeleccionado(tipo);
    if (!tipo) {
      setPokemonesPorTipo([]);
      return;
    }

    try {
      setCargando(true);
      setError(null);
      const res = await fetch(`https://pokeapi.co/api/v2/type/${tipo}`);
      const data = await res.json();

      const pokes = data.pokemon; // TODOS los Pokémon del tipo seleccionado

      const detalles = [];

      for (const poke of pokes) {
        const pokeRes = await fetch(poke.pokemon.url);
        const pokeData = await pokeRes.json();

        // Solo agregar si tiene imagen para evitar espacios en blanco
        if (pokeData.sprites.front_default) {
          detalles.push({
            id: pokeData.id,
            nombre: pokeData.name,
            imagen: pokeData.sprites.front_default,
            tipos: pokeData.types.map(t => t.type.name),
          });
        }
      }

      setPokemonesPorTipo(detalles);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="pokemon-container">
      <h2>Tus 8 Pokémon Aleatorios</h2>

      <button onClick={fetchPokemonesAleatorios} style={{marginBottom: '20px'}}>
        Rerrol 
      </button>

      {cargando && <div>Cargando Pokémon...</div>}
      {error && <div className="error">Error: {error}</div>}

      <div className="pokemon-list">
        {pokemonesAleatorios.map(pokemon => (
          <div key={pokemon.id} className="pokemon-card">
            <h3>{capitalizar(pokemon.nombre)}</h3>
            <img src={pokemon.imagen} alt={pokemon.nombre} />
            <p>Tipos: {pokemon.tipos.map(capitalizar).join(', ')}</p>
          </div>
        ))}
      </div>

      <hr style={{ margin: '30px 0' }} />

      <div className="tipo-selector">
        <label htmlFor="tipo">Buscar por tipo:</label>
        <select id="tipo" value={tipoSeleccionado} onChange={handleTipoChange}>
          <option value="">-- Selecciona un tipo --</option>
          {tipos.map(t => (
            <option key={t.name} value={t.name}>
              {capitalizar(t.name)}
            </option>
          ))}
        </select>
      </div>

      {pokemonesPorTipo.length > 0 && (
        <>
          <h2>Pokémon tipo {capitalizar(tipoSeleccionado)}</h2>
          <div className="pokemon-list">
            {pokemonesPorTipo.map(pokemon => (
              <div key={pokemon.id} className="pokemon-card">
                <h3>{capitalizar(pokemon.nombre)}</h3>
                <img src={pokemon.imagen} alt={pokemon.nombre} />
                <p>Tipos: {pokemon.tipos.map(capitalizar).join(', ')}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PokemonFetcher;