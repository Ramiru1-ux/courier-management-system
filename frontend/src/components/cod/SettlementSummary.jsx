import React from 'react';
import { ArrowUpRight, CalendarClock, CheckCircle2, CircleDollarSign, Clock3 } from 'lucide-react';

const styles = `
	.settlement-summary {
		min-width: 0;
		padding: 20px;
		border: 1px solid #E3E7EF;
		border-radius: 14px;
		background: #fff;
	}

	.settlement-summary-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 18px;
	}

	.settlement-summary-title {
		color: #12213F;
		font-family: 'Sora', sans-serif;
		font-size: 15px;
		font-weight: 700;
	}

	.settlement-summary-subtitle {
		margin-top: 5px;
		color: #697086;
		font-size: 12px;
	}

	.settlement-period {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 7px 10px;
		border: 1px solid #E3E7EF;
		border-radius: 8px;
		color: #697086;
		font-size: 11px;
		font-weight: 600;
		white-space: nowrap;
	}

	.settlement-metrics {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 12px;
	}

	.settlement-metric {
		min-width: 0;
		padding: 13px;
		border: 1px solid #E3E7EF;
		border-radius: 10px;
		background: #F9FAFC;
	}

	.settlement-metric-label {
		color: #697086;
		font-size: 11px;
		font-weight: 600;
	}

	.settlement-metric-value {
		margin-top: 7px;
		overflow: hidden;
		color: #12213F;
		font-family: 'Sora', sans-serif;
		font-size: 19px;
		font-weight: 800;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.settlement-metric-change {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		margin-top: 6px;
		color: #0C8C6B;
		font-size: 10.5px;
		font-weight: 700;
	}

	.settlement-metric-change.down {
		color: #C4402F;
	}

	.settlement-progress-section {
		margin-top: 20px;
		padding-top: 18px;
		border-top: 1px solid #E3E7EF;
	}

	.settlement-progress-head,
	.settlement-payout-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.settlement-progress-label {
		color: #12213F;
		font-size: 12px;
		font-weight: 700;
	}

	.settlement-progress-value {
		color: #0C8C6B;
		font-size: 12px;
		font-weight: 800;
	}

	.settlement-progress-track {
		width: 100%;
		height: 9px;
		margin-top: 10px;
		overflow: hidden;
		border-radius: 999px;
		background: #E8EDF5;
	}

	.settlement-progress-fill {
		height: 100%;
		border-radius: inherit;
		background: linear-gradient(90deg, #0EA394, #3E7BFA);
		transition: width .25s ease;
	}

	.settlement-progress-caption {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		margin-top: 7px;
		color: #9AA1B4;
		font-size: 10.5px;
	}

	.settlement-payout {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 18px;
		padding: 12px;
		border-radius: 10px;
		background: #F9FAFC;
	}

	.settlement-payout-icon {
		width: 30px;
		height: 30px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		background: #FFF5DD;
		color: #9A6400;
		flex-shrink: 0;
	}

	.settlement-payout-label {
		color: #697086;
		font-size: 11px;
	}

	.settlement-payout-value {
		margin-top: 3px;
		color: #12213F;
		font-size: 12.5px;
		font-weight: 700;
	}

	.settlement-payout-action {
		margin-left: auto;
		padding: 7px 10px;
		border: 1px solid #E3E7EF;
		border-radius: 8px;
		background: #fff;
		color: #3E7BFA;
		font-size: 11px;
		font-weight: 700;
		cursor: pointer;
	}

	@media (max-width: 820px) {
		.settlement-metrics {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 560px) {
		.settlement-summary {
			padding: 16px;
		}

		.settlement-summary-header {
			flex-direction: column;
		}

		.settlement-metrics {
			grid-template-columns: 1fr;
		}

		.settlement-payout-row {
			align-items: flex-start;
			flex-direction: column;
		}

		.settlement-payout-action {
			margin-left: 0;
		}
	}
`;

/**
 * Empty placeholders, NOT sample figures.
 *
 * These used to be invented numbers - Rs 4.62L gross, 147 merchants,
 * "+6.8% vs last week", a next payout of "Urban Mart . Rs 88,000" - and the
 * component spread them UNDER the caller's real data. Any key the caller
 * happened not to pass was therefore rendered as a convincing fabricated
 * figure on a live finance screen. Blank is the honest answer when a number
 * has not been supplied.
 */
const emptySummary = {
	gross: 'Rs 0',
	pending: 'Rs 0',
	settled: 'Rs 0',
	merchants: '0',
	grossChange: '',
	pendingChange: '',
	settledChange: '',
	merchantChange: '',
	collected: 0,
	collectedAmount: 'Rs 0 collected',
	targetAmount: 'Rs 0 target',
	nextPayout: 'Nothing due',
	nextPayoutDue: '',
};

export default function SettlementSummary({
	summary = emptySummary,
	period = 'This week',
	onPayoutClick,
}) {
	const data = { ...emptySummary, ...summary };
	const progress = Math.min(Math.max(Number(data.collected) || 0, 0), 100);
	const metrics = [
		{ label: 'Gross COD', value: data.gross, change: data.grossChange, positive: true, icon: CircleDollarSign },
		{ label: 'Pending payouts', value: data.pending, change: data.pendingChange, positive: false, icon: Clock3 },
		{ label: 'Settled today', value: data.settled, change: data.settledChange, positive: true, icon: CheckCircle2 },
		{ label: 'Merchant balances', value: data.merchants, change: data.merchantChange, positive: true, icon: ArrowUpRight },
	];

	return (
		<section className="settlement-summary">
			<style>{styles}</style>

			<div className="settlement-summary-header">
				<div>
					<div className="settlement-summary-title">Settlement overview</div>
					<div className="settlement-summary-subtitle">Cash collection and merchant payout performance.</div>
				</div>
				<div className="settlement-period"><CalendarClock size={13} />{period}</div>
			</div>

			<div className="settlement-metrics">
				{metrics.map(({ label, value, change, positive, icon: Icon }) => (
					<div className="settlement-metric" key={label}>
						<div className="settlement-metric-label">{label}</div>
						<div className="settlement-metric-value">{value}</div>
						<div className={`settlement-metric-change ${positive ? '' : 'down'}`}>
							<Icon size={12} />
							{change}
						</div>
					</div>
				))}
			</div>

			<div className="settlement-progress-section">
				<div className="settlement-progress-head">
					<div className="settlement-progress-label">Collection progress</div>
					<div className="settlement-progress-value">{progress}%</div>
				</div>
				<div className="settlement-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress} aria-label="COD collection progress">
					<div className="settlement-progress-fill" style={{ width: `${progress}%` }} />
				</div>
				<div className="settlement-progress-caption"><span>{data.collectedAmount}</span><span>{data.targetAmount}</span></div>
			</div>

			<div className="settlement-payout">
				<div className="settlement-payout-icon"><CalendarClock size={15} /></div>
				<div>
					<div className="settlement-payout-label">Next payout</div>
					<div className="settlement-payout-value">{data.nextPayout}</div>
				</div>
				<div className="settlement-payout-row">
					<span className="settlement-payout-label">{data.nextPayoutDue}</span>
					{onPayoutClick && <button type="button" className="settlement-payout-action" onClick={onPayoutClick}>Review</button>}
				</div>
			</div>
		</section>
	);
}
