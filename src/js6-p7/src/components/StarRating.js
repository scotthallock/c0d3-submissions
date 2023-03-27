import React, { useState } from "react";
import sendQuery from "./sendQuery.js";
import { useAuth } from "./AuthContext.js";

// Rules for rating lessons:
// - Users can only rate currently enrolled lessons
// - The rating is saved, even if a user unenrolls

export default function StarRating(props) {
  const { editable, lessonTitle } = props;
  const { logout } = useAuth();
  const [rating, setRating] = useState(props.initialRating || 0);
  const [lockedRating, setLockedRating] = useState(props.initialRating || 0);
  const [cursorEnteredAgain, setCursorEnteredAgain] = useState(true);

  const handleGroupMouseEnter = () => setCursorEnteredAgain(true);

  const handleGroupMouseLeave = () => setCursorEnteredAgain(false);

  const handleLockIn = (n) => {
    sendQuery(`mutation {
      rateLesson(title: "${lessonTitle}", rating: ${n}) {lessons {title, rating}}
    }`).then((data) => {
      if (data.rateLesson?.error) return logout();
      setCursorEnteredAgain(false);
      setLockedRating(n);
    });
  };

  let numActiveStars = 0;

  if (lockedRating === 0 && !cursorEnteredAgain) {
    // do nothing - user hasn't rated yet
  } else if (lockedRating > 0 && !cursorEnteredAgain) {
    numActiveStars = lockedRating;
  } else if (rating > 0) {
    numActiveStars = rating;
  }

  const stars = Array(5)
    .fill(null)
    .map((_, i) => {
      return (
        <div
          key={lessonTitle + i}
          className={numActiveStars >= i + 1 ? "star active" : "star"}
          onMouseEnter={() => editable && setRating(i + 1)}
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
