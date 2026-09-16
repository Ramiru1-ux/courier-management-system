import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Download, FileCheck2, Plus, WalletCards } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import ReconciliationTable from '../../components/cod/ReconciliationTable';
import SettlementSummary from '../../components/cod/SettlementSummary';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import useStore from '../../hooks/useStore';
import { formatLKR } from '../../utils/shipmentStatus';

const styles = `
	.cod-management-page { display: flex; flex-direction: column; gap: 20px; }
	.cod-page-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
	.cod-breadcrumb { margin-bottom: 6px; color: #9AA1B4; font-size: 12px; font-weight: 500; }
	.cod-breadcrumb strong { color: #697086; }
	.cod-page-title { margin: 0; color: #12213F; font-family: 'Sora', sans-serif; font-size: 21px; font-weight: 700; }
	.cod-page-subtitle { margin: 8px 0 0; color: #697086; font-size: 13px; }
	.cod-page-actions { display: flex; align-items: center; gap: 10px; }
	.cod-notice { display: flex; align-items: center; gap: 9px; padding: 12px 14px; border: 1px solid #D7E4FB; border-radius: 10px; background: #F4F8FF; color: #2453B8; font-size: 12px; }
	.cod-notice strong { font-weight: 700; }
	.cod-notice-close { margin-left: auto; padding: 0; border: none; background: transparent; color: #2453B8; font-size: 11px; font-weight: 700; cursor: pointer; }
	.cod-field { display: grid; gap: 6px; margin-bottom: 12px; }
	.cod-field label { font-size: 12px; font-weight: 600; color: #697086; }
	.cod-field input, .cod-field select { border: 1.5px solid #E3E7EF; border-radius: 9px; padding: 10px 12px; font-size: 13px; }
	@media (max-width: 680px) { .cod-page-head { align-items: flex-start; flex-direction: column; } .cod-page-actions { width: 100%; flex-wrap: wrap; } }
`;

function toCsv(rows) {
	const header = 'Settlement,Merchant,Reference,Due,Expected,Collected,Status\n';
	const body = rows.map((r) => `${r.id},${r.merchant},${r.reference},${r.due},${r.expected},${r.collected},${r.status}`).join('\n');
	return header + body;
}

