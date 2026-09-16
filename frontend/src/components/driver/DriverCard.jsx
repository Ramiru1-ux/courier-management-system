import React from 'react';
import { MapPin, Phone, Truck } from 'lucide-react';
import DriverAvailabilityBadge from './DriverAvailabilityBadge';

const styles = `
	.driver-card { padding: 17px; border: 1px solid #E3E7EF; border-radius: 14px; background: #fff; }
	.driver-card-head, .driver-card-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
	.driver-identity { display: flex; align-items: center; gap: 10px; min-width: 0; }
	.driver-avatar { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 11px; background: #E8EFFE; color: #2453B8; font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 800; flex-shrink: 0; }
	.driver-name { overflow: hidden; color: #12213F; font-size: 13.5px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
	.driver-id { margin-top: 3px; color: #9AA1B4; font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; }
	.driver-card-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 17px 0; }
	.driver-stat { padding: 10px; border-radius: 9px; background: #F9FAFC; }
	.driver-stat-label { color: #9AA1B4; font-size: 10px; }
	.driver-stat-value { margin-top: 4px; color: #12213F; font-size: 12.5px; font-weight: 700; }
	.driver-card-foot { padding-top: 13px; border-top: 1px solid #E3E7EF; color: #697086; font-size: 11.5px; }
	.driver-contact { display: inline-flex; align-items: center; gap: 5px; }
	.driver-card-action { border: none; background: transparent; color: #3E7BFA; font-size: 11.5px; font-weight: 700; cursor: pointer; }
	@media (max-width: 440px) { .driver-card-stats { grid-template-columns: 1fr; } }
`;

export default function DriverCard({ driver = {}, onSelect, actionLabel = 'View profile' }) {
	const name = driver.name || 'Unassigned driver';
	const initials = name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

	return (
		<article className="driver-card">
			<style>{styles}</style>
			<div className="driver-card-head">
				<div className="driver-identity">
					<div className="driver-avatar">{initials}</div>
					<div><div className="driver-name">{name}</div><div className="driver-id">{driver.id || 'DRV-PENDING'}</div></div>
				</div>
				<DriverAvailabilityBadge status={driver.status || 'Available'} />
			</div>
			<div className="driver-card-stats">
				<div className="driver-stat"><div className="driver-stat-label">Deliveries</div><div className="driver-stat-value">{driver.deliveries ?? 0}</div></div>
				<div className="driver-stat"><div className="driver-stat-label">Rating</div><div className="driver-stat-value">{driver.rating || '4.8'}</div></div>
				<div className="driver-stat"><div className="driver-stat-label">Vehicle</div><div className="driver-stat-value">{driver.vehicle || 'Pending'}</div></div>
			</div>
			<div className="driver-card-foot">
				<span className="driver-contact">{driver.location ? <MapPin size={13} /> : <Phone size={13} />}{driver.location || driver.phone || 'Contact unavailable'}</span>
				{onSelect && <button type="button" className="driver-card-action" onClick={() => onSelect(driver)}>{actionLabel}</button>}
			</div>
		</article>
	);
}
