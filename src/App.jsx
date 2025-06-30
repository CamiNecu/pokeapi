//scr/app.js o cualquier otro componente padre
import React from 'react'
import PokemonFetcher from './PokemonFetcher' // Asegurate de que la ruta sea correcta


function App() {
  

  return (
    <>
      <h1>¡Conoce a tus Pokémon!</h1>
      <PokemonFetcher />
    </>
  )
}

export default App
