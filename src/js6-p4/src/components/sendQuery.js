export default function sendQuery(query) {
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
      .then(r => {
        if (r.errors && r.errors.some(obj => obj.message === 'Not authorized')) {
            console.log('Not authorized');
        }
        return r.data;
      })
      .catch(console.error);
}