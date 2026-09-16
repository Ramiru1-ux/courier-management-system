import React, { useMemo, useState } from 'react';

const styles = `
	.audit-table-wrap { overflow-x: auto; } .audit-table { width: 100%; border-collapse: collapse; min-width: 780px; } .audit-table th { padding: 0 12px 10px; color: #9AA1B4; font-size: 11px; text-align: left; text-transform: uppercase; letter-spacing: .04em; } .audit-table td { padding: 13px 12px; border-top: 1px solid #E3E7EF; color: #12213F; font-size: 13px; } .audit-user { font-weight: 700; } .muted { margin-top: 3px; color: #697086; font-size: 11.5px; } .audit-action { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; padding: 5px 9px; background: #E8EFFE; color: #2453B8; font-size: 11px; font-weight: 700; } .audit-action::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; } .audit-id { color: #697086; font: 12px 'IBM Plex Mono', monospace; } .audit-filter { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; } .audit-filter button { border: 1px solid #E3E7EF; border-radius: 9px; padding: 7px 10px; background: #fff; color: #697086; font-size: 11.5px; font-weight: 700; cursor: pointer; } .audit-filter button.active { background: #12213F; border-color: #12213F; color: #fff; }
`;

const defaultEntries = [
	{ id: 'AUD-92041', user: 'Nimali Perera', role: 'Operations Admin', action: 'Updated shipment', target: 'SH-28491', time: 'Today, 10:42 AM', category: 'Operations' },
	{ id: 'AUD-92040', user: 'Ravindu Silva', role: 'Dispatch Manager', action: 'Assigned driver', target: 'DRV-014 / Route 08', time: 'Today, 10:31 AM', category: 'Operations' },
	{ id: 'AUD-92039', user: 'Sanduni Jayasuriya', role: 'Finance Controller', action: 'Approved settlement', target: 'SET-00482', time: 'Today, 10:18 AM', category: 'Finance' },
	{ id: 'AUD-92038', user: 'System', role: 'Automation', action: 'Rotated API key', target: 'Analytics connector', time: 'Today, 09:56 AM', category: 'Security' },
	{ id: 'AUD-92037', user: 'Dilshan Wimal', role: 'Support Lead', action: 'Closed ticket', target: 'TKT-1832', time: 'Today, 09:44 AM', category: 'Support' },
];

export default function AuditLogTable({ entries = defaultEntries }) {
	const [category, setCategory] = useState('All');
	const categories = ['All', 'Operations', 'Finance', 'Security', 'Support'];
	const filteredEntries = useMemo(() => category === 'All' ? entries : entries.filter((entry) => entry.category === category), [category, entries]);

	return <div className="audit-table-wrap"><style>{styles}</style><div className="audit-filter">{categories.map((item) => <button key={item} type="button" className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div><table className="audit-table"><thead><tr><th>Event</th><th>Action</th><th>Target</th><th>Time</th><th>Event ID</th></tr></thead><tbody>{filteredEntries.map((entry) => <tr key={entry.id}><td><div className="audit-user">{entry.user}</div><div className="muted">{entry.role}</div></td><td><span className="audit-action">{entry.action}</span></td><td>{entry.target}</td><td>{entry.time}</td><td><span className="audit-id">{entry.id}</span></td></tr>)}</tbody></table></div>;
}
