import React from 'react';
import { LocateFixed, MapPin, Navigation } from 'lucide-react';

const styles = `
	.tracking-map {
		width: 100%;
		overflow: hidden;
		border: 1px solid #E3E7EF;
		border-radius: 14px;
		background: #fff;
	}

	.tracking-map-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
		padding: 16px 18px 14px;
	}

	.tracking-map-title {
		color: #12213F;
		font-family: 'Sora', sans-serif;
		font-size: 14.5px;
		font-weight: 700;
	}

	.tracking-map-subtitle {
		margin-top: 4px;
		color: #9AA1B4;
		font-size: 11.5px;
	}

	.tracking-map-action {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		border: none;
		background: transparent;
		color: #3E7BFA;
		font-size: 11.5px;
		font-weight: 700;
		cursor: pointer;
	}

	.tracking-map-canvas {
		position: relative;
		height: 340px;
		overflow: hidden;
		border-top: 1px solid #E3E7EF;
		background:
			linear-gradient(0deg, rgba(18, 33, 63, .05) 1px, transparent 1px) 0 0/30px 30px,
			linear-gradient(90deg, rgba(18, 33, 63, .05) 1px, transparent 1px) 0 0/30px 30px,
			#EAF0FB;
	}

	.tracking-map-water {
		position: absolute;
		width: 42%;
		height: 90%;
		right: -13%;
		top: 5%;
		border-radius: 50% 0 0 50%;
		background: rgba(62, 123, 250, .08);
		transform: rotate(-12deg);
	}

	.tracking-map-route {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.tracking-map-point {
		position: absolute;
		width: 14px;
		height: 14px;
		border: 3px solid #fff;
		border-radius: 50%;
		box-shadow: 0 3px 8px rgba(18, 33, 63, .25);
		transform: translate(-50%, -50%);
	}

	.tracking-map-point.active {
		width: 18px;
		height: 18px;
		border-color: #FFF5DD;
		box-shadow: 0 0 0 7px rgba(245, 165, 36, .2), 0 3px 8px rgba(18, 33, 63, .25);
	}

	.tracking-map-point-label {
		position: absolute;
		left: 12px;
		bottom: 13px;
		min-width: max-content;
		padding: 5px 8px;
		border: 1px solid rgba(18, 33, 63, .08);
		border-radius: 7px;
		background: rgba(255, 255, 255, .94);
		color: #12213F;
		font-size: 10.5px;
		font-weight: 700;
		box-shadow: 0 3px 10px rgba(18, 33, 63, .08);
	}

	.tracking-map-legend {
		position: absolute;
		left: 14px;
		bottom: 14px;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 10px;
		border: 1px solid #E3E7EF;
		border-radius: 9px;
		background: rgba(255, 255, 255, .94);
		color: #697086;
		font-size: 10.5px;
	}

	.tracking-map-legend-item {
		display: inline-flex;
		align-items: center;
		gap: 5px;
	}

	.tracking-map-legend-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	@media (max-width: 560px) {
		.tracking-map-header {
			align-items: flex-start;
			flex-direction: column;
		}

		.tracking-map-canvas {
			height: 280px;
		}

		.tracking-map-legend {
			gap: 7px;
			flex-wrap: wrap;
			max-width: calc(100% - 28px);
		}
	}
`;

const defaultPoints = [
	{ id: 'colombo', left: '19%', top: '58%', label: 'Colombo', color: '#0EA394', type: 'active' },
	{ id: 'kandy', left: '61%', top: '27%', label: 'Kandy', color: '#3E7BFA', type: 'hub' },
	{ id: 'galle', left: '45%', top: '75%', label: 'Galle', color: '#F5A524', type: 'selected' },
];

const defaultRoutes = [
	{ path: 'M70 230 C160 205, 205 100, 365 88 S500 75, 550 55', color: '#3E7BFA' },
	{ path: 'M140 290 C220 245, 300 230, 380 180 S475 120, 535 160', color: '#0EA394' },
];

export default function TrackingMap({
	points = defaultPoints,
	routes = defaultRoutes,
	title = 'Live tracking map',
	subtitle = 'Vehicle positions update automatically',
	onLocate,
	className = '',
}) {
	return (
		<section className={`tracking-map ${className}`.trim()} aria-label={title}>
			<style>{styles}</style>

			<div className="tracking-map-header">
				<div>
					<div className="tracking-map-title">{title}</div>
					<div className="tracking-map-subtitle">{subtitle}</div>
				</div>
				<button type="button" className="tracking-map-action" onClick={onLocate} disabled={!onLocate}>
					<LocateFixed size={14} />
					Center map
				</button>
			</div>

			<div className="tracking-map-canvas">
				<div className="tracking-map-water" aria-hidden="true" />

				<svg className="tracking-map-route" viewBox="0 0 600 340" preserveAspectRatio="none" aria-hidden="true">
					{routes.map((route, index) => (
						<path key={`${route.path}-${index}`} d={route.path} stroke={route.color || '#3E7BFA'} strokeWidth="2.5" fill="none" strokeDasharray="6 6" />
					))}
				</svg>

				{points.map((point, index) => (
					<div
						key={point.id || `${point.left}-${point.top}-${index}`}
						className={`tracking-map-point ${point.type === 'selected' ? 'active' : ''}`.trim()}
						style={{ left: point.left, top: point.top, background: point.color || '#0EA394' }}
						title={point.label || 'Tracking point'}
						role="img"
						aria-label={point.label || 'Tracking point'}
					>
						{point.label && <span className="tracking-map-point-label"><MapPin size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />{point.label}</span>}
					</div>
				))}

				<div className="tracking-map-legend">
					<span className="tracking-map-legend-item"><span className="tracking-map-legend-dot" style={{ background: '#F5A524' }} /> Selected</span>
					<span className="tracking-map-legend-item"><span className="tracking-map-legend-dot" style={{ background: '#0EA394' }} /> Active</span>
					<span className="tracking-map-legend-item"><span className="tracking-map-legend-dot" style={{ background: '#3E7BFA' }} /> Hub</span>
					<Navigation size={12} color="#9AA1B4" aria-label="Route line" />
				</div>
			</div>
		</section>
	);
}
