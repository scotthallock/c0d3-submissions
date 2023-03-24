import React from 'react';

const { useState } = React;

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

export default function StarRating() {
  const [rating, setRating] = useState(0);
  const [lockedRating, setLockedRating] = useState(0);
  const [cursorEnteredAgain, setCursorEnteredAgain] = useState(true);

  /* These two handlers are passed down to child components */
  const handleMouseEnter = (n) => {
    setRating(n);
  };
  const handleLockIn = (n) => {
    setCursorEnteredAgain(false);
    setLockedRating(n);
  };

  /* Track when cursor leaves or enters the StarRating component */
  const handleGroupMouseEnter = () => setCursorEnteredAgain(true);
  const handleGroupMouseLeave = () => setCursorEnteredAgain(false);

  let message = "Not yet rated";
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