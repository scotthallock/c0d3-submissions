import React from 'react';

export default function PokemonSelection({name, image, onLogin}) {
  return (
    <div className="selectedSection">
      <h1>{name}</h1>
      <img src={image}/>
      <button onClick={() => onLogin(name)}>Login</button>
    </div>
  );
}
