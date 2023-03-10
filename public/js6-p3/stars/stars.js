const { useState } = React;

function Star({ active, onMouseEnter, onMouseLeave, onLockIn }) {
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
};

function Stars() {
    const [rating, setRating] = useState(0);
    const [lockedRating, setLockedRating] = useState(0);
    const [cursorEnteredAgain, setCursorEnteredAgain] = useState(undefined);

    /* These two handlers are passed down to child components */
    const handleMouseEnter = (n) => setRating(n);
    const lockInRating = (n) => {
        setCursorEnteredAgain(false);
        setLockedRating(n);
    }

    /* Cursor enters/leaves the Stars component */
    const handleGroupMouseEnter = () => setCursorEnteredAgain(true);
    const handleGroupMouseLeave = () => setCursorEnteredAgain(false);

    let message = "Rate this demo?";
    let numActiveStars = 0;

    if (lockedRating > 0 && cursorEnteredAgain === false) {
        message = `You gave a ${lockedRating}-star rating`;
        numActiveStars = lockedRating;
    } else if (rating > 0) {
        message = `You are giving ${rating}-stars`;
        numActiveStars = rating;
    }

    const starComponents = Array(5).fill(null).map((_, i) => {
    return (
        <Star
        key={i}
        active={numActiveStars >= (i + 1)}
        onMouseEnter={() => handleMouseEnter(i + 1)}
        onLockIn={() => lockInRating(i + 1)}
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
            <div className="stars-message">
            {message}
            </div>
        </div>
    );
}

const domContainer = document.querySelector('#root');
const root = ReactDOM.createRoot(domContainer);
root.render(<Stars />);