import { Star } from 'lucide-react';
import { useState } from 'react';

const StarRating = ({ value = 0, onChange, readOnly = false, size = 20 }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange && onChange(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            className={`transition-transform duration-100 ${
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            }`}
          >
            <Star
              size={size}
              className={active ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-slate-600'}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
