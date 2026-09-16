import React from 'react';
import { CheckCircle2, Clock3, MapPin, PackageOpen, TriangleAlert, XCircle } from 'lucide-react';

const styles = `
	.status-badge { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; padding: 5px 9px; font-size: 11px; font-weight: 700; line-height: 1; white-space: nowrap; }
	.status-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
	.status-badge.blue { background: #E8EFFE; color: #2453B8; }
	.status-badge.teal { background: #E4F7F4; color: #0C8C6B; }
	.status-badge.amber { background: #FCEFD6; color: #8A5A05; }
	.status-badge.coral { background: #FDE9E7; color: #B23528; }
	.status-badge.violet { background: #EEECFE; color: #5445D6; }
	.status-badge.neutral { background: #F0F2F6; color: #697086; }
	.status-badge-icon { display: inline-flex; }
`;

const statusMap = {
	delivered: { tone: 'teal', icon: CheckCircle2 },
	completed: { tone: 'teal', icon: CheckCircle2 },
	active: { tone: 'teal', icon: CheckCircle2 },
	healthy: { tone: 'teal', icon: CheckCircle2 },
	'in transit': { tone: 'blue', icon: PackageOpen },
	'out for delivery': { tone: 'amber', icon: MapPin },
	pending: { tone: 'amber', icon: Clock3 },
	delayed: { tone: 'coral', icon: TriangleAlert },
	failed: { tone: 'coral', icon: XCircle },
	cancelled: { tone: 'coral', icon: XCircle },
	review: { tone: 'violet', icon: TriangleAlert },
};

export default function StatusBadge({ status = 'Unknown', tone, icon: Icon, showIcon = false, className = '' }) {
	const config = statusMap[String(status).toLowerCase()] || {};
	const BadgeIcon = Icon || config.icon;
	const badgeTone = tone || config.tone || 'neutral';

	return <span className={`status-badge ${badgeTone} ${className}`.trim()}><style>{styles}</style>{showIcon && BadgeIcon ? <span className="status-badge-icon"><BadgeIcon size={12} /></span> : null}{status}</span>;
}
