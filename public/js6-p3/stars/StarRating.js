const { useState } = React;

function StarRating() {
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

  let message = "Rate this demo?";
  let numActiveStars = 0;

  if (lockedRating === 0 && !cursorEnteredAgain) {
    // do nothing - user hasn't rated yet
  } else if (lockedRating > 0 && !cursorEnteredAgain) {
    message = `You gave a ${lockedRating}-star rating`;
    numActiveStars = lockedRating;
  } else if (rating > 0) {
    message = `Give ${rating} stars?`;
    numActiveStars = rating;
  }

  const starComponents = Array(5)
    .fill(null)
    .map((_, i) => {
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
    <div className="stars-container">
      <div
        className="stars"
        onMouseEnter={handleGroupMouseEnter}
        onMouseLeave={handleGroupMouseLeave}
      >
        {starComponents}
      </div>
      <div className="stars-message">{message}</div>
    </div>
  );
}

const domContainer = document.querySelector("#root");
const root = ReactDOM.createRoot(domContainer);
root.render(<StarRating />);
