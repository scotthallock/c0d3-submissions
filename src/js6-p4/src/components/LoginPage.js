import React, { useState, useMemo } from 'react';
import debounce from 'lodash.debounce';
import sendQuery from './sendQuery.js';

export default function LoginPage({ onLogin }) {
  const [searchBox, setSearchBox] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadedPokemon, setLoadedPokemon] = useState(null);

  const debouncedSearchPokemon = useMemo(() => {
    return debounce(str => {
      sendQuery(`{search(str: "${str}") {name}}`)
        .then(data => setSearchResults(data.search));
    }, 500)
  }, []);

  const getPokemon = (name) => {
    sendQuery(`{getPokemon(str: "${name}") {name, image}}`)
      .then(data => setLoadedPokemon(data.getPokemon));
  };

  const handleSearch = (e) => {
    setLoadedPokemon(null);
    const str = e.currentTarget.value;
    setSearchBox(str);
    debouncedSearchPokemon(str);
  };

  const handleLoadPokemon = (name) => {
    setSearchResults([]);
    getPokemon(name);
  };

  const handleLogin = (name) => {
    sendQuery(`{
      login(pokemon: "${name}") {name, image, lessons {title}},
      lessons {title}
    }`)
      .then(data => {
        if (data.login && data.lessons) {
          onLogin(data.login, data.lessons);
        }
      });
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

function PokemonSelection({ name, image, onLogin }) {
  return (
    <div className="selectedSection">
      <h1>{name}</h1>
      <img src={image}/>
      <button onClick={() => onLogin(name)}>Login</button>
    </div>
  );
}

function PokemonSuggestions({ searchResults, searchBoxValue, onLoadPokemon }) {
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

