import React, { useMemo, useState } from 'react';
import { MapPinned, Plus, Route, Truck, Users, Zap } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import SearchBar from '../../components/common/SearchBar';
import FilterPanel from '../../components/common/FilterPanel';
import Pagination from '../../components/common/Pagination';
import ShipmentStatusBadge from '../../components/shipment/ShipmentStatusBadge';

const styles = `
	.dispatch-page {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.page-head {
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
		font-family: 'Sora', sans-serif;
		font-weight: 700;
		font-size: 21px;
		color: #12213F;
	}

	.page-subtitle {
		margin: 8px 0 0;
		color: #697086;
		font-size: 13px;
	}

	.page-actions {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.action-button {
		border: none;
		border-radius: 10px;
		padding: 11px 18px;
		font-family: 'Sora', sans-serif;
		font-weight: 600;
		font-size: 13.5px;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		transition: transform 0.2s ease;
	}

	.action-button:hover {
		transform: translateY(-1px);
	}

	.action-button.primary {
		background: #F5A524;
		color: #211200;
	}

	.action-button.secondary {
		background: #fff;
		color: #12213F;
		border: 1px solid #E3E7EF;
	}

	.kpi-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(160px, 1fr));
		gap: 14px;
	}

	.kpi-card {
		background: #fff;
		border: 1px solid #E3E7EF;
		border-radius: 14px;
		padding: 17px 18px;
	}

	.kpi-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}

	.kpi-label {
		font-size: 12px;
		font-weight: 600;
		color: #697086;
	}

	.kpi-icon {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.kpi-value {
		font-family: 'Sora', sans-serif;
		font-weight: 800;
		font-size: 26px;
		color: #12213F;
		line-height: 1.2;
	}

	.kpi-delta {
		margin-top: 5px;
		font-size: 11.5px;
		font-weight: 600;
	}

	.kpi-delta.up {
		color: #0C8C6B;
	}

	.kpi-delta.down {
		color: #C4402F;
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: 16px;
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
		font-family: 'Sora', sans-serif;
		font-weight: 700;
		font-size: 14.5px;
		color: #12213F;
	}

	.panel-link {
		font-size: 12px;
		font-weight: 600;
		color: #3E7BFA;
	}

	.map-panel {
		position: relative;
		height: 260px;
		border-radius: 12px;
		overflow: hidden;
		background:
			linear-gradient(0deg, rgba(18,33,63,.05) 1px, transparent 1px) 0 0/28px 28px,
			linear-gradient(90deg, rgba(18,33,63,.05) 1px, transparent 1px) 0 0/28px 28px,
			#EAF0FB;
		border: 1px solid #E3E7EF;
	}

	.map-pin {
		position: absolute;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 2px solid #fff;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.18);
	}

	.map-pin.red { background: #E55B3F; }
	.map-pin.blue { background: #3E7BFA; }
	.map-pin.green { background: #1F9D78; }
	.map-pin.amber { background: #F5A524; }

	.route-line {
		position: absolute;
		border: 2px dashed rgba(62, 123, 250, 0.9);
		border-radius: 999px;
		transform: rotate(14deg);
		opacity: 0.7;
	}

	.route-line.alt {
		border-color: rgba(31, 157, 120, 0.9);
	}

	.route-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.route-card {
		border: 1px solid #E3E7EF;
		border-radius: 12px;
		padding: 12px 13px;
		background: #FAFBFD;
	}

	.route-card-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 10px;
	}

	.route-name {
		font-weight: 700;
		color: #12213F;
		font-size: 13px;
	}

	.route-meta {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		align-items: center;
		color: #697086;
		font-size: 12px;
	}

	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		margin-bottom: 14px;
	}

	.table-shell {
		overflow: hidden;
		border-radius: 12px;
		border: 1px solid #E3E7EF;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th {
		text-align: left;
		padding: 12px 14px;
		background: #F9FAFC;
		color: #9AA1B4;
		font-size: 11px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		font-weight: 700;
	}

	td {
		padding: 13px 14px;
		border-top: 1px solid #E3E7EF;
		font-size: 13px;
		color: #12213F;
		vertical-align: middle;
	}

	tr.row-hover:hover td {
		background: #FAFBFD;
	}

	.dispatch-id {
		font-family: 'IBM Plex Mono', monospace;
		font-weight: 600;
		font-size: 12.5px;
		color: #12213F;
	}

	.driver-name {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.avatar-mini {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #EEF1F9;
		font-size: 10px;
		font-weight: 700;
		color: #12213F;
	}

	.route-pill {
		display: inline-flex;
		align-items: center;
		padding: 5px 9px;
		border-radius: 999px;
		background: #EEF0F4;
		color: #697086;
		font-size: 11px;
		font-weight: 600;
	}

	.small-label {
		display: block;
		font-size: 11.5px;
		color: #9AA1B4;
		margin-top: 2px;
	}

	@media (max-width: 900px) {
		.kpi-grid {
			grid-template-columns: repeat(2, minmax(160px, 1fr));
		}

		.dashboard-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 640px) {
		.page-head,
		.toolbar,
		.panel-head {
			flex-direction: column;
			align-items: flex-start;
		}

		.kpi-grid {
			grid-template-columns: 1fr;
		}

		.page-actions {
			width: 100%;
			justify-content: flex-start;
			flex-wrap: wrap;
		}
	}
`;

