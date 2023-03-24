import React, { useState } from "react";
import sendQuery from "./sendQuery.js";
import { useAuth } from "./AuthContext.js";
import StarRating from "./StarRating.js";

// filter out lessons that the user was once enrolled in, but no longer is
const getEnrolledLessons = (lessons) => {
  return lessons.filter(lsn => lsn.currentlyEnrolled);
};

export default function EnrollmentPage({ allLessons }) {
  const [user, setUser] = useAuth();
  const [enrolled, setEnrolled] = useState(getEnrolledLessons(user.lessons));

  const handleUnenroll = (title) => {
    sendQuery(`mutation {
      unenroll(title: "${title}") {lessons {title, rating, currentlyEnrolled}}
    }`).then((data) => {
      if (data.unenroll?.error) return handleLogout();
      const lessons = data.unenroll.lessons;
      setEnrolled(getEnrolledLessons(lessons)); 
    });
  };

  const handleEnroll = (title) => {
    sendQuery(`mutation {
      enroll(title: "${title}") {lessons {title, rating, currentlyEnrolled}}
    }`).then((data) => {
      if (data.enroll?.error) return handleLogout();
      const lessons = data.enroll.lessons;
      setEnrolled(getEnrolledLessons(lessons)); 
    });
  };

  const handleLogout = () => { // SHOULD THIS BE MOVED TO AUTHCONTEXT?
    sendQuery(`{ logout }`).then((data) => {
      return setUser(undefined);
    });
  };

  console.log({enrolled})

  // Users can only rate currently enrolled lessons.
  // The rating is saved even if a user unenrolls.
  // The rating can only be changed while a user is enrolled.
  const enrolledLessons = enrolled.map((e) => {
    return (
      <div key={e.title} className="lesson-container">
        <h4 onClick={() => handleUnenroll(e.title)}>
          {e.title}
        </h4>
        <StarRating
          editable={true}
          lessonTitle={e.title}
          initialRating={e.rating}
        />
      </div>
    );
  });

  const notEnrolledLessons = allLessons
    .filter((e) => !enrolled.some((lesson) => lesson.title === e.title))
    .map((e) => {
      return (
        <div key={e.title} className="lesson-container">
          <h4 onClick={() => handleEnroll(e.title)}>
            {e.title}
          </h4>
          <StarRating
            editable={false}
            lessonTitle={e.title}
            initialRating={e.rating}
          />
        </div>
      );
    });

  return (
    <div>
      <h1>{user.name}</h1>
      <img src={user.image} />
      <br />
      <button onClick={handleLogout}>Log out</button>
      <hr />
      {enrolledLessons.length > 0 ? (
        <>
          <div className="enrolledSection">
            <h2>Enrolled</h2>
            <p>Click to unenroll</p>
            {enrolledLessons}
          </div>
          <hr />
        </>
      ) : null}
      {notEnrolledLessons.length > 0 ? (
        <div className="notEnrolledSection">
          <h2>Not Enrolled</h2>
          <p>Click to enroll</p>
          {notEnrolledLessons}
        </div>
      ) : null}
    </div>
  );
}
