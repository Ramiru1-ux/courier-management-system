import React from 'react';

const styles = `
	.report-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
	.report-kpi { border: 1px solid #E3E7EF; border-radius: 14px; padding: 17px 18px; background: #fff; }
	.report-kpi-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
	.report-kpi-label { color: #697086; font-size: 12px; font-weight: 600; }
	.report-kpi-icon { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 8px; }
	.report-kpi-value { margin-top: 10px; color: #12213F; font: 800 25px 'Sora', sans-serif; }
	.report-kpi-delta { margin-top: 5px; color: #0C8C6B; font-size: 11.5px; font-weight: 600; }
	.report-kpi-delta.down { color: #C4402F; }
	@media (max-width: 900px) { .report-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
	@media (max-width: 520px) { .report-kpis { grid-template-columns: 1fr; } }
`;

export default function KpiDashboard({ metrics = [] }) {
	return <div className="report-kpis"><style>{styles}</style>{metrics.map((metric) => { const Icon = metric.icon; return <div className="report-kpi" key={metric.label}><div className="report-kpi-top"><div className="report-kpi-label">{metric.label}</div>{Icon ? <div className="report-kpi-icon" style={{ background: metric.iconBg || '#E8EFFE', color: metric.iconColor || '#2453B8' }}><Icon size={16} /></div> : null}</div><div className="report-kpi-value">{metric.value}</div><div className={`report-kpi-delta ${metric.positive === false ? 'down' : ''}`}>{metric.delta}</div></div>; })}</div>;
}