export default function CodManagementPage() {
	const { settlements, markSettlementCleared, markSettlementReview, createSettlement } = useStore();
	const [period, setPeriod] = useState('This week');
	const [notice, setNotice] = useState('Click a pending or review row to clear it once cash has been verified.');
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState({ merchant: '', reference: '', due: 'Today', expected: '' });

	const rows = useMemo(() => settlements.map((s) => ({
		id: s.id,
		merchant: s.merchant,
		reference: s.reference,
		due: s.due,
		expected: formatLKR(s.expected),
		collected: s.collected ? formatLKR(s.collected) : 'Pending',
		variance: s.expected === s.collected ? 'Rs 0' : formatLKR(s.expected - s.collected),
		status: s.status,
	})), [settlements]);

	const summary = useMemo(() => {
		const gross = settlements.reduce((sum, s) => sum + s.expected, 0);
		const pending = settlements.filter((s) => s.status !== 'Cleared').reduce((sum, s) => sum + (s.expected - s.collected), 0);
		const settled = settlements.filter((s) => s.status === 'Cleared').reduce((sum, s) => sum + s.collected, 0);
		const collectedPct = gross ? Math.round(((gross - pending) / gross) * 100) : 0;
		return {
			gross: formatLKR(gross), grossChange: `${settlements.length} settlements`,
			pending: formatLKR(pending), pendingChange: `${settlements.filter((s) => s.status !== 'Cleared').length} open`,
			settled: formatLKR(settled), settledChange: 'This period',
			merchants: String(new Set(settlements.map((s) => s.merchant)).size), merchantChange: 'Active merchants',
			collected: collectedPct, collectedAmount: `${formatLKR(gross - pending)} collected`, targetAmount: `${formatLKR(gross)} target`,
			nextPayout: settlements.find((s) => s.status !== 'Cleared') ? `${settlements.find((s) => s.status !== 'Cleared').merchant} · ${formatLKR(settlements.find((s) => s.status !== 'Cleared').expected)}` : 'All settled',
			nextPayoutDue: 'Due today',
		};
	}, [settlements]);

	const handleRowClick = (row) => {
		if (row.status === 'Cleared') {
			setNotice(`${row.id} for ${row.merchant} is already cleared.`);
			return;
		}
		markSettlementCleared(row.id);
		toast.success(`${row.id} marked cleared`);
		setNotice(`${row.id} for ${row.merchant} has been cleared.`);
	};

	const handleExport = () => {
		const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'cod-settlements.csv';
		link.click();
		URL.revokeObjectURL(url);
		toast.success('Settlement report exported');
	};

	const handleCreate = (event) => {
		event.preventDefault();
		if (!form.merchant || !form.reference || !form.expected) return;
		createSettlement({ merchant: form.merchant, reference: form.reference, due: form.due, expected: Number(form.expected) });
		toast.success('Settlement created');
		setForm({ merchant: '', reference: '', due: 'Today', expected: '' });
		setOpen(false);
	};

	return (
		<PortalLayout>
			<div className="cod-management-page">
				<style>{styles}</style>

				<div className="cod-page-head">
					<div>
						<div className="cod-breadcrumb">Finance / <strong>COD management</strong></div>
						<h1 className="cod-page-title">COD reconciliation</h1>
						<p className="cod-page-subtitle">Track collected cash, resolve variances, and prepare merchant settlements.</p>
					</div>

					<div className="cod-page-actions">
						<Button variant="secondary" icon={Download} onClick={handleExport}>Export report</Button>
						<Button variant="accent" icon={Plus} onClick={() => setOpen(true)}>Create settlement</Button>
					</div>
				</div>

				{notice && (
					<div className="cod-notice" role="status">
						<FileCheck2 size={16} />
						<span><strong>Status:</strong> {notice}</span>
						<button type="button" className="cod-notice-close" onClick={() => setNotice('')}>Dismiss</button>
					</div>
				)}

				<div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -8 }}>
					<label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#697086', fontSize: 12, fontWeight: 600 }}>
						Reporting period
						<select value={period} onChange={(event) => setPeriod(event.target.value)} style={{ minHeight: 34, padding: '7px 10px', border: '1px solid #E3E7EF', borderRadius: 8, background: '#fff', color: '#12213F', fontSize: 12 }}>
							<option>This week</option>
							<option>This month</option>
							<option>Last month</option>
						</select>
					</label>
				</div>

				<SettlementSummary summary={summary} period={period} />

				<ReconciliationTable rows={rows} onRowClick={handleRowClick} />

				<div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9AA1B4', fontSize: 11.5 }}>
					<WalletCards size={14} /> Click a pending or review row to mark it cleared. COD figures sync from delivery updates.
				</div>
			</div>

			<Modal
				open={open}
				onClose={() => setOpen(false)}
				title="Create settlement"
				description="Add a new merchant settlement to the reconciliation queue."
				footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" onClick={handleCreate}>Create</Button></>}
			>
				<form onSubmit={handleCreate}>
					<div className="cod-field"><label>Merchant</label><input value={form.merchant} onChange={(e) => setForm((p) => ({ ...p, merchant: e.target.value }))} placeholder="Urban Mart" /></div>
					<div className="cod-field"><label>Shipment reference</label><input value={form.reference} onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))} placeholder="EGW-2026-00001260" /></div>
					<div className="cod-field">
						<label>Due</label>
						<select value={form.due} onChange={(e) => setForm((p) => ({ ...p, due: e.target.value }))}>
							<option>Today</option>
							<option>Tomorrow</option>
							<option>This week</option>
						</select>
					</div>
					<div className="cod-field"><label>Expected amount (Rs)</label><input type="number" min="0" value={form.expected} onChange={(e) => setForm((p) => ({ ...p, expected: e.target.value }))} placeholder="25000" /></div>
				</form>
			</Modal>
		</PortalLayout>
	);
}
