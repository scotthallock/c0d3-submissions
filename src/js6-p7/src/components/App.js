import React from "react";
import { gql, useQuery } from "@apollo/client";
import { useAuth } from "./AuthContext.js";
import EnrollmentPage from "./EnrollmentPage.js";
import LoginPage from "./LoginPage.js";

// Helpful resource: multiple queries with useQuery
// https://atomizedobjects.com/blog/react/how-to-use-apollo-usequery-multiple-queries/

const LESSONS_QUERY = gql`
  query getLessons {
    lessons {
      title
    }
  }
`;

const USER_QUERY = gql`
  query getUser {
    user {
      name,
      image,
      lessons {
        title
        rating,
        currentlyEnrolled
      }
    }
  }
`;

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
