import React from "react";
import { useQuery } from "@apollo/client";
import { USER_QUERY, LESSONS_QUERY } from "../queriesAndMutations.js";

import { useAuth } from "./AuthContext.js";
import EnrollmentPage from "./EnrollmentPage.js";
import LoginPage from "./LoginPage.js";

// Helpful resource: handling multiple queries with useQuery
// https://atomizedobjects.com/blog/react/how-to-use-apollo-usequery-multiple-queries/

export default function App() {
  const {
    auth: [user , setUser],
  } = useAuth();
  const currentUser = useQuery(USER_QUERY);
  const allLessons = useQuery(LESSONS_QUERY);

  if (currentUser.loading || allLessons.loading) {
    console.log('Loading...')
    return null;
  }

  if (allLessons.error) {
    console.log(`Error querying lessons: ${allLessons.error.message}`);
    return <h1>There was an error querying lessons.</h1>
  }

  if (!user && currentUser?.data?.user) {
    console.log('Setting user...')
    setUser(currentUser.data.user);
    return null;
  }

  if (user && allLessons.data.lessons) {
    console.log(`Welcome back, ${user.name}.`)
    return <EnrollmentPage allLessons={allLessons.data.lessons}/>
  }

  console.log("User not found... going to login page.")
  return <LoginPage />
}
