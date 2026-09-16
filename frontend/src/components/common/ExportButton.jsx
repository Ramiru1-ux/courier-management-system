import React, { useState } from 'react';
import { Check, Download, FileSpreadsheet } from 'lucide-react';

const styles = `
	.export-control { position: relative; display: inline-flex; }
	.export-button { display: inline-flex; align-items: center; gap: 8px; border: 1px solid #E3E7EF; border-radius: 10px; padding: 10px 13px; background: #fff; color: #12213F; font-size: 12px; font-weight: 700; cursor: pointer; }
	.export-button:hover { border-color: #3E7BFA; color: #2453B8; }
	.export-menu { position: absolute; z-index: 3; top: calc(100% + 6px); right: 0; width: 150px; padding: 5px; border: 1px solid #E3E7EF; border-radius: 10px; background: #fff; box-shadow: 0 10px 24px rgba(18,33,63,.12); }
	.export-option { display: flex; align-items: center; gap: 8px; width: 100%; border: 0; border-radius: 7px; padding: 9px 10px; background: transparent; color: #12213F; text-align: left; font-size: 12px; cursor: pointer; }
	.export-option:hover { background: #F3F5F9; }
	.export-success { display: inline-flex; align-items: center; gap: 7px; color: #0C8C6B; font-size: 12px; font-weight: 700; }
`;

export default function ExportButton({ onExport = () => {}, label = 'Export report' }) {
	const [open, setOpen] = useState(false);
	const [exported, setExported] = useState(false);

	const handleExport = (format) => {
		onExport(format);
		setOpen(false);
		setExported(true);
		window.setTimeout(() => setExported(false), 1800);
	};

	return <div className="export-control"><style>{styles}</style>{exported ? <span className="export-success"><Check size={14} /> Export ready</span> : <><button type="button" className="export-button" onClick={() => setOpen((current) => !current)}><Download size={14} /> {label}</button>{open ? <div className="export-menu"><button type="button" className="export-option" onClick={() => handleExport('csv')}><FileSpreadsheet size={14} /> CSV file</button><button type="button" className="export-option" onClick={() => handleExport('pdf')}><Download size={14} /> PDF report</button></div> : null}</>}</div>;
}
