import React, { useEffect, useRef, useState } from 'react';
import { Eraser } from 'lucide-react';

const styles = `.signature-pad { border:1px solid #E3E7EF; border-radius:11px; overflow:hidden; background:#fff; } .signature-canvas { display:block; width:100%; height:170px; touch-action:none; cursor:crosshair; } .signature-toolbar { display:flex; align-items:center; justify-content:space-between; padding:9px 11px; border-top:1px solid #E3E7EF; color:#9AA1B4; font-size:11px; } .signature-clear { display:inline-flex; align-items:center; gap:5px; border:0; background:transparent; color:#3E7BFA; font-size:11px; font-weight:700; cursor:pointer; }`;

export default function SignaturePad({ onChange, width = 600, height = 170 }) {
	const canvasRef = useRef(null); const drawing = useRef(false); const [hasSignature, setHasSignature] = useState(false);
	useEffect(() => { const canvas = canvasRef.current; if (!canvas) return; const ratio = window.devicePixelRatio || 1; canvas.width = width * ratio; canvas.height = height * ratio; const context = canvas.getContext('2d'); context.scale(ratio, ratio); context.strokeStyle = '#12213F'; context.lineWidth = 2; context.lineCap = 'round'; }, [height, width]);
	const point = (event) => { const canvas = canvasRef.current; const rect = canvas.getBoundingClientRect(); const source = event.touches?.[0] || event; return { x: ((source.clientX - rect.left) / rect.width) * width, y: ((source.clientY - rect.top) / rect.height) * height }; };
	const start = (event) => { event.preventDefault(); const context = canvasRef.current.getContext('2d'); const position = point(event); context.beginPath(); context.moveTo(position.x, position.y); drawing.current = true; };
	const move = (event) => { if (!drawing.current) return; event.preventDefault(); const position = point(event); const context = canvasRef.current.getContext('2d'); context.lineTo(position.x, position.y); context.stroke(); setHasSignature(true); onChange?.(canvasRef.current.toDataURL('image/png')); };
	const stop = () => { drawing.current = false; };
	const clear = () => { const canvas = canvasRef.current; canvas.getContext('2d').clearRect(0, 0, width, height); setHasSignature(false); onChange?.(''); };
	return <div className="signature-pad"><style>{styles}</style><canvas ref={canvasRef} className="signature-canvas" style={{ aspectRatio: `${width}/${height}` }} onMouseDown={start} onMouseMove={move} onMouseUp={stop} onMouseLeave={stop} onTouchStart={start} onTouchMove={move} onTouchEnd={stop} aria-label="Signature drawing area" /><div className="signature-toolbar"><span>{hasSignature ? 'Signature captured' : 'Sign inside the box'}</span><button type="button" className="signature-clear" onClick={clear}><Eraser size={13} />Clear</button></div></div>;
}
