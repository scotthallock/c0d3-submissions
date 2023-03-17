import React from 'react';
import PokemonProfile from './PokemonProfile.js';
import sendQuery from './sendQuery.js';

const { useState } = React;

export default function EnrollmentPage({user, allLessons}) {
  const [enrolled, setEnrolled] = useState(user.lessons);

  const handleUnenroll = (title) => {
    sendQuery(`mutation {
      unenroll(title: "${title}") {lessons {title}}
    }`)
      .then(data => {
        if (!data.unenroll) { // e.g. not authorized
          return window.location.reload();
        }
        setEnrolled(data.unenroll.lessons);
      })
      .catch(console.error);
  };

  const handleEnroll = (title) => {
    sendQuery(`mutation {
      enroll(title: "${title}") {lessons {title}}
    }`)
      .then(data => {
        if (!data.enroll) { // e.g. not authorized
          return window.location.reload(); 
        }
        setEnrolled(data.enroll.lessons);
      })
      .catch(console.error);
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
      <PokemonProfile name={user.name} image={user.image} />
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