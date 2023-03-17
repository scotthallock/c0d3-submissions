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

function PokemonSelection({name, image, onLogin}) {
  return (
    <div className="selectedSection">
      <h1>{name}</h1>
      <img src={image} />
      <button onClick={() => onLogin(name)}>Login</button>
    </div>
  );
};

function LoginPage() {
  const [searchBox, setSearchBox] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadedPokemon, setLoadedPokemon] = useState(null);

  /* Helper functions **************************/
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

  /* Event Handlers ****************************/
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

function EnrollmentPage({user, allLessons}) {
  const [enrolled, setEnrolled] = useState(user.lessons);

  const handleUnenroll = (title) => {
    sendQuery(`mutation {
      unenroll(title: "${title}") {lessons {title}}
    }`)
      .then(data => {
        if (!data.unenroll) { // e.g. not authorized
          return window.location.reload();
        }
        setEnrolled(data.unenroll.lessons);
      })
      .catch(console.error);
  };

  const handleEnroll = (title) => {
    sendQuery(`mutation {
      enroll(title: "${title}") {lessons {title}}
    }`)
      .then(data => {
        if (!data.enroll) { // e.g. not authorized
          return window.location.reload(); 
        }
        setEnrolled(data.enroll.lessons);
      })
      .catch(console.error);
  };

  const enrolledLessons = enrolled
    .map((e, i) => {
      return (
        <h4 key={i} onClick={() => handleUnenroll(e.title)}>{e.title}</h4>
      );
    });

  const notEnrolledLessons = allLessons
    .filter(e => !enrolled.some(lesson => lesson.title === e.title))
    .map((e, i) => {
      return (
        <h4 key={i} onClick={() => handleEnroll(e.title)}>{e.title}</h4>
      );
    });

  return (
    <div>
      <h1>{user.name}</h1>
      <img src={user.image}/>
      <hr />
      <div className="enrolledSection">
        <h2>Enrolled</h2>
        <p>Click to unenroll</p>
        {enrolledLessons}
      </div>
      <hr />
      <div className="notEnrolledSection">
        <h2>Not Enrolled</h2>
        <p>Click to enroll</p>
        {notEnrolledLessons}
      </div>
    </div>
  );
}


function App() {
  const [user, setUser] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [checkedSession, setCheckedSession] = useState(false);

  if (!checkedSession) {
    sendQuery(`{
      user {name, image, lessons {title}},
      lessons {title}
    }`)
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setAllLessons(data.lessons);
        }
        setCheckedSession(true);
      });

    return null; // render nothing until we check the session
  }

  if (user && allLessons) {
    return (
      <EnrollmentPage
        user={user}
        allLessons={allLessons}
      />
    );
  }

  return <LoginPage />;
}

const domContainer = document.querySelector("#root");
const root = ReactDOM.createRoot(domContainer);
root.render(<App />);