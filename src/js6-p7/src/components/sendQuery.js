import _ from "lodash";

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
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) {
        r.errors.forEach((error) => {
          // Tell the user about the error
          console.warn(`
------------------------------------
Error from GraphQL query at path ${error.path}:
message: "${error.message}"
------------------------------------
`);
          // Replace the data with the error message
          // (Not every error will have a path)
          if (error.path) {
            _.set(r.data, error.path, { error: { message: error.message } });
          }
        });
      }

      return r.data;
    })
    .catch(console.error);
}
