import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, readOnly = false, onChange, size = 18 }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  const handleClick = (value) => {
    if (!readOnly && onChange) {
      onChange(value);
    }
  };

  return (
    <div className="star-rating-container" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {/* SVG Gradient definition for half filled star */}
      <svg width="0" height="0" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
        <defs>
          <linearGradient id="half-star-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#cbd5e1" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>

      {[1, 2, 3, 4, 5].map((starValue) => {
        const isFilled = starValue <= Math.floor(displayRating);
        const isHalf = starValue === Math.ceil(displayRating) && displayRating % 1 !== 0 && !hoverRating;
        const isEmpty = !isFilled && !isHalf;

        return (
          <button
            key={starValue}
            type="button"
            disabled={readOnly}
            className={`star-btn ${readOnly ? 'read-only' : 'interactive'}`}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => !readOnly && setHoverRating(starValue)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            title={readOnly ? `Rating: ${rating} / 5` : `Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
            style={{
              background: 'none',
              border: 'none',
              padding: '1px',
              cursor: readOnly ? 'default' : 'pointer',
              lineHeight: 1,
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            <Star
              size={size}
              fill={
                isFilled
                  ? '#f59e0b'
                  : isHalf
                  ? 'url(#half-star-gradient)'
                  : 'transparent'
              }
              stroke={isEmpty ? '#cbd5e1' : '#f59e0b'}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
      {rating > 0 && readOnly && (
        <span className="rating-number-badge" style={{ marginLeft: '6px', marginRight: '6px', fontWeight: 700, fontSize: '0.875rem', color: '#d97706' }}>
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
