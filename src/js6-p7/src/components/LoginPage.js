import React, { useState, useCallback } from "react";
import { useLazyQuery } from "@apollo/client";
import {
  SEARCH_QUERY,
  GET_POKEMON_QUERY,
  LOGIN_QUERY,
} from "../queriesAndMutations.js";
import { useAuth } from "./AuthContext.js";
import reactStringReplace from "react-string-replace";
import debounce from "lodash.debounce";

export default function LoginPage() {
  const {
    auth: [, setUser],
  } = useAuth();

  // !! Important: { fetchPolicy: "network-only" } !!
  // This tells Apollo Client to ignore the cache and make the network request.
  // This is important so we can login, logout, and re-login as the same user.

  // Don't need fetchPolicy: "network-only" because we can use cached results.
  const [querySearch, search] = useLazyQuery(SEARCH_QUERY);
  const [queryPokemon] = useLazyQuery(GET_POKEMON_QUERY);

  // NEED fetchPolicy: "network-only" because we need the server to create a session.
  const [queryLogin] = useLazyQuery(LOGIN_QUERY, { fetchPolicy: "network-only" });

  const [loadedPokemon, setLoadedPokemon] = useState(null);
  const [debouncedSearchBox, setDebouncedSearchBox] = useState("");

  const debouncedSearchPokemon = useCallback(
    debounce((str) => {
      querySearch({
        variables: { str },
        onCompleted: () => {
          setDebouncedSearchBox(str);
        },
      });
    }, 500),
    []
  );

  const handleLogin = (pokemon) => {
    queryLogin({
      variables: { pokemon },
      onCompleted: (data) => setUser(data.login),
    });
  };

  const loadPokemon = (str) => {
    queryPokemon({
      variables: { str },
      onCompleted: (data) => setLoadedPokemon(data.getPokemon),
    });
  };

  return (
    <div>
      <h1>Pokemon Search</h1>
      <input
        className="searchBox"
        type="text"
        onChange={(e) => {
          debouncedSearchPokemon(e.currentTarget.value);
          setLoadedPokemon(null);
        }}
      />
      {loadedPokemon ? (
        <PokemonSelection
          name={loadedPokemon.name}
          image={loadedPokemon.image}
          handleLogin={handleLogin}
        />
      ) : (
        <PokemonSuggestions
          searchBoxValue={debouncedSearchBox}
          searchResults={search.data?.search || []}
          loadPokemon={loadPokemon}
        />
      )}
    </div>
  );
}

/* ====== CHILD COMPONENTS ====== */

function PokemonSelection({ name, image, handleLogin }) {
  return (
    <div className="selectedSection">
      <h1>{name}</h1>
      <img src={image} />
      <button onClick={() => handleLogin(name)}>Login</button>
    </div>
  );
}

function PokemonSuggestions({ searchResults, searchBoxValue, loadPokemon }) {
  const matches = searchResults.map((e, i) => {
    const pokemonName = e.name;

    const result = reactStringReplace(pokemonName, searchBoxValue, (match) => (
      <span className="match">{match}</span>
    ));

    return (
      <h3 key={pokemonName} onClick={() => loadPokemon(pokemonName)}>
        {result}
      </h3>
    );
  });

  return <div className="suggestions">{matches}</div>;
}
