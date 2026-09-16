import React from 'react';
import { Check, Clock3, MapPin, PackageCheck } from 'lucide-react';

const styles = `
	.tracking-timeline {
		position: relative;
		padding-left: 34px;
	}

	.tracking-timeline::before {
		content: "";
		position: absolute;
		left: 9px;
		top: 8px;
		bottom: 8px;
		width: 2px;
		background: #E3E7EF;
	}

	.tracking-event {
		position: relative;
		min-height: 62px;
		padding: 0 0 20px;
	}

	.tracking-event:last-child {
		min-height: 0;
		padding-bottom: 0;
	}

	.tracking-event-marker {
		position: absolute;
		left: -33px;
		top: 2px;
		z-index: 1;
		width: 20px;
		height: 20px;
		border: 3px solid #fff;
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 0 0 2px #E3E7EF;
		color: #9AA1B4;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tracking-event.done .tracking-event-marker {
		background: #0EA394;
		box-shadow: 0 0 0 2px #0EA394;
		color: #fff;
	}

	.tracking-event.current .tracking-event-marker {
		background: #F5A524;
		box-shadow: 0 0 0 3px rgba(245, 165, 36, .22);
		color: #211200;
	}

	.tracking-event-title {
		color: #12213F;
		font-size: 13px;
		font-weight: 700;
		line-height: 1.4;
	}

	.tracking-event.pending .tracking-event-title {
		color: #697086;
		font-weight: 600;
	}

	.tracking-event-meta {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 4px;
		color: #9AA1B4;
		font-size: 11.5px;
		line-height: 1.4;
	}

	.tracking-event-meta svg {
		flex-shrink: 0;
	}

	.tracking-event-label {
		display: inline-flex;
		margin-top: 7px;
		padding: 4px 8px;
		border-radius: 999px;
		background: #FFF5DD;
		color: #8A5A05;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: .04em;
		text-transform: uppercase;
	}
`;

const defaultEvents = [
	{ title: 'Picked up by courier', meta: '12:40 PM · Vehicle #LK-1738', status: 'done', type: 'pickup' },
	{ title: 'Sorting hub scanned', meta: '1:05 PM · Central Hub, Colombo', status: 'done', type: 'hub' },
	{ title: 'Out for delivery', meta: '2:10 PM · Route 04 · Driver A. Fernando', status: 'current', type: 'delivery', label: 'Current location' },
	{ title: 'Customer confirmation pending', meta: 'Expected by 4:30 PM', status: 'pending', type: 'pending' },
];

function EventIcon({ event }) {
	if (event.status === 'done') return <Check size={11} strokeWidth={3} />;
	if (event.status === 'current') return <MapPin size={11} strokeWidth={3} />;
	if (event.type === 'pickup') return <PackageCheck size={11} />;
	return <Clock3 size={11} />;
}

export default function TrackingTimeline({ events = defaultEvents, items }) {
	const timelineEvents = items || events;

	return (
		<div className="tracking-timeline" aria-label="Shipment tracking timeline">
			<style>{styles}</style>

			{timelineEvents.map((event, index) => {
				const status = event.status || 'done';
				const eventKey = event.id || `${event.title}-${event.meta || index}`;

				return (
					<div key={eventKey} className={`tracking-event ${status}`}>
						<div className="tracking-event-marker" aria-hidden="true"><EventIcon event={{ ...event, status }} /></div>
						<div className="tracking-event-title">{event.title}</div>
						{event.meta && (
							<div className="tracking-event-meta">
								{event.location ? <MapPin size={12} /> : <Clock3 size={12} />}
								<span>{event.meta}</span>
							</div>
						)}
						{event.label && <span className="tracking-event-label">{event.label}</span>}
					</div>
				);
			})}
		</div>
	);
}
