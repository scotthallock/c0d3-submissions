import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext.js";
import EnrollmentPage from "./EnrollmentPage.js";
import LoginPage from "./LoginPage.js";
import sendQuery from "./sendQuery.js";

export default function App() {
  const [user, setUser] = useAuth();
  const [allLessons, setAllLessons] = useState(null);

  useEffect(() => {
    sendQuery(`{
      lessons {title}
      user {name, image, lessons {title}}
    }`).then((data) => {
      // If there an a "Not authorized" error, GraphQL server will return
      // data: {user: {error: message: "Not authorized"}, lessons: [...]}
      // GraphQL errors will be logged in the console as well.

      if (data.user.error) setUser(undefined);
      else setUser(data.user);

      if (data.lessons.error) setAllLessons(undefined);
      else setAllLessons(data.lessons);
    });
  }, []);

  // wait for queries to complete before rendering anything
  if (user === null || allLessons === null) {
    return null;
  }

  if (user && allLessons) {
    return <EnrollmentPage allLessons={allLessons} />;
  }

  return <LoginPage />;
}
