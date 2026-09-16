import React, { useMemo, useState } from 'react';
import { Activity, Clock3, LocateFixed, MapPin, Navigation, RefreshCw, Search, Truck } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import ShipmentStatusBadge from '../../components/shipment/ShipmentStatusBadge';
import ShipmentTimeline from '../../components/shipment/ShipmentTimeline';

const styles = `
	.tracking-page {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.tracking-head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 16px;
	}

	.breadcrumb {
		font-size: 12px;
		color: #9AA1B4;
		font-weight: 500;
		margin-bottom: 6px;
	}

	.breadcrumb strong {
		color: #697086;
	}

	.page-title {
		margin: 0;
		color: #12213F;
		font-family: 'Sora', sans-serif;
		font-size: 21px;
		font-weight: 700;
	}

	.page-subtitle {
		margin: 8px 0 0;
		color: #697086;
		font-size: 13px;
	}

	.head-actions {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.icon-button,
	.action-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		border: 1px solid #E3E7EF;
		border-radius: 10px;
		background: #fff;
		color: #12213F;
		padding: 10px 14px;
		font-size: 12.5px;
		font-weight: 600;
		cursor: pointer;
	}

	.action-button.primary {
		border-color: #F5A524;
		background: #F5A524;
		color: #211200;
	}

	.tracking-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.45fr) minmax(300px, .8fr);
		gap: 16px;
		align-items: start;
	}

	.panel {
		background: #fff;
		border: 1px solid #E3E7EF;
		border-radius: 14px;
		padding: 18px 20px;
	}

	.panel-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 16px;
	}

	.panel-title {
		color: #12213F;
		font-family: 'Sora', sans-serif;
		font-size: 14.5px;
		font-weight: 700;
	}

	.panel-meta {
		color: #9AA1B4;
		font-size: 11.5px;
	}

	.map-area {
		position: relative;
		height: 440px;
		overflow: hidden;
		border: 1px solid #E3E7EF;
		border-radius: 12px;
		background:
			linear-gradient(0deg, rgba(18,33,63,.05) 1px, transparent 1px) 0 0/34px 34px,
			linear-gradient(90deg, rgba(18,33,63,.05) 1px, transparent 1px) 0 0/34px 34px,
			#EAF0FB;
	}

	.map-water {
		position: absolute;
		width: 46%;
		height: 78%;
		right: -11%;
		top: 11%;
		border-radius: 48% 0 0 48%;
		background: rgba(62, 123, 250, .08);
		transform: rotate(-14deg);
	}

	.map-road {
		position: absolute;
		border: 2px dashed rgba(62, 123, 250, .8);
		border-radius: 50%;
		transform: rotate(18deg);
	}

	.map-road.alt {
		border-color: rgba(14, 163, 148, .85);
		transform: rotate(-23deg);
	}

	.map-pin {
		position: absolute;
		width: 15px;
		height: 15px;
		border: 3px solid #fff;
		border-radius: 50%;
		box-shadow: 0 3px 9px rgba(18, 33, 63, .24);
	}

	.map-pin.active {
		width: 19px;
		height: 19px;
		border-color: #FCEFD6;
		background: #F5A524;
		box-shadow: 0 0 0 7px rgba(245, 165, 36, .2), 0 3px 9px rgba(18, 33, 63, .24);
	}

	.map-label {
		position: absolute;
		padding: 5px 8px;
		border: 1px solid rgba(18, 33, 63, .08);
		border-radius: 7px;
		background: rgba(255, 255, 255, .92);
		color: #12213F;
		font-size: 10.5px;
		font-weight: 700;
		box-shadow: 0 3px 10px rgba(18, 33, 63, .08);
	}

	.map-legend {
		position: absolute;
		left: 14px;
		bottom: 14px;
		display: flex;
		gap: 12px;
		padding: 9px 11px;
		border: 1px solid #E3E7EF;
		border-radius: 9px;
		background: rgba(255, 255, 255, .92);
		color: #697086;
		font-size: 11px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 5px;
	}

	.legend-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.search-field {
		position: relative;
		display: flex;
		align-items: center;
		width: min(100%, 310px);
	}

	.search-field svg {
		position: absolute;
		left: 12px;
		color: #9AA1B4;
	}

	.search-field input {
		width: 100%;
		min-height: 40px;
		padding: 9px 12px 9px 35px;
		border: 1px solid #E3E7EF;
		border-radius: 9px;
		color: #151A2E;
		font-size: 12.5px;
	}

	.search-field input:focus {
		outline: none;
		border-color: #F5A524;
		box-shadow: 0 0 0 4px rgba(245, 165, 36, .12);
	}

	.tracking-list {
		display: flex;
		flex-direction: column;
		gap: 9px;
		max-height: 440px;
		overflow: auto;
	}

	.vehicle-card {
		width: 100%;
		padding: 12px;
		border: 1px solid #E3E7EF;
		border-radius: 11px;
		background: #fff;
		color: inherit;
		text-align: left;
		cursor: pointer;
	}

	.vehicle-card:hover,
	.vehicle-card.selected {
		border-color: #F5A524;
		background: #FFFBF3;
	}

	.vehicle-top,
	.vehicle-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}

	.vehicle-name {
		display: flex;
		align-items: center;
		gap: 8px;
		color: #12213F;
		font-size: 13px;
		font-weight: 700;
	}

	.vehicle-icon {
		width: 27px;
		height: 27px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		background: #E8EFFE;
		color: #2453B8;
	}

	.vehicle-route {
		margin: 10px 0;
		color: #697086;
		font-size: 11.5px;
	}

	.vehicle-bottom {
		color: #9AA1B4;
		font-size: 11px;
	}

	.detail-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(280px, .85fr);
		gap: 16px;
	}

	.selected-summary {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 12px;
		margin-bottom: 20px;
	}

	.summary-box {
		padding: 12px;
		border-radius: 10px;
		background: #F9FAFC;
		border: 1px solid #E3E7EF;
	}

	.summary-box-label {
		color: #9AA1B4;
		font-size: 10.5px;
		font-weight: 600;
		text-transform: uppercase;
	}

	.summary-box-value {
		margin-top: 5px;
		color: #12213F;
		font-size: 13px;
		font-weight: 700;
	}

	.signal-row {
		display: flex;
		align-items: center;
		gap: 8px;
		color: #0C8C6B;
		font-size: 12px;
		font-weight: 600;
	}

	.empty-state {
		padding: 30px 14px;
		color: #697086;
		font-size: 12.5px;
		text-align: center;
	}

	@media (max-width: 1000px) {
		.tracking-grid,
		.detail-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 680px) {
		.tracking-head,
		.panel-head {
			align-items: flex-start;
			flex-direction: column;
		}

		.head-actions {
			width: 100%;
			flex-wrap: wrap;
		}

		.map-area {
			height: 320px;
		}

		.selected-summary {
			grid-template-columns: 1fr;
		}
	}
`;

