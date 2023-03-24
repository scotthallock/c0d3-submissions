import React, { useState } from "react";
import sendQuery from "./sendQuery.js";
import { useAuth } from "./AuthContext.js";
import StarRating from "./StarRating.js";

export default function EnrollmentPage({ allLessons }) {
  const [user, setUser] = useAuth();
  const [enrolled, setEnrolled] = useState(user.lessons);

  const handleUnenroll = (title) => {
    sendQuery(`mutation {
      unenroll(title: "${title}") {lessons {title}}
    }`).then((data) => {
      if (data.unenroll?.error) return handleLogout();
      setEnrolled(data.unenroll.lessons);
    });
  };

  const handleEnroll = (title) => {
    sendQuery(`mutation {
      enroll(title: "${title}") {lessons {title}}
    }`).then((data) => {
      if (data.enroll?.error) return handleLogout();
      setEnrolled(data.enroll.lessons);
    });
  };

  const handleLogout = () => {
    sendQuery(`{ logout }`).then((data) => {
      return setUser(undefined);
    });
  };

  const enrolledLessons = enrolled.map((e) => {
    return (
      <div className="lesson-container">
        <h4 key={e.title} onClick={() => handleUnenroll(e.title)}>
          {e.title}
        </h4>
        <StarRating lessonTitle={e.title}/>
      </div>
    );
  });

  const notEnrolledLessons = allLessons
    .filter((e) => !enrolled.some((lesson) => lesson.title === e.title))
    .map((e) => {
      return (
        <h4 key={e.title} onClick={() => handleEnroll(e.title)}>
          {e.title}
        </h4>
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
