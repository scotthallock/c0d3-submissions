import React, { useState } from "react";
import sendQuery from "./sendQuery.js";
import { useAuth } from "./AuthContext.js";
import StarRating from "./StarRating.js";

// filter out lessons that the user was once enrolled in, but no longer is
const getEnrolledLessons = (lessons) => {
  return lessons.filter((lsn) => lsn.currentlyEnrolled);
};

export default function EnrollmentPage({ allLessons }) {
  const [user, setUser] = useAuth();
  // const [enrolled, setEnrolled] = useState(getEnrolledLessons(user.lessons));
  // lessons in which the user is currently enrolled, or was once enrolled
  const [userLessons, setUserLessons] = useState(user.lessons);

  const handleUnenroll = (title) => {
    sendQuery(`mutation {
      unenroll(title: "${title}") {lessons {title, rating, currentlyEnrolled}}
    }`).then((data) => {
      if (data.unenroll?.error) return handleLogout();
      // const lessons = data.unenroll.lessons;
      // setEnrolled(getEnrolledLessons(lessons));
      setUserLessons(data.unenroll.lessons);
    });
  };

  const handleEnroll = (title) => {
    sendQuery(`mutation {
      enroll(title: "${title}") {lessons {title, rating, currentlyEnrolled}}
    }`).then((data) => {
      if (data.enroll?.error) return handleLogout();
      // const lessons = data.enroll.lessons;
      // setEnrolled(getEnrolledLessons(lessons));
      setUserLessons(data.enroll.lessons);
    });
  };

  const handleLogout = () => {
    // SHOULD THIS BE MOVED TO AUTHCONTEXT?
    sendQuery(`{ logout }`).then((data) => {
      return setUser(undefined);
    });
  };

  // Rules for rating:
  // - Users can only rate currently enrolled lessons
  // - The rating is saved even if a user unenrolls

  const enrolledLessons = [];
  const notEnrolledLessons = [];

  allLessons.forEach((lsn) => {
    const { title } = lsn;
    const found = userLessons.find((usrLsn) => usrLsn.title === title);
    const rating = found?.rating;

    if (found && found.currentlyEnrolled) {
      enrolledLessons.push(
        <div key={title} className="lesson-container">
          <h4 onClick={() => handleUnenroll(title)}>{title}</h4>
          <StarRating
            editable={true}
            lessonTitle={title}
            initialRating={rating}
          />
        </div>
      );
      return;
    }

    notEnrolledLessons.push(
      <div key={title} className="lesson-container">
        <h4 onClick={() => handleEnroll(title)}>{title}</h4>
        <StarRating
          editable={false} // not editable
          lessonTitle={title}
          initialRating={rating}
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