const dispatches = [
	{ id: 'DSP-1024', route: 'Colombo → Kandy', driver: 'Ravindu', vehicle: 'LK-1945', status: 'In transit', eta: 'Today, 4:30 PM', priority: 'High', loads: 14, progress: '72%' },
	{ id: 'DSP-1027', route: 'Galle → Matara', driver: 'Dilshan', vehicle: 'LK-2088', status: 'Out for delivery', eta: 'Today, 2:15 PM', priority: 'Medium', loads: 9, progress: '86%' },
	{ id: 'DSP-1030', route: 'Negombo → Kurunegala', driver: 'Kasun', vehicle: 'LK-1350', status: 'Delayed', eta: 'Tomorrow', priority: 'High', loads: 11, progress: '48%' },
	{ id: 'DSP-1035', route: 'Jaffna → Colombo', driver: 'Saman', vehicle: 'LK-2267', status: 'Dispatched', eta: 'Completed', priority: 'Critical', loads: 18, progress: '100%' },
	{ id: 'DSP-1041', route: 'Anuradhapura → Batticaloa', driver: 'Nuwan', vehicle: 'LK-1772', status: 'Assigned', eta: 'Today, 7:10 PM', priority: 'Medium', loads: 6, progress: '30%' },
	{ id: 'DSP-1045', route: 'Kandy → Nuwara Eliya', driver: 'Pradeep', vehicle: 'LK-2030', status: 'In transit', eta: 'Today, 9:40 PM', priority: 'Low', loads: 7, progress: '63%' },
];

const kpis = [
	{ label: 'Active routes', value: '26', delta: '+4.2%', up: true, color: '#E8EFFE', icon: Route },
	{ label: 'Vehicles on road', value: '43', delta: '+8.1%', up: true, color: '#E4F7F4', icon: Truck },
	{ label: 'Drivers assigned', value: '18', delta: '+2.5%', up: true, color: '#EFEBFD', icon: Users },
	{ label: 'Delayed loads', value: '07', delta: '-1.8%', up: false, color: '#FDE9E7', icon: Zap },
];

