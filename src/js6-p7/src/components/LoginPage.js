import React, { useState, useCallback, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { SEARCH_QUERY, GET_POKEMON_QUERY, LOGIN_QUERY } from "../queriesAndMutations.js";

import { useAuth } from "./AuthContext.js";
import reactStringReplace from "react-string-replace";
import debounce from "lodash.debounce";

export default function LoginPage() {
  const { auth: [, setUser] } = useAuth();
  const [querySearch, search] = useLazyQuery(SEARCH_QUERY);
  const [queryPokemon, pokemon] = useLazyQuery(GET_POKEMON_QUERY);
  const [queryLogin, login] = useLazyQuery(LOGIN_QUERY);
  const [debouncedSearchBox, setDebouncedSearchBox] = useState("");

  if (login.data) {
    console.log("Logging in...")
    setUser(login.data.login);
  }

  const debouncedSearchPokemon = useCallback(
    debounce((str) => {
      querySearch({ variables: { str } });
      setDebouncedSearchBox(str);
    }, 500),
    []
  );

  return (
    <div>
      <h1>Pokemon Search</h1>
      <input
        className="searchBox"
        type="text"
        onChange={(e) => debouncedSearchPokemon(e.currentTarget.value)}
      />
      {pokemon.data?.getPokemon ? (
        <PokemonSelection
          name={pokemon.data.getPokemon.name}
          image={pokemon.data.getPokemon.image}
          handleLogin={(pokemon) => queryLogin( { variables: { pokemon }} )}
        />
      ) : (
        <PokemonSuggestions
          searchBoxValue={debouncedSearchBox}
          searchResults={search?.data?.search || []}
          onLoadPokemon={(str) => queryPokemon( { variables: { str }} )}
        />
      )}
    </div>
  );
}

function PokemonSelection({ name, image, handleLogin }) {
  return (
    <div className="selectedSection">
      <h1>{name}</h1>
      <img src={image} />
      <button onClick={() => handleLogin(name)}>Login</button>
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
