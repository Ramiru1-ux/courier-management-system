import React from 'react';

const styles = `
  .kpi-card {
    background: #fff;
    border: 1px solid #E3E7EF;
    border-radius: 14px;
    padding: 17px 18px;
  }

  .kpi-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .kpi-label {
    font-size: 12px;
    font-weight: 600;
    color: #697086;
  }

  .kpi-icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .kpi-value {
    font-family: 'Sora', sans-serif;
    font-weight: 800;
    font-size: 26px;
    color: #12213F;
    margin-top: 10px;
  }

  .kpi-delta {
    font-size: 11.5px;
    font-weight: 600;
    margin-top: 5px;
  }

  .kpi-delta.up {
    color: #0C8C6B;
  }

  .kpi-delta.down {
    color: #C4402F;
  }
`;

export default function KpiCard({
  label,
  value,
  delta,
  positive = true,
  icon: Icon,
  iconBg = '#E8EFFE',
  iconColor = '#10213F',
}) {
  return (
    <div className="kpi-card">
      <style>{styles}</style>

      <div className="kpi-top">
        <div className="kpi-label">{label}</div>
        {Icon ? (
          <div className="kpi-icon" style={{ background: iconBg }}>
            <Icon size={16} color={iconColor} />
          </div>
        ) : null}
      </div>

      <div className="kpi-value">{value}</div>
      <div className={`kpi-delta ${positive ? 'up' : 'down'}`}>
        {delta}
      </div>
    </div>
  );
}
