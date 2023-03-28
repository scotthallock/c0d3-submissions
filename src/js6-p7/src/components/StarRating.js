import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { RATE_LESSON_MUTATION } from "../queriesAndMutations.js";
import { useAuth } from "./AuthContext.js";

// Rules for rating lessons:
// - Users can only rate currently enrolled lessons
// - The rating is saved, even if a user unenrolls

export default function StarRating(props) {
  const { editable, lessonTitle, initialRating } = props;
  const {
    auth: [user],
    logout,
  } = useAuth();

  const [mutateRating, rating] = useMutation(RATE_LESSON_MUTATION);
  const [preview, setPreview] = useState(initialRating || 0);
  const [lockedRating, setLockedRating] = useState(initialRating || 0);
  const [cursorEnteredAgain, setCursorEnteredAgain] = useState(true);

  const handleGroupMouseEnter = () => setCursorEnteredAgain(true);

  const handleGroupMouseLeave = () => setCursorEnteredAgain(false);

  const handleLockIn = (numStars) => {
    setCursorEnteredAgain(false);
    mutateRating({
      variables: { title: lessonTitle, rating: numStars },
      onCompleted: () => {
        setLockedRating(numStars);
        console.log(
          `${user.name} just gave ${numStars} star(s) to "${lessonTitle}".`
        );
      },
    });
  };

  if (rating.error) {
    return logout();
  }

  let numActiveStars = 0;
  if (lockedRating === 0 && !cursorEnteredAgain) {
    // do nothing - user hasn't rated yet
  } else if (lockedRating > 0 && !cursorEnteredAgain) {
    numActiveStars = lockedRating;
  } else if (preview > 0) {
    numActiveStars = preview;
  }

  const stars = Array(5)
    .fill(null)
    .map((_, i) => {
      return (
        <div
          key={lessonTitle + i}
          className={numActiveStars >= i + 1 ? "star active" : "star"}
          onMouseEnter={() => editable && setPreview(i + 1)}
          onClick={() => editable && handleLockIn(i + 1)}
        >
          <i className="fa-solid fa-star"></i>
        </div>
      );
    });

  return (
    <div
      className={editable ? "stars" : "stars disabled"}
      onMouseEnter={handleGroupMouseEnter}
      onMouseLeave={handleGroupMouseLeave}
    >
      {stars}
    </div>
  );
}
