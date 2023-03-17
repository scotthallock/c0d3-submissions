import React from 'react';

export default function PokemonSuggestions({searchResults, searchBoxValue, onLoadPokemon}) {
  const matches = searchResults.map((e, i) => {
    const pokemonName = e.name;

    const result = pokemonName.replace(
      searchBoxValue,
      `<span class="match">${searchBoxValue}</span>`
    );
  
    return (
      <h3
        key={i}
        dangerouslySetInnerHTML={{ __html: result}}
        onClick={() => onLoadPokemon(pokemonName)}
      />
    );
  });

  return <div className="suggestions">{matches}</div>;
}