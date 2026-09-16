import React, { useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';

const styles = `
	.tracking-search-box {
		width: 100%;
	}

	.tracking-search-form {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
	}

	.tracking-search-input-wrap {
		position: relative;
		display: flex;
		align-items: center;
		flex: 1;
		min-width: 0;
	}

	.tracking-search-icon {
		position: absolute;
		left: 14px;
		display: inline-flex;
		color: #9AA1B4;
		pointer-events: none;
	}

	.tracking-search-input {
		width: 100%;
		min-height: 46px;
		padding: 11px 14px 11px 40px;
		border: 1.5px solid #E3E7EF;
		border-radius: 10px;
		outline: none;
		background: #fff;
		color: #151A2E;
		font-family: 'Inter', sans-serif;
		font-size: 13px;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	.tracking-search-input:focus {
		border-color: #F5A524;
		box-shadow: 0 0 0 4px rgba(245, 165, 36, 0.12);
	}

	.tracking-search-input::placeholder {
		color: #9AA1B4;
	}

	.tracking-search-button {
		min-height: 46px;
		padding: 11px 17px;
		border: none;
		border-radius: 10px;
		background: #F5A524;
		color: #211200;
		font-family: 'Sora', sans-serif;
		font-size: 12.5px;
		font-weight: 700;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		cursor: pointer;
		white-space: nowrap;
		transition: transform 0.2s ease, opacity 0.2s ease;
	}

	.tracking-search-button:hover:not(:disabled) {
		transform: translateY(-1px);
	}

	.tracking-search-button:disabled {
		cursor: not-allowed;
		opacity: .55;
	}

	.tracking-search-hint,
	.tracking-search-error {
		margin: 8px 2px 0;
		font-size: 11.5px;
	}

	.tracking-search-hint {
		color: #9AA1B4;
	}

	.tracking-search-error {
		color: #B23528;
		font-weight: 600;
	}

	@media (max-width: 520px) {
		.tracking-search-form {
			align-items: stretch;
			flex-direction: column;
		}

		.tracking-search-button {
			width: 100%;
		}
	}
`;

export default function TrackingSearchBox({
	value,
	defaultValue = '',
	onChange,
	onSubmit,
	placeholder = 'Enter tracking number or order ID',
	buttonLabel = 'Track shipment',
	hint = 'Use the tracking ID from your shipment confirmation.',
	name = 'trackingNumber',
	className = '',
	disabled = false,
}) {
	const isControlled = value !== undefined;
	const [internalValue, setInternalValue] = useState(defaultValue);
	const [error, setError] = useState('');
	const inputValue = isControlled ? value : internalValue;

	const handleChange = (event) => {
		if (!isControlled) setInternalValue(event.target.value);
		if (error) setError('');
		onChange?.(event);
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		const trackingNumber = String(inputValue || '').trim();

		if (!trackingNumber) {
			setError('Enter a tracking number to continue.');
			return;
		}

		setError('');
		onSubmit?.(trackingNumber, event);
	};

	return (
		<div className={`tracking-search-box ${className}`.trim()}>
			<style>{styles}</style>

			<form className="tracking-search-form" onSubmit={handleSubmit}>
				<div className="tracking-search-input-wrap">
					<span className="tracking-search-icon"><Search size={17} /></span>
					<input
						className="tracking-search-input"
						type="search"
						name={name}
						value={inputValue}
						onChange={handleChange}
						placeholder={placeholder}
						aria-label={placeholder}
						aria-invalid={Boolean(error)}
						aria-describedby={error ? `${name}-error` : `${name}-hint`}
						disabled={disabled}
					/>
				</div>

				<button type="submit" className="tracking-search-button" disabled={disabled || !String(inputValue || '').trim()}>
					{buttonLabel}
					<ArrowRight size={15} />
				</button>
			</form>

			{error ? <div id={`${name}-error`} className="tracking-search-error" role="alert">{error}</div> : <div id={`${name}-hint`} className="tracking-search-hint">{hint}</div>}
		</div>
	);
}
