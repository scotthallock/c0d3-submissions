import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { AuthProvider } from "./components/AuthContext.js";
import App from "./components/App.js";

const root = createRoot(document.getElementById("root"));

// Need this so cookies are sent to server and we can verify session
const link = createHttpLink({
  uri: "/graphql",
  credentials: "include",
});

const client = new ApolloClient({
  uri: "https://scotthallock-c0d3.onrender.com/graphql",
  cache: new InMemoryCache(),
  link,
});

root.render(
  <StrictMode>
    <AuthProvider>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </AuthProvider>
  </StrictMode>
);
