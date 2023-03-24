import React, { useState } from 'react';
import { useAuth } from "./AuthContext.js";
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
  const [user, ] = useAuth();
  const [rating, setRating] = useState(0); // should be props.initialRating or something
  const [lockedRating, setLockedRating] = useState(0);
  const [cursorEnteredAgain, setCursorEnteredAgain] = useState(true);

  /* These two handlers are passed down to child components */
  const handleMouseEnter = (n) => {
    setRating(n);
  };
  const handleLockIn = (n) => {
    // send a mutation request
    console.log(`... sending query ...`);

    sendQuery(`mutation {
      rateLesson(title: "${props.lessonTitle}", rating: ${n}) {lessons {title, rating}}
    }`).then((data) => {
      console.log(data);
      if (data.rateLesson?.error) return handleLogout();
      setCursorEnteredAgain(false);
      setLockedRating(n); // change
    });
  };

  /* Track when cursor leaves or enters the StarRating component */
  const handleGroupMouseEnter = () => setCursorEnteredAgain(true);
  const handleGroupMouseLeave = () => setCursorEnteredAgain(false);

  let numActiveStars = 0;

  if (lockedRating === 0 && !cursorEnteredAgain) {
    // do nothing - user hasn't rated yet
  } else if (lockedRating > 0 && !cursorEnteredAgain) {
    numActiveStars = lockedRating;
  } else if (rating > 0) {
    numActiveStars = rating;
  }

  const starComponents = Array(5).fill(null).map((_, i) => {
    return (
      <Star
        key={i}
        active={numActiveStars >= i + 1}
        onMouseEnter={() => handleMouseEnter(i + 1)}
        onLockIn={() => handleLockIn(i + 1)}
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