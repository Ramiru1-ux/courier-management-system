import React from 'react';

const styles = `
  .shipment-timeline {
    position: relative;
    padding-left: 28px;
  }

  .shipment-timeline::before {
    content: "";
    position: absolute;
    left: 7px;
    top: 4px;
    bottom: 4px;
    width: 2px;
    background: #E3E7EF;
  }

  .timeline-item {
    position: relative;
    padding-bottom: 22px;
  }

  .timeline-item:last-child {
    padding-bottom: 0;
  }

  .timeline-dot {
    position: absolute;
    left: -27px;
    top: 2px;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #0EA394;
    border: 2.5px solid #fff;
    box-shadow: 0 0 0 2px #0EA394;
  }

  .timeline-item.pending .timeline-dot {
    background: #fff;
    box-shadow: 0 0 0 2px #E3E7EF;
  }

  .timeline-item.current .timeline-dot {
    background: #F5A524;
    box-shadow: 0 0 0 2px rgba(245, 165, 36, 0.25);
  }

  .timeline-title {
    font-size: 13px;
    font-weight: 600;
    color: #12213F;
    line-height: 1.4;
  }

  .timeline-meta {
    font-size: 11.5px;
    color: #9AA1B4;
    margin-top: 3px;
  }
`;

const defaultItems = [
  { title: 'Picked up by courier', meta: '12:40 PM · Vehicle #LK-1738', status: 'done' },
  { title: 'Sorting hub scanned', meta: '1:05 PM · Central Hub, Colombo', status: 'done' },
  { title: 'Out for delivery', meta: '2:10 PM · Route 04 · Driver A. Fernando', status: 'current' },
  { title: 'Customer confirmation pending', meta: 'Expected by 4:30 PM', status: 'pending' },
];

export default function ShipmentTimeline({ items = defaultItems }) {
  return (
    <div className="shipment-timeline">
      <style>{styles}</style>

      {items.map((item) => (
        <div
          key={`${item.title}-${item.meta}`}
          className={`timeline-item ${item.status || 'done'}`}
        >
          <div className="timeline-dot" />
          <div className="timeline-title">{item.title}</div>
          <div className="timeline-meta">{item.meta}</div>
        </div>
      ))}
    </div>
  );
}
