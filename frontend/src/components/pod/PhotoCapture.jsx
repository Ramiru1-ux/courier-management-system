import React, { useRef, useState } from 'react';
import { Camera, ImagePlus, Trash2 } from 'lucide-react';

const styles = `.photo-capture { display:grid; gap:10px; } .photo-input { display:none; } .photo-button { min-height:44px; display:inline-flex; align-items:center; justify-content:center; gap:7px; padding:10px 13px; border:1px solid #E3E7EF; border-radius:9px; background:#fff; color:#12213F; font-size:12px; font-weight:700; cursor:pointer; } .photo-preview { position:relative; min-height:120px; display:flex; align-items:center; justify-content:center; overflow:hidden; border:1px dashed #CBD3E2; border-radius:10px; background:#F9FAFC; color:#9AA1B4; font-size:11.5px; } .photo-preview img { width:100%; height:180px; object-fit:cover; } .photo-remove { position:absolute; top:8px; right:8px; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border:0; border-radius:8px; background:rgba(18,33,63,.8); color:#fff; cursor:pointer; }`;

export default function PhotoCapture({ onChange, accept = 'image/*', capture = 'environment' }) {
	const inputRef = useRef(null); const [preview, setPreview] = useState('');
	const handleChange = (event) => { const file = event.target.files?.[0]; if (!file) return; const url = URL.createObjectURL(file); setPreview(url); onChange?.(file); };
	const clear = () => { if (preview) URL.revokeObjectURL(preview); setPreview(''); if (inputRef.current) inputRef.current.value = ''; onChange?.(null); };
	return <div className="photo-capture"><style>{styles}</style><div className="photo-preview">{preview ? <><img src={preview} alt="Proof of delivery preview" /><button type="button" className="photo-remove" onClick={clear} aria-label="Remove proof photo"><Trash2 size={14} /></button></> : 'Add a clear delivery photo'}</div><input ref={inputRef} className="photo-input" type="file" accept={accept} capture={capture} onChange={handleChange} /><button type="button" className="photo-button" onClick={() => inputRef.current?.click()}>{preview ? <ImagePlus size={15} /> : <Camera size={15} />}{preview ? 'Replace photo' : 'Capture photo'}</button></div>;
}
