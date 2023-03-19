import React, { useState } from 'react';
import sendQuery from './sendQuery.js';

export default function EnrollmentPage({ user, allLessons, onLogout }) {
  const [enrolled, setEnrolled] = useState(user.lessons);

  console.log('enrollment page render')

  const handleUnenroll = (title) => {
    sendQuery(`mutation {
      unenroll(title: "${title}") {lessons {title}}
    }`)
      .then(data => {
        if (!data.unenroll) { // e.g. not authorized
          return onLogout();
        }
        setEnrolled(data.unenroll.lessons);
      });
  };

  const handleEnroll = (title) => {
    sendQuery(`mutation {
      enroll(title: "${title}") {lessons {title}}
    }`)
      .then(data => {
        if (!data.enroll) { // e.g. not authorized
          return onLogout();
        }
        setEnrolled(data.enroll.lessons);
      });
  };

  const enrolledLessons = enrolled
    .map((e, i) => {
      return (
        <h4 key={i} onClick={() => handleUnenroll(e.title)}>{e.title}</h4>
      );
    });

  const notEnrolledLessons = allLessons
    .filter(e => !enrolled.some(lesson => lesson.title === e.title))
    .map((e, i) => {
      return (
        <h4 key={i} onClick={() => handleEnroll(e.title)}>{e.title}</h4>
      );
    });

  return (
    <div>
      <h1>{user.name}</h1>
      <img src={user.image}/>
      <br />
      <button onClick={onLogout}>Log out</button>
      <hr />
      <div className="enrolledSection">
        <h2>Enrolled</h2>
        <p>Click to unenroll</p>
        {enrolledLessons}
      </div>
      <hr />
      <div className="notEnrolledSection">
        <h2>Not Enrolled</h2>
        <p>Click to enroll</p>
        {notEnrolledLessons}
      </div>
    </div>
  );
}