const vehicles = [
	{ id: 'TRK-042', driver: 'A. Fernando', route: 'Colombo → Kandy', status: 'In transit', eta: '4:30 PM', speed: '46 km/h', position: { left: '31%', top: '43%' } },
	{ id: 'VAN-118', driver: 'N. Perera', route: 'Galle → Matara', status: 'Out for delivery', eta: '2:15 PM', speed: '32 km/h', position: { left: '63%', top: '29%' } },
	{ id: 'TRK-019', driver: 'S. Raj', route: 'Negombo → Kurunegala', status: 'Delayed', eta: 'Tomorrow', speed: '18 km/h', position: { left: '47%', top: '64%' } },
	{ id: 'VAN-204', driver: 'K. Silva', route: 'Jaffna → Colombo', status: 'Delivered', eta: 'Completed', speed: '0 km/h', position: { left: '76%', top: '55%' } },
];

const timeline = [
	{ title: 'Picked up by courier', meta: '12:40 PM · Vehicle #TRK-042', status: 'done' },
	{ title: 'Sorting hub scanned', meta: '1:05 PM · Central Hub, Colombo', status: 'done' },
	{ title: 'Out for delivery', meta: '2:10 PM · Route 04 · Driver A. Fernando', status: 'current' },
	{ title: 'Customer confirmation pending', meta: 'Expected by 4:30 PM', status: 'pending' },
];

