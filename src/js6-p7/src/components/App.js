import React, { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { USER_QUERY, LESSONS_QUERY } from "../queriesAndMutations.js";
import { useAuth } from "./AuthContext.js";
import EnrollmentPage from "./EnrollmentPage.js";
import LoginPage from "./LoginPage.js";

// Helpful resource: handling multiple queries with useQuery
// https://atomizedobjects.com/blog/react/how-to-use-apollo-usequery-multiple-queries/

export default function App() {
  const {
    auth: [user, setUser],
  } = useAuth();

  const initialUser = useQuery(USER_QUERY, {
    fetchPolicy: "network-only",
    onCompleted: (data) => setUser(data.user),
  });

  const allLessons = useQuery(LESSONS_QUERY, {
    fetchPolicy: "network-only",
  });

  if (initialUser.loading || allLessons.loading) {
    console.log("Loading...");
    return null;
  }

  if (allLessons.error) {
    return (
      <>
        <h1>There was an error querying lessons.</h1>
        <h3>Something may be wrong with the GraphQL server.</h3>
      </>
    );
  }

  if (!user) {
    console.log("User not found... going to login page.");
    return <LoginPage />;
  }

  console.log(`Welcome, ${user.name}.`);
  return <EnrollmentPage allLessons={allLessons.data.lessons} />;
}
