import React, { useState } from "react";
import sendQuery from "./sendQuery.js";

function Star(props) {
  const { active, onMouseEnter, onMouseLeave, onLockIn } = props;

  return (
    <div
      className={active ? "star active" : "star"}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onLockIn}
    >
      <i className="fa-solid fa-star"></i>
    </div>
  );
}

export default function StarRating(props) {
  const [rating, setRating] = useState(props.initialRating || 0);
  const [lockedRating, setLockedRating] = useState(props.initialRating || 0);
  const [cursorEnteredAgain, setCursorEnteredAgain] = useState(true);

  const handleGroupMouseEnter = () => setCursorEnteredAgain(true);

  const handleGroupMouseLeave = () => setCursorEnteredAgain(false);

  const handleMouseEnter = (n) => setRating(n);

  const handleLockIn = (n) => {
    if (!props.editable) return;
    sendQuery(`mutation {
      rateLesson(title: "${props.lessonTitle}", rating: ${n}) {lessons {title, rating}}
    }`).then((data) => {
      if (data.rateLesson?.error) return handleLogout();
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

  const starComponents = Array(5)
    .fill(null)
    .map((_, i) => {
      return (
        <Star
          key={props.lessonTitle}
          active={numActiveStars >= i + 1}
          onMouseEnter={
            props.editable ? () => handleMouseEnter(i + 1) : () => {}
          }
          onLockIn={
            props.editable ? () => handleLockIn(i + 1) : () => {}
          }
        />
      );
    });

  return (
    <div
      className="stars"
      onMouseEnter={handleGroupMouseEnter}
      onMouseLeave={handleGroupMouseLeave}
    >
      {starComponents}
    </div>
  );
}