export default function LiveTrackingPage() {
	const [query, setQuery] = useState('');
	const [selectedId, setSelectedId] = useState(vehicles[0].id);

	const filteredVehicles = useMemo(() => {
		const term = query.trim().toLowerCase();
		if (!term) return vehicles;

		return vehicles.filter((vehicle) => [vehicle.id, vehicle.driver, vehicle.route, vehicle.status].join(' ').toLowerCase().includes(term));
	}, [query]);

	const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedId) || vehicles[0];

	return (
		<PortalLayout>
			<div className="tracking-page">
				<style>{styles}</style>

				<div className="tracking-head">
					<div>
						<div className="breadcrumb">Operations / <strong>Live tracking</strong></div>
						<h1 className="page-title">Live shipment tracking</h1>
						<p className="page-subtitle">Monitor active vehicles and follow every delivery across the network.</p>
					</div>

					<div className="head-actions">
						<button type="button" className="icon-button" title="Refresh tracking data" aria-label="Refresh tracking data">
							<RefreshCw size={15} />
						</button>
						<button type="button" className="action-button primary">
							<LocateFixed size={15} />
							Locate shipment
						</button>
					</div>
				</div>

				<div className="tracking-grid">
					<div className="panel">
						<div className="panel-head">
							<div>
								<div className="panel-title">Network overview</div>
								<div className="panel-meta">Last updated less than a minute ago</div>
							</div>
							<div className="signal-row"><Activity size={14} /> Live updates</div>
						</div>

						<div className="map-area" aria-label="Live vehicle map">
							<div className="map-water" />
							<div className="map-road" style={{ left: '11%', top: '31%', width: '70%', height: '40%' }} />
							<div className="map-road alt" style={{ left: '28%', top: '8%', width: '54%', height: '70%' }} />
							<div className="map-pin" style={{ left: '15%', top: '54%', background: '#0EA394' }} />
							<div className="map-pin" style={{ left: '69%', top: '20%', background: '#3E7BFA' }} />
							<div className="map-pin active" style={selectedVehicle.position} />
							<div className="map-label" style={{ left: '22%', top: '37%' }}>Colombo</div>
							<div className="map-label" style={{ left: '65%', top: '12%' }}>Kandy</div>
							<div className="map-label" style={{ left: '55%', top: '72%' }}>Galle</div>
							<div className="map-legend">
								<span className="legend-item"><span className="legend-dot" style={{ background: '#F5A524' }} /> Selected</span>
								<span className="legend-item"><span className="legend-dot" style={{ background: '#0EA394' }} /> Active</span>
								<span className="legend-item"><span className="legend-dot" style={{ background: '#3E7BFA' }} /> Hub</span>
							</div>
						</div>
					</div>

					<div className="panel">
						<div className="panel-head">
							<div className="panel-title">Active vehicles</div>
							<div className="panel-meta">{vehicles.length} tracked</div>
						</div>

						<div className="search-field">
							<Search size={15} />
							<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search vehicle, driver, route" aria-label="Search active vehicles" />
						</div>

						<div className="tracking-list" style={{ marginTop: 14 }}>
							{filteredVehicles.length ? filteredVehicles.map((vehicle) => (
								<button key={vehicle.id} type="button" className={`vehicle-card ${vehicle.id === selectedId ? 'selected' : ''}`} onClick={() => setSelectedId(vehicle.id)}>
									<div className="vehicle-top">
										<div className="vehicle-name"><span className="vehicle-icon"><Truck size={14} /></span>{vehicle.id}</div>
										<ShipmentStatusBadge status={vehicle.status} />
									</div>
									<div className="vehicle-route">{vehicle.route}</div>
									<div className="vehicle-bottom"><span>{vehicle.driver}</span><span>ETA {vehicle.eta}</span></div>
								</button>
							)) : <div className="empty-state">No tracked vehicles match your search.</div>}
						</div>
					</div>
				</div>

				<div className="detail-grid">
					<div className="panel">
						<div className="panel-head">
							<div className="panel-title">Selected shipment activity</div>
							<ShipmentStatusBadge status={selectedVehicle.status} />
						</div>

						<div className="selected-summary">
							<div className="summary-box"><div className="summary-box-label">Vehicle</div><div className="summary-box-value">{selectedVehicle.id}</div></div>
							<div className="summary-box"><div className="summary-box-label">Driver</div><div className="summary-box-value">{selectedVehicle.driver}</div></div>
							<div className="summary-box"><div className="summary-box-label">Current speed</div><div className="summary-box-value">{selectedVehicle.speed}</div></div>
						</div>

						<ShipmentTimeline items={timeline} />
					</div>

					<div className="panel">
						<div className="panel-head">
							<div className="panel-title">Route details</div>
							<Navigation size={17} color="#3E7BFA" />
						</div>
						<div className="summary-box" style={{ marginBottom: 12 }}>
							<div className="summary-box-label">Current route</div>
							<div className="summary-box-value">{selectedVehicle.route}</div>
						</div>
						<div className="summary-box" style={{ marginBottom: 12 }}>
							<div className="summary-box-label">Estimated arrival</div>
							<div className="summary-box-value"><Clock3 size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />{selectedVehicle.eta}</div>
						</div>
						<div className="summary-box">
							<div className="summary-box-label">Tracking signal</div>
							<div className="summary-box-value"><MapPin size={14} color="#0C8C6B" style={{ verticalAlign: 'middle', marginRight: 5 }} />Connected</div>
						</div>
					</div>
				</div>
			</div>
		</PortalLayout>
	);
}
