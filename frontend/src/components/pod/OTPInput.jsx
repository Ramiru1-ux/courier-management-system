import React, { useEffect, useRef, useState } from 'react';

const styles = `.otp-input { display:flex; gap:8px; } .otp-cell { width:42px; height:46px; border:1.5px solid #E3E7EF; border-radius:9px; text-align:center; color:#12213F; font:700 18px 'Sora',sans-serif; } .otp-cell:focus { outline:none; border-color:#F5A524; box-shadow:0 0 0 4px rgba(245,165,36,.12); } @media(max-width:420px){.otp-input{gap:5px}.otp-cell{width:36px}}`;

export default function OTPInput({ length = 4, value, onChange, disabled = false }) {
	const controlled = value !== undefined;
	const [internal, setInternal] = useState('');
	const refs = useRef([]);
	const current = String(controlled ? value : internal).replace(/\D/g, '').slice(0, length).padEnd(length, '');

	useEffect(() => { if (!controlled) setInternal((previous) => previous.replace(/\D/g, '').slice(0, length)); }, [controlled, length]);

	const update = (next) => { const clean = next.replace(/\D/g, '').slice(0, length); if (!controlled) setInternal(clean); onChange?.(clean); return clean; };
	const handleChange = (index, event) => { const digit = event.target.value.replace(/\D/g, '').slice(-1); const next = current.split(''); next[index] = digit; const clean = update(next.join('')); if (digit && index < length - 1) refs.current[index + 1]?.focus(); if (!clean) refs.current[0]?.focus(); };
	const handleKeyDown = (index, event) => { if (event.key === 'Backspace' && !current[index] && index > 0) refs.current[index - 1]?.focus(); };
	const handlePaste = (event) => { event.preventDefault(); const clean = update(event.clipboardData.getData('text')); refs.current[Math.min(clean.length, length - 1)]?.focus(); };

	return <div className="otp-input" role="group" aria-label="One-time passcode"><style>{styles}</style>{Array.from({ length }, (_, index) => <input key={index} ref={(element) => { refs.current[index] = element; }} className="otp-cell" inputMode="numeric" maxLength={1} value={current[index] || ''} disabled={disabled} onChange={(event) => handleChange(index, event)} onKeyDown={(event) => handleKeyDown(index, event)} onPaste={handlePaste} aria-label={`OTP digit ${index + 1}`} />)}</div>;
}
