import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const Ratings = ({ rating = 0, votes = 0, size = 14 }) => {
  const stars = [];
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= full) {
      stars.push(<FaStar key={i} color="#ffc107" size={size} />);
    } else if (i === full + 1 && half) {
      stars.push(<FaStarHalfAlt key={i} color="#ffc107" size={size} />);
    } else {
      stars.push(<FaRegStar key={i} color="#ffc107" size={size} />);
    }
  }

  return (
    <span className="d-inline-flex align-items-center gap-1">
      {stars}
      {votes > 0 && (
        <small className="text-muted ml-1">({votes})</small>
      )}
    </span>
  );
};

export default Ratings;
