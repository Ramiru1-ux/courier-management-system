import React from 'react';

const styles = `.common-loader{display:inline-flex;align-items:center;justify-content:center;gap:9px;color:#697086;font-size:12px}.common-loader-spinner{width:20px;height:20px;border:2px solid #D8DDE8;border-top-color:#3E7BFA;border-radius:50%;animation:common-loader-spin .8s linear infinite}.common-loader.small .common-loader-spinner{width:15px;height:15px}.common-loader.large .common-loader-spinner{width:28px;height:28px;border-width:3px}@keyframes common-loader-spin{to{transform:rotate(360deg)}}.common-loader-block{display:flex;min-height:120px;align-items:center;justify-content:center}`;

export default function Loader({ label = 'Loading...', size = 'medium', block = false, className = '' }) {
	return <div className={`${block ? 'common-loader-block ' : ''}${className}`.trim()}><style>{styles}</style><div className={`common-loader ${size}`} role="status" aria-live="polite"><span className="common-loader-spinner" />{label ? <span>{label}</span> : null}</div></div>;
}
