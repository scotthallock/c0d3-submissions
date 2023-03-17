import React from 'react';

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
};

export default Star;