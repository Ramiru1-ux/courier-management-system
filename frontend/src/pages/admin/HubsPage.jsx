import React from 'react';
import { Activity, MapPinned, Plus, Warehouse } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';

const styles = `
	.hubs-page { display: grid; gap: 20px; padding: 24px; }
	.hubs-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
	.eyebrow { margin: 0 0 5px; color: #9AA1B4; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
	.page-title { margin: 0; color: #12213F; font: 700 22px 'Sora', sans-serif; }
	.page-subtitle { margin: 8px 0 0; color: #697086; font-size: 13px; }
	.primary-btn { display: inline-flex; align-items: center; gap: 8px; border: 1px solid #12213F; border-radius: 10px; padding: 10px 14px; background: #12213F; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; }
	.hub-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
	.stat-card, .hub-panel { border: 1px solid #E3E7EF; border-radius: 14px; background: #fff; }
	.stat-card { padding: 17px 18px; } .stat-label { color: #697086; font-size: 12px; font-weight: 600; } .stat-value { margin-top: 10px; color: #12213F; font: 800 26px 'Sora', sans-serif; } .stat-note { margin-top: 5px; color: #0C8C6B; font-size: 11.5px; font-weight: 600; }
	.hub-panel { padding: 18px 20px; overflow-x: auto; } .panel-title { margin: 0 0 14px; color: #12213F; font: 700 14.5px 'Sora', sans-serif; }
	table { width: 100%; border-collapse: collapse; min-width: 700px; } th { padding: 0 12px 10px; color: #9AA1B4; font-size: 11px; text-align: left; text-transform: uppercase; letter-spacing: .04em; } td { padding: 13px 12px; border-top: 1px solid #E3E7EF; color: #12213F; font-size: 13px; }
	.hub-name { font-weight: 700; } .muted { margin-top: 3px; color: #697086; font-size: 11.5px; } .status { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; padding: 5px 9px; background: #E4F7F4; color: #0C8C6B; font-size: 11px; font-weight: 700; } .status::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; } .edit-btn { border: 1px solid #E3E7EF; border-radius: 8px; padding: 6px 9px; background: #fff; color: #12213F; font-size: 11px; font-weight: 700; cursor: pointer; }
	@media (max-width: 700px) { .hubs-page { padding: 16px; } .hubs-head { align-items: flex-start; flex-direction: column; } .hub-stats { grid-template-columns: repeat(2, 1fr); } } @media (max-width: 460px) { .hub-stats { grid-template-columns: 1fr; } }
`;

const hubs = [
	{ name: 'Colombo Main Hub', code: 'HUB-CMB-01', branch: 'Colombo Central', capacity: '4,200 parcels', utilization: '78%', manager: 'Nimali Perera', status: 'Online' },
	{ name: 'Kandy Sorting Hub', code: 'HUB-KDY-02', branch: 'Kandy Operations', capacity: '2,100 parcels', utilization: '64%', manager: 'Ravindu Silva', status: 'Online' },
	{ name: 'Galle Cross-dock', code: 'HUB-GLL-03', branch: 'Galle South', capacity: '1,500 parcels', utilization: '51%', manager: 'Sanduni Jayasuriya', status: 'Online' },
	{ name: 'Negombo Transit Hub', code: 'HUB-NEG-04', branch: 'Negombo Regional', capacity: '1,200 parcels', utilization: '31%', manager: 'Dilshan Wimal', status: 'Maintenance' },
];

export default function HubsPage() {
	return <PortalLayout><div className="hubs-page"><style>{styles}</style>
		<div className="hubs-head"><div><p className="eyebrow">Administration</p><h1 className="page-title">Hubs and facilities</h1><p className="page-subtitle">Monitor sorting hubs, parcel capacity, and facility availability across the network.</p></div><button type="button" className="primary-btn"><Plus size={14} /> Add hub</button></div>
		<div className="hub-stats">{[['Active hubs', '18', '4 regional facilities', Warehouse], ['Network capacity', '9,000', 'parcels per day', Activity], ['Current utilization', '68%', 'Within target range', MapPinned], ['Service zones', '42', 'Fully mapped', MapPinned]].map(([label, value, note, Icon]) => <div className="stat-card" key={label}><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note"><Icon size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{note}</div></div>)}</div>
		<div className="hub-panel"><h2 className="panel-title">Facility directory</h2><table><thead><tr><th>Hub</th><th>Branch</th><th>Capacity</th><th>Utilization</th><th>Manager</th><th>Status</th><th /></tr></thead><tbody>{hubs.map((hub) => <tr key={hub.code}><td><div className="hub-name">{hub.name}</div><div className="muted">{hub.code}</div></td><td>{hub.branch}</td><td>{hub.capacity}</td><td>{hub.utilization}</td><td>{hub.manager}</td><td><span className="status">{hub.status}</span></td><td><button type="button" className="edit-btn">Manage</button></td></tr>)}</tbody></table></div>
	</div></PortalLayout>;
}
