import React, { useState } from 'react';
import { Star } from 'lucide-react';

const styles = `.rating-stars{display:inline-flex;align-items:center;gap:3px}.rating-star{display:inline-flex;border:0;background:transparent;padding:2px;color:#D7DCE7;cursor:pointer}.rating-star.active{color:#F5A524}.rating-star.readonly{cursor:default}.rating-value{margin-left:7px;color:#697086;font-size:12px;font-weight:700}`;

export default function RatingStars({ value = 0, max = 5, onChange = () => {}, readOnly = false, showValue = true }) {
	const [hovered, setHovered] = useState(0);
	const displayValue = hovered || value;
	return <div className="rating-stars" onMouseLeave={() => !readOnly && setHovered(0)}><style>{styles}</style>{Array.from({ length: max }, (_, index) => { const rating = index + 1; return <button key={rating} type="button" aria-label={`${rating} star${rating > 1 ? 's' : ''}`} className={`rating-star ${rating <= displayValue ? 'active' : ''} ${readOnly ? 'readonly' : ''}`} onMouseEnter={() => !readOnly && setHovered(rating)} onClick={() => !readOnly && onChange(rating)}><Star size={17} fill={rating <= displayValue ? 'currentColor' : 'none'} /></button>; })}{showValue ? <span className="rating-value">{Number(value).toFixed(1)}</span> : null}</div>;
}
