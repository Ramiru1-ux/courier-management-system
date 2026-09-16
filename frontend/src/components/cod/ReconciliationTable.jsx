import React, { useMemo, useState } from 'react';
import { CheckCircle2, Filter, Search, TriangleAlert } from 'lucide-react';
import Pagination from '../common/Pagination';

const styles = `
	.reconciliation-table {
		min-width: 0;
		padding: 18px 20px;
		border: 1px solid #E3E7EF;
		border-radius: 14px;
		background: #fff;
	}

	.reconciliation-header,
	.reconciliation-toolbar,
	.reconciliation-title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
	}

	.reconciliation-header {
		margin-bottom: 16px;
	}

	.reconciliation-title {
		color: #12213F;
		font-family: 'Sora', sans-serif;
		font-size: 14.5px;
		font-weight: 700;
	}

	.reconciliation-subtitle {
		margin-top: 4px;
		color: #9AA1B4;
		font-size: 11.5px;
	}

	.reconciliation-total {
		color: #12213F;
		font-family: 'Sora', sans-serif;
		font-size: 16px;
		font-weight: 800;
		text-align: right;
	}

	.reconciliation-total-label {
		display: block;
		margin-top: 3px;
		color: #9AA1B4;
		font-family: 'Inter', sans-serif;
		font-size: 10.5px;
		font-weight: 500;
	}

	.reconciliation-toolbar {
		align-items: stretch;
		flex-wrap: wrap;
		margin-bottom: 14px;
	}

	.reconciliation-search {
		position: relative;
		display: flex;
		align-items: center;
		flex: 1;
		min-width: 220px;
	}

	.reconciliation-search svg {
		position: absolute;
		left: 12px;
		color: #9AA1B4;
	}

	.reconciliation-search input,
	.reconciliation-filter {
		min-height: 40px;
		border: 1px solid #E3E7EF;
		border-radius: 9px;
		background: #fff;
		color: #151A2E;
		font-size: 12.5px;
	}

	.reconciliation-search input {
		width: 100%;
		padding: 9px 12px 9px 35px;
	}

	.reconciliation-search input:focus,
	.reconciliation-filter:focus {
		outline: none;
		border-color: #F5A524;
		box-shadow: 0 0 0 4px rgba(245, 165, 36, .1);
	}

	.reconciliation-filter {
		min-width: 145px;
		padding: 9px 12px;
	}

	.reconciliation-filter-wrap {
		position: relative;
		display: flex;
		align-items: center;
	}

	.reconciliation-filter-wrap svg {
		position: absolute;
		left: 11px;
		color: #697086;
		pointer-events: none;
	}

	.reconciliation-filter-wrap select {
		padding-left: 34px;
	}

	.reconciliation-table-shell {
		overflow-x: auto;
		border: 1px solid #E3E7EF;
		border-radius: 11px;
	}

	.reconciliation-table-grid {
		width: 100%;
		min-width: 850px;
		border-collapse: collapse;
	}

	.reconciliation-table-grid th {
		padding: 12px 13px;
		background: #F9FAFC;
		color: #9AA1B4;
		font-size: 10.5px;
		font-weight: 700;
		letter-spacing: .04em;
		text-align: left;
		text-transform: uppercase;
	}

	.reconciliation-table-grid td {
		padding: 13px;
		border-top: 1px solid #E3E7EF;
		color: #12213F;
		font-size: 12.5px;
		vertical-align: middle;
	}

	.reconciliation-table-grid tr.clickable-row {
		cursor: pointer;
	}

	.reconciliation-table-grid tr.clickable-row:hover td {
		background: #FAFBFD;
	}

	.reconciliation-reference {
		color: #12213F;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 12px;
		font-weight: 700;
	}

	.reconciliation-subtext {
		margin-top: 3px;
		color: #9AA1B4;
		font-size: 11px;
	}

	.reconciliation-amount {
		font-weight: 700;
		white-space: nowrap;
	}

	.reconciliation-variance {
		color: #C4402F;
		font-weight: 700;
		white-space: nowrap;
	}

	.reconciliation-variance.clear {
		color: #0C8C6B;
	}

	.reconciliation-status {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 5px 9px;
		border-radius: 999px;
		background: #E8EFFE;
		color: #2453B8;
		font-size: 11px;
		font-weight: 700;
		white-space: nowrap;
	}

	.reconciliation-status.pending {
		background: #FCEFD6;
		color: #8A5A05;
	}

	.reconciliation-status.review {
		background: #FDE9E7;
		color: #B23528;
	}

	.reconciliation-status.cleared {
		background: #E4F7F4;
		color: #087367;
	}

	.reconciliation-empty {
		padding: 30px 16px;
		color: #697086;
		font-size: 12.5px;
		text-align: center;
	}

	@media (max-width: 620px) {
		.reconciliation-table {
			padding: 16px;
		}

		.reconciliation-header,
		.reconciliation-title-row {
			align-items: flex-start;
			flex-direction: column;
		}

		.reconciliation-total {
			text-align: left;
		}

		.reconciliation-search,
		.reconciliation-filter-wrap,
		.reconciliation-filter {
			width: 100%;
		}
	}
`;

