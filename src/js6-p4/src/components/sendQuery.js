/**
 * Ideally I would like to import { useAuth } from AuthContext.js
 * into this module, and if there is a "Not authorized" error sent back
 * by the GraphQL server, we can call the setUser(null) function.
 * 
 * However, this is not a React component, so it doesn't seem possible.
 * 
 * Another thing I don't like about this is the error handling...
 * 
 * If the GraphQL query includes:
 * - queries that require authorization
 * - queries that do NOT require authorization
 * 
 * If the user is not authorized, this function will return an
 * {error: message: { " ... " }} object without the data that the user
 * SHOULD have access to.
 * 
 * Do have a suggestion for how to improve this?
 */

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
      if (
        r.errors &&
        r.errors.some((obj) => obj.message === "Not authorized")
      ) {
        console.log("Not authorized");
        return { error: { message: "Not authorized" } };
      }
      return r.data;
    })
    .catch(console.error);
}