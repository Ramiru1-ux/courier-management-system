import React from 'react';

const styles = `
	.driver-availability-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; }
	.driver-availability-badge .dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
	.driver-availability-badge.available { background: #E4F7F4; color: #087367; }
	.driver-availability-badge.busy { background: #FCEFD6; color: #8A5A05; }
	.driver-availability-badge.offline { background: #EEF0F4; color: #697086; }
	.driver-availability-badge.leave { background: #FDE9E7; color: #B23528; }
`;

// "Delivering" is the status the drivers list actually stores for a driver
// who is out on a round (see AVAILABILITY_OPTIONS in
// pages/driver/DriverDashboardPage.jsx) - without it here it fell through to
// the grey "offline" style, showing an on-the-road driver as offline.
const variants = { available: 'available', busy: 'busy', delivering: 'busy', offline: 'offline', 'on leave': 'leave' };

export default function DriverAvailabilityBadge({ status = 'Available', className = '' }) {
	const variant = variants[String(status).trim().toLowerCase()] || 'offline';

	return (
		<span className={`driver-availability-badge ${variant} ${className}`.trim()}>
			<style>{styles}</style>
			<span className="dot" />
			{status}
		</span>
	);
}
