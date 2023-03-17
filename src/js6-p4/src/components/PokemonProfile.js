import React from 'react';

export default function PokemonProfile({name, image}) {
  return (
    <>
      <h1>{name}</h1>
      <img src={image} />
    </>
  );
}