const defaultRows = [
	{ id: 'SET-4402', merchant: 'Urban Mart', reference: 'SH-28491', due: 'Today', expected: 'Rs 88,000', collected: 'Rs 88,000', variance: 'Rs 0', status: 'Cleared' },
	{ id: 'SET-4415', merchant: 'FreshCart', reference: 'SH-28495', due: 'Tomorrow', expected: 'Rs 62,400', collected: 'Rs 58,900', variance: '-Rs 3,500', status: 'Review required' },
	{ id: 'SET-4429', merchant: 'DrugCart', reference: 'SH-28501', due: 'Today', expected: 'Rs 51,200', collected: 'Rs 51,200', variance: 'Rs 0', status: 'Cleared' },
	{ id: 'SET-4436', merchant: 'Lanka Pharmacy', reference: 'SH-28509', due: 'Today', expected: 'Rs 34,800', collected: 'Pending', variance: 'Pending', status: 'Pending' },
	{ id: 'SET-4441', merchant: 'City Mart', reference: 'SH-28512', due: 'Friday', expected: 'Rs 42,600', collected: 'Rs 42,600', variance: 'Rs 0', status: 'Cleared' },
	{ id: 'SET-4448', merchant: 'Mithuru Foods', reference: 'SH-28518', due: 'Friday', expected: 'Rs 27,900', collected: 'Pending', variance: 'Pending', status: 'Pending' },
];

function statusClass(status) {
	const normalized = String(status).toLowerCase();
	if (normalized.includes('review')) return 'review';
	if (normalized.includes('pending')) return 'pending';
	if (normalized.includes('clear')) return 'cleared';
	return '';
}

function statusIcon(status) {
	return String(status).toLowerCase().includes('review') ? <TriangleAlert size={12} /> : <CheckCircle2 size={12} />;
}

export default function ReconciliationTable({ rows = defaultRows, onRowClick }) {
	const [query, setQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [page, setPage] = useState(1);
	const pageSize = 5;

	const filteredRows = useMemo(() => {
		const term = query.trim().toLowerCase();

		return rows.filter((row) => {
			const matchesQuery = !term || [row.id, row.merchant, row.reference, row.due, row.status].join(' ').toLowerCase().includes(term);
			const matchesStatus = statusFilter === 'all' || statusClass(row.status) === statusFilter;
			return matchesQuery && matchesStatus;
		});
	}, [query, rows, statusFilter]);

	const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
	const safePage = Math.min(page, totalPages);
	const visibleRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize);

	const handleQueryChange = (event) => {
		setQuery(event.target.value);
		setPage(1);
	};

	const handleStatusChange = (event) => {
		setStatusFilter(event.target.value);
		setPage(1);
	};

	return (
		<section className="reconciliation-table">
			<style>{styles}</style>

			<div className="reconciliation-header">
				<div>
					<div className="reconciliation-title">COD reconciliation queue</div>
					<div className="reconciliation-subtitle">Review collected cash before merchant settlement.</div>
				</div>
				<div className="reconciliation-total">
					{rows.length} records
					<span className="reconciliation-total-label">Current settlement batch</span>
				</div>
			</div>

			<div className="reconciliation-toolbar">
				<label className="reconciliation-search">
					<Search size={15} />
					<input type="search" value={query} onChange={handleQueryChange} placeholder="Search merchant or settlement reference" aria-label="Search reconciliation records" />
				</label>
				<label className="reconciliation-filter-wrap">
					<Filter size={14} />
					<select className="reconciliation-filter" value={statusFilter} onChange={handleStatusChange} aria-label="Filter settlement status">
						<option value="all">All statuses</option>
						<option value="pending">Pending</option>
						<option value="review">Review required</option>
						<option value="cleared">Cleared</option>
					</select>
				</label>
			</div>

			<div className="reconciliation-table-shell">
				<table className="reconciliation-table-grid">
					<thead>
						<tr>
							<th>Settlement</th>
							<th>Merchant</th>
							<th>Due</th>
							<th>Expected</th>
							<th>Collected</th>
							<th>Variance</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{visibleRows.length ? visibleRows.map((row) => (
							<tr key={row.id} className={onRowClick ? 'clickable-row' : ''} onClick={() => onRowClick?.(row)}>
								<td>
									<div className="reconciliation-reference">{row.id}</div>
									<div className="reconciliation-subtext">{row.reference}</div>
								</td>
								<td>{row.merchant}</td>
								<td>{row.due}</td>
								<td className="reconciliation-amount">{row.expected}</td>
								<td className="reconciliation-amount">{row.collected}</td>
								<td className={`reconciliation-variance ${row.variance === 'Rs 0' ? 'clear' : ''}`}>{row.variance}</td>
								<td><span className={`reconciliation-status ${statusClass(row.status)}`}>{statusIcon(row.status)}{row.status}</span></td>
							</tr>
						)) : (
							<tr><td colSpan="7" className="reconciliation-empty">No reconciliation records match your filters.</td></tr>
						)}
					</tbody>
				</table>
			</div>

			<Pagination currentPage={safePage} totalPages={totalPages} pageSize={pageSize} totalItems={filteredRows.length} onPageChange={setPage} />
		</section>
	);
}
