import React, { useState, useEffect } from 'react';
import EnrollmentPage from './EnrollmentPage.js';
import LoginPage from './LoginPage.js';
import sendQuery from './sendQuery.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [checkedSession, setCheckedSession] = useState(false);

  useEffect(() => {
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
      })
      .catch(console.error);
  });

  const handleLogin = (user, lessons) => {
    setUser(user);
    setAllLessons(lessons);
  };

  if (!checkedSession) {
    return null;
  }

  if (user && allLessons) {
    return (
      <EnrollmentPage
        user={user}
        allLessons={allLessons}
      />
    );
  }

  return (
    <LoginPage
      onLogin={handleLogin}
    />
  );
}
