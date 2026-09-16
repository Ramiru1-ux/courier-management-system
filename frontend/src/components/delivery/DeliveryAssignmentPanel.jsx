import React, { useState } from 'react';
import { CalendarClock, MapPinned, Route, Truck, UserRound } from 'lucide-react';

const styles = `
	.assignment-panel {
		background: #fff;
		border: 1px solid #E3E7EF;
		border-radius: 16px;
		padding: 22px 20px 18px;
		box-shadow: 0 10px 25px rgba(18, 33, 63, 0.04);
	}

	.assignment-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 18px;
	}

	.assignment-title {
		margin: 0;
		font-family: 'Sora', sans-serif;
		font-weight: 700;
		font-size: 17px;
		color: #12213F;
	}

	.assignment-subtitle {
		margin: 4px 0 0;
		color: #697086;
		font-size: 12.5px;
	}

	.assignment-status {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 92px;
		padding: 8px 12px;
		border-radius: 999px;
		background: #FFF5DD;
		color: #9A6400;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: .04em;
		text-transform: uppercase;
	}

	.assignment-summary {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 12px;
		padding: 14px;
		border: 1px solid #E3E7EF;
		border-radius: 12px;
		background: #F9FAFC;
	}

	.summary-item {
		display: flex;
		align-items: flex-start;
		gap: 9px;
		min-width: 0;
	}

	.summary-icon {
		width: 28px;
		height: 28px;
		border-radius: 8px;
		background: #E8EFFE;
		color: #2453B8;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.summary-label {
		color: #9AA1B4;
		font-size: 10.5px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: .04em;
	}

	.summary-value {
		color: #12213F;
		font-size: 12.5px;
		font-weight: 700;
		margin-top: 3px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.assignment-section {
		margin-top: 20px;
		padding-top: 18px;
		border-top: 1px solid #E3E7EF;
	}

	.assignment-section-title {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 16px;
		color: #12213F;
		font-family: 'Sora', sans-serif;
		font-size: 13px;
		font-weight: 700;
	}

	.section-number {
		width: 24px;
		height: 24px;
		border-radius: 7px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #F5A524;
		color: #211200;
		font-size: 11px;
		font-weight: 800;
	}

	.assignment-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 16px;
	}

	.assignment-grid.three {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.assignment-field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.assignment-field.full {
		grid-column: 1 / -1;
	}

	.assignment-field label {
		color: #697086;
		font-size: 12px;
		font-weight: 600;
	}

	.assignment-field input,
	.assignment-field select,
	.assignment-field textarea {
		width: 100%;
		min-height: 44px;
		padding: 10px 12px;
		border: 1.5px solid #E3E7EF;
		border-radius: 10px;
		background: #fff;
		color: #151A2E;
		font-family: 'Inter', sans-serif;
		font-size: 13px;
	}

	.assignment-field textarea {
		min-height: 82px;
		resize: vertical;
	}

	.assignment-field input:focus,
	.assignment-field select:focus,
	.assignment-field textarea:focus {
		outline: none;
		border-color: #F5A524;
		box-shadow: 0 0 0 4px rgba(245, 165, 36, 0.12);
	}

	.assignment-field input::placeholder,
	.assignment-field textarea::placeholder {
		color: #9AA1B4;
	}

	.assignment-error {
		margin: 14px 0 0;
		padding: 10px 12px;
		border-radius: 9px;
		background: #FDE9E7;
		color: #A83228;
		font-size: 12px;
		font-weight: 600;
	}

	.assignment-actions {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		margin-top: 22px;
		padding-top: 18px;
		border-top: 1px solid #E3E7EF;
	}

	.assignment-button {
		appearance: none;
		border: none;
		border-radius: 10px;
		padding: 11px 18px;
		font-family: 'Sora', sans-serif;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.assignment-button.secondary {
		background: #fff;
		border: 1px solid #E3E7EF;
		color: #12213F;
	}

	.assignment-button.primary {
		background: #F5A524;
		color: #211200;
	}

	.assignment-button:disabled {
		cursor: not-allowed;
		opacity: .55;
	}

	@media (max-width: 720px) {
		.assignment-header,
		.assignment-actions {
			flex-direction: column;
			align-items: stretch;
		}

		.assignment-status {
			align-self: flex-start;
		}

		.assignment-summary,
		.assignment-grid,
		.assignment-grid.three {
			grid-template-columns: 1fr;
		}

		.assignment-field.full {
			grid-column: auto;
		}
	}
`;

const defaultValues = {
	driverId: '',
	vehicleId: '',
	route: '',
	scheduledDate: '',
	scheduledTime: '',
	notes: '',
};

const defaultDrivers = [
	{ id: 'DRV-001', name: 'Ravindu Fernando', phone: '+94 77 123 4567' },
	{ id: 'DRV-002', name: 'Dilshan Perera', phone: '+94 76 234 5678' },
	{ id: 'DRV-003', name: 'Kasun Jayawardena', phone: '+94 71 345 6789' },
];

const defaultVehicles = [
	{ id: 'LK-1945', label: 'LK-1945 · Van' },
	{ id: 'LK-2088', label: 'LK-2088 · Truck' },
	{ id: 'LK-1350', label: 'LK-1350 · Van' },
];

