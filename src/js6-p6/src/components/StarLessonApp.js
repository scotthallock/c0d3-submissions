import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext.js";
import EnrollmentPage from "./EnrollmentPage.js";
import LoginPage from "./LoginPage.js";
import sendQuery from "./sendQuery.js";

export default function App() {
  const { auth: [user, setUser] } = useAuth();
  const [allLessons, setAllLessons] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    sendQuery(`{
      lessons {title}
      user {name, image, lessons {title, rating, currentlyEnrolled}}
    }`).then((data) => {
      // If there an a "Not authorized" error, GraphQL server will return
      // data: {user: {error: {message: "Not authorized"} }, lessons: [...]}
      // GraphQL errors will be logged in the console as well.
      if (data.user.error) setUser(null);
      else setUser(data.user);

      if (data.lessons.error) setAllLessons(null);
      else setAllLessons(data.lessons);

      setLoaded(true);
    });
  }, []);

  // wait for queries to complete before rendering anything
  if (!loaded) {
    return null;
  }

  if (user && allLessons) {
    return <EnrollmentPage allLessons={allLessons} />;
  }

  return <LoginPage />;
}
