import React, { useState, useCallback } from "react";
import { useAuth } from "./AuthContext.js";
import reactStringReplace from "react-string-replace";
import debounce from "lodash.debounce";
import sendQuery from "./sendQuery.js";

export default function LoginPage() {
  const {
    auth: [, setUser],
  } = useAuth();
  const [searchBox, setSearchBox] = useState("");
  const [debouncedSearchBox, setDebouncedSearchBox] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadedPokemon, setLoadedPokemon] = useState(null);

  const debouncedSearchPokemon = useCallback(
    debounce((str) => {
      sendQuery(`{search(str: "${str}") {name}}`).then((data) => {
        setSearchResults(data.search);
        setDebouncedSearchBox(str);
      });
    }, 500),
    []
  );

  const getPokemon = (name) => {
    sendQuery(`{getPokemon(str: "${name}") {name, image}}`).then((data) =>
      setLoadedPokemon(data.getPokemon)
    );
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
      login(pokemon: "${name}") {name, image, lessons {title, rating, currentlyEnrolled}}
    }`).then((data) => {
      if (data.login) {
        setUser(data.login);
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
      {loadedPokemon ? (
        <PokemonSelection
          name={loadedPokemon.name}
          image={loadedPokemon.image}
          onLogin={handleLogin}
        />
      ) : (
        <PokemonSuggestions
          searchBoxValue={debouncedSearchBox}
          searchResults={searchResults}
          onLoadPokemon={handleLoadPokemon}
        />
      )}
    </div>
  );
}

function PokemonSelection({ name, image, onLogin }) {
  return (
    <div className="selectedSection">
      <h1>{name}</h1>
      <img src={image} />
      <button onClick={() => onLogin(name)}>Login</button>
    </div>
  );
}

function PokemonSuggestions({ searchResults, searchBoxValue, onLoadPokemon }) {
  const matches = searchResults.map((e, i) => {
    const pokemonName = e.name;

    const result = reactStringReplace(pokemonName, searchBoxValue, (match) => (
      <span className="match">{match}</span>
    ));

    return (
      <h3 key={pokemonName} onClick={() => onLoadPokemon(pokemonName)}>
        {result}
      </h3>
    );
  });

  return <div className="suggestions">{matches}</div>;
}