export default function DispatchPage() {
	const [query, setQuery] = useState('');
	const [page, setPage] = useState(1);
	const pageSize = 5;

	const filtered = useMemo(() => {
		const term = query.trim().toLowerCase();

		if (!term) return dispatches;

		return dispatches.filter((item) => {
			return [item.id, item.route, item.driver, item.vehicle, item.status, item.priority]
				.join(' ')
				.toLowerCase()
				.includes(term);
		});
	}, [query]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const safePage = Math.min(page, totalPages);
	const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

	return (
		<PortalLayout>
			<div className="dispatch-page">
				<style>{styles}</style>

				<div className="page-head">
					<div>
						<div className="breadcrumb">Operations / <strong>Dispatch</strong></div>
						<h1 className="page-title">Dispatch board</h1>
						<p className="page-subtitle">Track active routes, vehicle assignments, and delivery progress by region.</p>
					</div>

					<div className="page-actions">
						<button type="button" className="action-button secondary">
							<MapPinned size={15} />
							Live map
						</button>
						<button type="button" className="action-button primary">
							<Plus size={15} />
							Assign route
						</button>
					</div>
				</div>

				<div className="kpi-grid">
					{kpis.map(({ label, value, delta, up, color, icon: Icon }) => (
						<div key={label} className="kpi-card">
							<div className="kpi-top">
								<div className="kpi-label">{label}</div>
								<div className="kpi-icon" style={{ background: color }}>
									<Icon size={16} color="#10213F" />
								</div>
							</div>
							<div className="kpi-value">{value}</div>
							<div className={`kpi-delta ${up ? 'up' : 'down'}`}>{delta} vs last week</div>
						</div>
					))}
				</div>

				<div className="dashboard-grid">
					<div className="panel">
						<div className="panel-head">
							<div className="panel-title">Regional dispatch map</div>
							<div className="panel-link">View details</div>
						</div>

						<div className="map-panel">
							<div className="route-line" style={{ left: '22%', top: '32%', width: '38%', height: '55%' }} />
							<div className="route-line alt" style={{ left: '48%', top: '18%', width: '28%', height: '52%' }} />

							<div className="map-pin red" style={{ left: '18%', top: '56%' }} />
							<div className="map-pin blue" style={{ left: '38%', top: '44%' }} />
							<div className="map-pin green" style={{ left: '60%', top: '30%' }} />
							<div className="map-pin amber" style={{ left: '72%', top: '56%' }} />
						</div>
					</div>

					<div className="panel">
						<div className="panel-head">
							<div className="panel-title">Priority routes</div>
							<div className="panel-link">All routes</div>
						</div>

						<div className="route-list">
							<div className="route-card">
								<div className="route-card-top">
									<div className="route-name">Colombo → Kandy</div>
									<ShipmentStatusBadge status="In transit" />
								</div>
								<div className="route-meta">
									<span>14 loads</span>
									<span>ETD 4:30 PM</span>
								</div>
							</div>

							<div className="route-card">
								<div className="route-card-top">
									<div className="route-name">Negombo → Kurunegala</div>
									<ShipmentStatusBadge status="Delayed" />
								</div>
								<div className="route-meta">
									<span>11 loads</span>
									<span>Delay 45 min</span>
								</div>
							</div>

							<div className="route-card">
								<div className="route-card-top">
									<div className="route-name">Jaffna → Colombo</div>
									<ShipmentStatusBadge status="Dispatched" />
								</div>
								<div className="route-meta">
									<span>18 loads</span>
									<span>Completed</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="panel">
					<div className="panel-head">
						<div className="panel-title">Dispatch queue</div>
						<div className="panel-link">Export board</div>
					</div>

					<div className="toolbar">
						<SearchBar
							value={query}
							onChange={(event) => {
								setQuery(event.target.value);
								setPage(1);
							}}
							placeholder="Search route, driver, or vehicle"
							width="360px"
						/>

						<FilterPanel
							filters={[
								{ label: 'All', value: 'all', active: true },
								{ label: 'Active', value: 'active' },
								{ label: 'Delayed', value: 'delayed' },
								{ label: 'Assigned', value: 'assigned' },
							]}
							activeFilter="all"
						/>
					</div>

					<div className="table-shell">
						<table>
							<thead>
								<tr>
									<th>Dispatch ID</th>
									<th>Route</th>
									<th>Driver</th>
									<th>Vehicle</th>
									<th>Status</th>
									<th>ETA</th>
									<th>Load</th>
								</tr>
							</thead>
							<tbody>
								{pageItems.map((item) => (
									<tr key={item.id} className="row-hover">
										<td>
											<div className="dispatch-id">{item.id}</div>
										</td>
										<td>
											<div>{item.route}</div>
											<span className="small-label">{item.priority} priority</span>
										</td>
										<td>
											<div className="driver-name">
												<span className="avatar-mini">{item.driver.slice(0, 2).toUpperCase()}</span>
												{item.driver}
											</div>
										</td>
										<td>
											<span className="route-pill">{item.vehicle}</span>
										</td>
										<td>
											<ShipmentStatusBadge status={item.status} />
										</td>
										<td>{item.eta}</td>
										<td>
											<div>{item.loads} parcels</div>
											<span className="small-label">{item.progress} complete</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<Pagination
						currentPage={safePage}
						totalPages={totalPages}
						pageSize={pageSize}
						totalItems={filtered.length}
						onPageChange={(nextPage) => setPage(nextPage)}
					/>
				</div>
			</div>
		</PortalLayout>
	);
}
