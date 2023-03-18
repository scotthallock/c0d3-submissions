import React, { useState } from 'react';
import EnrollmentPage from './EnrollmentPage.js';
import LoginPage from './LoginPage.js';
import sendQuery from './sendQuery.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [checkedSession, setCheckedSession] = useState(false);

  if (!checkedSession) {
    sendQuery(`{
      user {name, image, lessons {title}},
      lessons {title}
    }`)
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setAllLessons(data.lessons);
        }
        setCheckedSession(true);
      });

    return null; // render nothing until we verify if there is a valid session
  }

  if (user && allLessons) {
    return (
      <EnrollmentPage
        user={user}
        allLessons={allLessons}
      />
    );
  }

  return <LoginPage />;
}
