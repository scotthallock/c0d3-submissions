import React from 'react';
import PokemonProfile from './PokemonProfile.js';

export default function PokemonSelection({name, image, onLogin}) {
  return (
    <div className="selectedSection">
      <PokemonProfile name={name} image={image} />
      <button onClick={() => onLogin(name)}>Login</button>
    </div>
  );
}
