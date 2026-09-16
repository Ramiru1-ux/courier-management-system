import React from 'react';

const styles = `
	.report-chart { border: 1px solid #E3E7EF; border-radius: 14px; padding: 18px 20px; background: #fff; }
	.report-chart-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 16px; }
	.report-chart-title { margin: 0; color: #12213F; font: 700 14.5px 'Sora', sans-serif; }
	.report-chart-meta { color: #697086; font-size: 11.5px; }
	.chart-area { display: flex; align-items: stretch; gap: 10px; height: 210px; }
	.chart-axis { display: flex; flex-direction: column; justify-content: space-between; padding: 3px 0 20px; color: #9AA1B4; font-size: 10px; }
	.chart-stage { position: relative; flex: 1; min-width: 0; border-bottom: 1px solid #E3E7EF; background: repeating-linear-gradient(to bottom, transparent 0, transparent 51px, #EEF1F6 52px); }
	.chart-svg { position: absolute; inset: 0 0 20px; width: 100%; height: calc(100% - 20px); overflow: visible; }
	.chart-labels { position: absolute; right: 0; bottom: 0; left: 0; display: flex; justify-content: space-between; color: #9AA1B4; font-size: 10px; }
	@media (max-width: 520px) { .report-chart { padding: 16px; } .chart-area { height: 180px; } }
`;

export default function ReportChart({ title = 'Performance trend', meta = 'Last 7 days', data = [], color = '#3E7BFA', labels }) {
	const values = data.length ? data : [42, 58, 48, 72, 64, 84, 78];
	const chartLabels = labels || values.map((_, index) => `D${index + 1}`);
	const max = Math.max(...values, 1);
	const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${92 - (value / max) * 78}`).join(' ');

	return <div className="report-chart"><style>{styles}</style><div className="report-chart-head"><h2 className="report-chart-title">{title}</h2><span className="report-chart-meta">{meta}</span></div><div className="chart-area"><div className="chart-axis"><span>{max}</span><span>{Math.round(max / 2)}</span><span>0</span></div><div className="chart-stage"><svg className="chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label={title} role="img"><polyline points={points} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />{values.map((value, index) => <circle key={`${value}-${index}`} cx={(index / Math.max(values.length - 1, 1)) * 100} cy={92 - (value / max) * 78} r="1.8" fill="#fff" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />)}</svg><div className="chart-labels">{chartLabels.map((label) => <span key={label}>{label}</span>)}</div></div></div></div>;
}
