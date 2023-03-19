import { SingleFieldSubscriptionsRule } from 'graphql';
import React, { useState, useEffect } from 'react';
import EnrollmentPage from './EnrollmentPage.js';
import LoginPage from './LoginPage.js';
import sendQuery from './sendQuery.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [allLessons, setAllLessons] = useState([]);

  console.log('rendering app...')
  console.log('user is ', user)
 
  useEffect(() => {
    console.log("USE EFFECT")
    sendQuery(`{
      user {name, image, lessons {title}},
      lessons {title}
    }`)
      .then(data => {
        if (data.user && data.lessons) {
          setUser(data.user);
          setAllLessons(data.lessons);
        }
      });
  }, []);

  const handleLogin = (user, lessons) => {
    setUser(user);
    setAllLessons(lessons);
  };

  const handleLogout = () => {
    setUser(null);
  }

  if (user && allLessons) {
    return (
      <EnrollmentPage
        user={user}
        allLessons={allLessons}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <LoginPage
      onLogin={handleLogin}
    />
  );
}