const defaultRoutes = [
	'Colombo → Kandy',
	'Galle → Matara',
	'Negombo → Kurunegala',
	'Jaffna → Colombo',
];

export default function DeliveryAssignmentPanel({
	shipment = {},
	drivers = defaultDrivers,
	vehicles = defaultVehicles,
	routes = defaultRoutes,
	initialValues = defaultValues,
	onAssign,
	onCancel,
}) {
	const [values, setValues] = useState({ ...defaultValues, ...initialValues });
	const [error, setError] = useState('');

	const handleChange = (event) => {
		const { name, value } = event.target;
		setValues((current) => ({ ...current, [name]: value }));
		if (error) setError('');
	};

	const handleSubmit = (event) => {
		event.preventDefault();

		if (!values.driverId || !values.vehicleId || !values.route || !values.scheduledDate || !values.scheduledTime) {
			setError('Select a driver, vehicle, route, date, and time before assigning the delivery.');
			return;
		}

		onAssign?.({ ...values, shipmentId: shipment.id || '' });
	};

	return (
		<div className="assignment-panel">
			<style>{styles}</style>

			<div className="assignment-header">
				<div>
					<h2 className="assignment-title">Assign delivery</h2>
					<p className="assignment-subtitle">Choose the driver, vehicle, and route for this shipment.</p>
				</div>
				<span className="assignment-status">Unassigned</span>
			</div>

			<div className="assignment-summary">
				<div className="summary-item">
					<div className="summary-icon"><Truck size={15} /></div>
					<div>
						<div className="summary-label">Shipment</div>
						<div className="summary-value">{shipment.id || 'New delivery'}</div>
					</div>
				</div>
				<div className="summary-item">
					<div className="summary-icon"><MapPinned size={15} /></div>
					<div>
						<div className="summary-label">Destination</div>
						<div className="summary-value">{shipment.destination || 'Destination pending'}</div>
					</div>
				</div>
				<div className="summary-item">
					<div className="summary-icon"><Route size={15} /></div>
					<div>
						<div className="summary-label">Package count</div>
						<div className="summary-value">{shipment.packageCount || 1} package{shipment.packageCount === 1 ? '' : 's'}</div>
					</div>
				</div>
			</div>

			<form onSubmit={handleSubmit}>
				<div className="assignment-section">
					<div className="assignment-section-title">
						<span className="section-number">1</span>
						Assignment details
					</div>

					<div className="assignment-grid three">
						<div className="assignment-field">
							<label htmlFor="assignment-driver">Driver</label>
							<select id="assignment-driver" name="driverId" value={values.driverId} onChange={handleChange}>
								<option value="">Select driver</option>
								{drivers.map((driver) => (
									<option key={driver.id} value={driver.id}>{driver.name}</option>
								))}
							</select>
						</div>

						<div className="assignment-field">
							<label htmlFor="assignment-vehicle">Vehicle</label>
							<select id="assignment-vehicle" name="vehicleId" value={values.vehicleId} onChange={handleChange}>
								<option value="">Select vehicle</option>
								{vehicles.map((vehicle) => (
									<option key={vehicle.id} value={vehicle.id}>{vehicle.label}</option>
								))}
							</select>
						</div>

						<div className="assignment-field">
							<label htmlFor="assignment-route">Route</label>
							<select id="assignment-route" name="route" value={values.route} onChange={handleChange}>
								<option value="">Select route</option>
								{routes.map((route) => <option key={route} value={route}>{route}</option>)}
							</select>
						</div>
					</div>
				</div>

				<div className="assignment-section">
					<div className="assignment-section-title">
						<span className="section-number">2</span>
						Schedule and notes
					</div>

					<div className="assignment-grid three">
						<div className="assignment-field">
							<label htmlFor="assignment-date">Delivery date</label>
							<input id="assignment-date" name="scheduledDate" type="date" value={values.scheduledDate} onChange={handleChange} />
						</div>

						<div className="assignment-field">
							<label htmlFor="assignment-time">Dispatch time</label>
							<input id="assignment-time" name="scheduledTime" type="time" value={values.scheduledTime} onChange={handleChange} />
						</div>

						<div className="assignment-field">
							<label htmlFor="assignment-contact">Driver contact</label>
							<input
								id="assignment-contact"
								type="text"
								value={drivers.find((driver) => driver.id === values.driverId)?.phone || 'Select a driver'}
								readOnly
								aria-label="Driver contact"
							/>
						</div>

						<div className="assignment-field full">
							<label htmlFor="assignment-notes">Dispatch notes</label>
							<textarea id="assignment-notes" name="notes" value={values.notes} onChange={handleChange} placeholder="Add handover instructions or delivery notes" />
						</div>
					</div>
				</div>

				{error && <p className="assignment-error" role="alert">{error}</p>}

				<div className="assignment-actions">
					<button type="button" className="assignment-button secondary" onClick={onCancel}>Cancel</button>
					<button type="submit" className="assignment-button primary">
						<CalendarClock size={15} />
						Assign delivery
					</button>
				</div>
			</form>
		</div>
	);
}
