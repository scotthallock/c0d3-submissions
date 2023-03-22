import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext.js";
import EnrollmentPage from "./EnrollmentPage.js";
import LoginPage from "./LoginPage.js";
import sendQuery from "./sendQuery.js";

export default function App() {
  const [user, setUser] = useAuth();
  const [allLessons, setAllLessons] = useState(null);

  useEffect(() => {
    sendQuery(`{ user {name, image, lessons {title}} }`).then((data) => {
      if (data.user) setUser(data.user);
      else setUser(undefined);
    });
  }, []);

  useEffect(() => {
    sendQuery(`{ lessons {title} }`).then((data) => {
      if (data.lessons) {
        setAllLessons(data.lessons);
      } else {
        setAllLessons(undefined);
        console.error("lessons Query failed");
      }
    });
  }, []);


  if (user === null || allLessons === null) {
    // wait for queries to complete before rendering anything
    return null;
  }

  if (user && allLessons) {
    return <EnrollmentPage allLessons={allLessons} />;
  }

  return <LoginPage />;
}
