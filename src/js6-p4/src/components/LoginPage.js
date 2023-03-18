import React, { useState } from 'react';
import PokemonSelection from './PokemonSelection.js';
import PokemonSuggestions from './PokemonSuggestions.js';
import sendQuery from './sendQuery.js';

const debounce = (fn, time) => {
  let timeout;
  return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
          fn();
      }, time);
  };
};

export default function LoginPage() {
  const [searchBox, setSearchBox] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadedPokemon, setLoadedPokemon] = useState(null);

  const searchPokemon = (str) => {
    (debounce(() => {
      sendQuery(`{search(str: "${str}") {name}}`)
        .then(data => setSearchResults(data.search))
        .catch(console.error);
    }, 500))();
  };

  const getPokemon = (name) => {
    sendQuery(`{getPokemon(str: "${name}") {name, image}}`)
      .then(data => setLoadedPokemon(data.getPokemon))
      .catch(console.error);
  };

  const handleSearch = (e) => {
    setLoadedPokemon(null);
    const str = e.currentTarget.value;
    setSearchBox(str);
    searchPokemon(str);
  };

  const handleLoadPokemon = (name) => {
    setSearchResults([]);
    getPokemon(name);
  };

  const handleLogin = (name) => {
    sendQuery(`{login (pokemon: "${name}") {name}}`)
      .then(data => window.location.reload())
      .catch(console.error);
  };

  return (
    <div>
      <h1>Pokemon Search</h1>
      <input
        className="searchBox"
        type="text"
        onChange={handleSearch}
        value={searchBox}
        />
      {
        loadedPokemon
        ? 
        <PokemonSelection
          name={loadedPokemon.name}
          image={loadedPokemon.image}
          onLogin={handleLogin}
        />
        :
        <PokemonSuggestions
          searchBoxValue={searchBox}
          searchResults={searchResults}
          onLoadPokemon={handleLoadPokemon}
        />
      }
    </div>
  );
}