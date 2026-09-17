import React, { useRef, useState } from 'react';
import { Camera, FileText, ImagePlus, Trash2 } from 'lucide-react';
import { POD_ACCEPT, getPodFileError, isPdfFile } from '../../utils/uploadValidation';

const styles = `.photo-capture { display:grid; gap:10px; } .photo-input { display:none; } .photo-button { min-height:44px; display:inline-flex; align-items:center; justify-content:center; gap:7px; padding:10px 13px; border:1px solid #E3E7EF; border-radius:9px; background:#fff; color:#12213F; font-size:12px; font-weight:700; cursor:pointer; } .photo-preview { position:relative; min-height:120px; display:flex; align-items:center; justify-content:center; overflow:hidden; border:1px dashed #CBD3E2; border-radius:10px; background:#F9FAFC; color:#9AA1B4; font-size:11.5px; text-align:center; padding:10px; } .photo-preview img { width:100%; height:180px; object-fit:cover; } .photo-remove { position:absolute; top:8px; right:8px; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border:0; border-radius:8px; background:rgba(18,33,63,.8); color:#fff; cursor:pointer; } .photo-file { display:grid; gap:6px; justify-items:center; color:#12213F; font-size:12px; font-weight:600; word-break:break-all; } .photo-hint { font-size:11px; color:#9AA1B4; } .photo-error { display:block; font-size:11.5px; font-weight:600; color:#B23528; background:#FDE9E7; border:1px solid #F7C9C3; border-radius:8px; padding:8px 10px; }`;

/**
 * Proof-of-delivery attachment picker. Only the file types the POD upload
 * accepts can be chosen (JPEG, PNG, PDF, up to 10MB - see
 * utils/uploadValidation.js); anything else is refused here with the reason
 * shown under the control, and never handed to the page or uploaded. The
 * server applies the identical rules, so this is a courtesy to the driver
 * rather than the only line of defence.
 */
export default function PhotoCapture({ onChange, onError, accept = POD_ACCEPT, capture = 'environment' }) {
	const inputRef = useRef(null);
	const [preview, setPreview] = useState('');
	const [fileName, setFileName] = useState('');
	const [error, setError] = useState('');

	const reset = () => {
		if (preview) URL.revokeObjectURL(preview);
		setPreview('');
		setFileName('');
		if (inputRef.current) inputRef.current.value = '';
	};

	const handleChange = (event) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const message = getPodFileError(file);
		if (message) {
			reset();
			setError(message);
			onError?.(message);
			onChange?.(null);
			return;
		}

		setError('');
		reset();
		// A PDF cannot be shown in an <img>, so it is listed by name instead.
		if (!isPdfFile(file)) setPreview(URL.createObjectURL(file));
		setFileName(file.name);
		onChange?.(file);
	};

	const clear = () => {
		reset();
		setError('');
		onChange?.(null);
	};

	const hasFile = Boolean(preview || fileName);

	return (
		<div className="photo-capture">
			<style>{styles}</style>
			<div className="photo-preview">
				{preview ? (
					<>
						<img src={preview} alt="Proof of delivery preview" />
						<button type="button" className="photo-remove" onClick={clear} aria-label="Remove proof photo"><Trash2 size={14} /></button>
					</>
				) : fileName ? (
					<>
						<span className="photo-file"><FileText size={20} />{fileName}</span>
						<button type="button" className="photo-remove" onClick={clear} aria-label="Remove proof file"><Trash2 size={14} /></button>
					</>
				) : (
					<span>Add a clear delivery photo<br /><span className="photo-hint">JPEG, PNG or PDF · up to 10MB</span></span>
				)}
			</div>
			{error && <span className="photo-error" role="alert">{error}</span>}
			<input ref={inputRef} className="photo-input" type="file" accept={accept} capture={capture} onChange={handleChange} />
			<button type="button" className="photo-button" onClick={() => inputRef.current?.click()}>
				{hasFile ? <ImagePlus size={15} /> : <Camera size={15} />}{hasFile ? 'Replace file' : 'Capture photo'}
			</button>
		</div>
	);
}
