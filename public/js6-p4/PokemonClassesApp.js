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

function PokemonClassesApp() {

  useEffect(() => {
    (async () => {
      const { lessons } = await sendQuery(`{lessons {title}}`);
      console.log(lessons);
    })();
  }); 
  

  return (
    <h1>Waddup gamers</h1>
  );
}

/* Helper function for sending Query to GraphQL server */

const domContainer = document.querySelector("#root");
const root = ReactDOM.createRoot(domContainer);
root.render(<PokemonClassesApp />);