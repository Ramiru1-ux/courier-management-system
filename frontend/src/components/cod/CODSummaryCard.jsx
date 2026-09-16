import React from 'react';
import { ArrowUpRight, CheckCircle2, Clock3, WalletCards } from 'lucide-react';

const styles = `
	.cod-summary-card {
		min-width: 0;
		padding: 18px;
		border: 1px solid #E3E7EF;
		border-radius: 14px;
		background: #fff;
	}

	.cod-summary-top,
	.cod-summary-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.cod-summary-label {
		color: #697086;
		font-size: 12px;
		font-weight: 700;
	}

	.cod-summary-period {
		color: #9AA1B4;
		font-size: 10.5px;
	}

	.cod-summary-icon {
		width: 32px;
		height: 32px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 9px;
		background: #E8EFFE;
		color: #2453B8;
	}

	.cod-summary-amount {
		margin-top: 14px;
		color: #12213F;
		font-family: 'Sora', sans-serif;
		font-size: 25px;
		font-weight: 800;
		line-height: 1.2;
	}

	.cod-summary-bottom {
		margin-top: 9px;
	}

	.cod-summary-delta {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		color: #0C8C6B;
		font-size: 11.5px;
		font-weight: 700;
	}

	.cod-summary-delta.down {
		color: #C4402F;
	}

	.cod-summary-count {
		color: #9AA1B4;
		font-size: 11px;
	}

	.cod-summary-status {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		margin-top: 14px;
		padding-top: 12px;
		border-top: 1px solid #E3E7EF;
		color: #087367;
		font-size: 11.5px;
		font-weight: 600;
	}

	.cod-summary-status.pending {
		color: #8A5A05;
	}

	.cod-summary-action {
		margin-top: 12px;
		padding: 0;
		border: none;
		background: transparent;
		color: #3E7BFA;
		font-size: 11.5px;
		font-weight: 700;
		cursor: pointer;
	}

	.cod-summary-action:hover {
		color: #2453B8;
	}
`;

export default function CODSummaryCard({
	label = 'COD collected',
	amount = 'Rs 0',
	delta = '',
	positive = true,
	count,
	period = 'Today',
	status = 'Collected',
	pending = false,
	icon: Icon = WalletCards,
	iconBackground = '#E8EFFE',
	iconColor = '#2453B8',
	actionLabel = 'View details',
	onAction,
}) {
	return (
		<article className="cod-summary-card">
			<style>{styles}</style>

			<div className="cod-summary-top">
				<div>
					<div className="cod-summary-label">{label}</div>
					<div className="cod-summary-period">{period}</div>
				</div>
				<div className="cod-summary-icon" style={{ background: iconBackground, color: iconColor }}>
					<Icon size={16} />
				</div>
			</div>

			<div className="cod-summary-amount">{amount}</div>

			{(delta || count !== undefined) && (
				<div className="cod-summary-bottom">
					{delta ? (
						<span className={`cod-summary-delta ${positive ? '' : 'down'}`}>
							<ArrowUpRight size={13} />
							{delta}
						</span>
					) : <span />}
					{count !== undefined && <span className="cod-summary-count">{count} transactions</span>}
				</div>
			)}

			<div className={`cod-summary-status ${pending ? 'pending' : ''}`}>
				{pending ? <Clock3 size={14} /> : <CheckCircle2 size={14} />}
				{status}
			</div>

			{onAction && (
				<button type="button" className="cod-summary-action" onClick={onAction}>
					{actionLabel}
				</button>
			)}
		</article>
	);
}
