const { useState, useEffect } = React;

const sendQuery = async (query) => {
  return fetch("/graphql", {
      method: "POST",
      headers: {
          "content-type": "application/json",
      },
      body: JSON.stringify({
          operationName: null,
          variables: {},
          query,
      }),
  })
      .then(r => r.json())
      .then(r => r.data);
};

const debounce = (fn, time) => {
  let timeout;
  return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
          fn();
      }, time);
  };
};



function PokemonSelection({name, image, onLogin}) {
  return (
    <div className="selectedSection">
      <h1>{name}</h1>
      <img src={image} />
      <button onClick={() => onLogin(name)}>Login</button>
    </div>
  );
};


function PokemonSuggestions({searchResults, searchBoxValue, onLoadPokemon}) {
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


function App() {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadedPokemon, setLoadedPokemon] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false); // is this needed...?
  
  if (loggedIn) {
    return (
      <div>
        <h1>You are logged in. Nice!</h1>
      </div>
    );
  }

  const authenticateUser = () => {
    sendQuery(`{
      user {name, image, lessons {title}},
      lessons {title}
    }`)
      .then(result => {
        if (result.user) {
          console.log('authenticated')
          console.log(result.user);
          setLoggedIn(true);
        }
      })
  };
  authenticateUser();

  /* Helper functions **************************/
  const searchPokemon = (str) => {
    (debounce(() => {
      sendQuery(`{search(str: "${str}") {name}}`)
        .then(result => {
          setSearchResults(result.search)
        })
        .catch(console.error);
    }, 500))();
  };

  const getPokemon = (name) => {
    sendQuery(`{getPokemon(str: "${name}") {name, image}}`)
      .then(result => {
        setLoadedPokemon(result.getPokemon)
      })
      .catch(console.error);
  };

  const loginPokemon = (name) => {
    sendQuery(`{login (pokemon: "${name}") {name}}`)
      .then(result => {
        console.log(result);
        setLoggedIn(true);
      })
      .catch(console.error);
  };

  /* Event Handlers ****************************/
  const handleSearch = (e) => {
    setLoadedPokemon(null);
    const str = e.currentTarget.value;
    setSearch(str);
    searchPokemon(str);
  };

  const handleLoadPokemon = (name) => {
    setSearchResults([]);
    getPokemon(name);
  };

  const handleLogin = (name) => {
    console.log('logging in...')
    loginPokemon(name);
  };

  return (
    <div>
      <h1>Pokemon Search</h1>
      <input
        className="searchBox"
        type="text"
        onChange={handleSearch}
        value={search}
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
          searchBoxValue={search}
          searchResults={searchResults}
          onLoadPokemon={handleLoadPokemon}
        />
      }
    </div>
  );
}

/* Helper function for sending Query to GraphQL server */

const domContainer = document.querySelector("#root");
const root = ReactDOM.createRoot(domContainer);
root.render(<App />);