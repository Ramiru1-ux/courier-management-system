import React from 'react';

const styles = `
  .live-map-widget {
    background: #fff;
    border: 1px solid #E3E7EF;
    border-radius: 14px;
    padding: 18px 20px;
  }

  .map-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .map-title {
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 14.5px;
    color: #12213F;
  }

  .map-link {
    font-size: 12px;
    font-weight: 600;
    color: #3E7BFA;
  }

  .map-box {
    height: 260px;
    border-radius: 12px;
    position: relative;
    overflow: hidden;
    border: 1px solid #E3E7EF;
    background:
      linear-gradient(0deg, rgba(18,33,63,.05) 1px, transparent 1px) 0 0/28px 28px,
      linear-gradient(90deg, rgba(18,33,63,.05) 1px, transparent 1px) 0 0/28px 28px,
      #EAF0FB;
  }

  .map-pin {
    position: absolute;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    border: 2.5px solid #fff;
    box-shadow: 0 2px 6px rgba(0,0,0,.25);
  }

  .map-route {
    position: absolute;
    inset: 0;
  }
`;

export default function LiveMapWidget({ points = [] }) {
  const defaultPoints = [
    { left: '15%', top: '42%', color: '#0EA394' },
    { left: '31%', top: '17%', color: '#3E7BFA' },
    { left: '48%', top: '62%', color: '#EF5B4E' },
    { left: '68%', top: '35%', color: '#F5A524' },
    { left: '82%', top: '58%', color: '#7C6CF0' },
  ];

  const pins = points.length ? points : defaultPoints;

  return (
    <div className="live-map-widget">
      <style>{styles}</style>

      <div className="map-header">
        <div className="map-title">Regional dispatch map</div>
        <div className="map-link">Open routes</div>
      </div>

      <div className="map-box">
        <svg className="map-route" viewBox="0 0 600 260" preserveAspectRatio="none" aria-hidden="true">
          <path d="M45 200 C120 160, 150 110, 230 138 S360 190, 430 150 S520 80, 560 102" stroke="#3E7BFA" strokeWidth="2.5" fill="none" strokeDasharray="5 5" />
          <path d="M150 80 C190 120, 200 150, 280 170 S410 180, 520 150" stroke="#F5A524" strokeWidth="2.5" fill="none" strokeDasharray="5 5" />
        </svg>

        {pins.map((point, index) => (
          <div
            key={`${point.left}-${point.top}-${index}`}
            className="map-pin"
            style={{ left: point.left, top: point.top, background: point.color || '#0EA394' }}
          />
        ))}
      </div>
    </div>
  );
}
