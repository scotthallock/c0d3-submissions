import React, { useState } from "react";
import { useAuth } from "./AuthContext.js";
import { useMutation } from "@apollo/client";
import { ENROLL_MUTATION, UNENROLL_MUTATION } from "../queriesAndMutations.js";
import StarRating from "./StarRating.js";

export default function EnrollmentPage({ allLessons }) {
  const {
    auth: [user],
    logout,
  } = useAuth();

  const [userLessons, setUserLessons] = useState(user.lessons);

  const [mutateEnroll, enroll] = useMutation(ENROLL_MUTATION, {
    onCompleted: (data) => setUserLessons(data.enroll.lessons),
  });

  const [mutateUnenroll, unenroll] = useMutation(UNENROLL_MUTATION, {
    onCompleted: (data) => setUserLessons(data.unenroll.lessons),
  });

  if (enroll.error || unenroll.error) {
    return logout();
  }

  const enrolledLessons = [];
  const notEnrolledLessons = [];

  allLessons.forEach((lsn) => {
    const { title } = lsn;
    const found = userLessons.find((usrLsn) => usrLsn.title === title);
    const rating = found?.rating;

    if (found?.currentlyEnrolled) {
      enrolledLessons.push(
        <div key={title} className="lesson-container">
          <h4 onClick={() => mutateUnenroll({ variables: { title } })}>
            {title}
          </h4>
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
        <h4 onClick={() => mutateEnroll({ variables: { title } })}>{title}</h4>
        <StarRating
          editable={false}
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
      <button onClick={logout}>Log out</button>
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
