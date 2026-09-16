import React from 'react';
import ShipmentStatusBadge from '../shipment/ShipmentStatusBadge';

const styles = `
  .pickup-list-shell {
    background: #fff;
    border: 1px solid #E3E7EF;
    border-radius: 14px;
    padding: 18px 20px;
  }

  .pickup-list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .pickup-list-title {
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 14.5px;
    color: #12213F;
  }

  .pickup-list-link {
    font-size: 12px;
    font-weight: 600;
    color: #3E7BFA;
  }

  .pickup-table-wrap {
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid #E3E7EF;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .04em;
    color: #9AA1B4;
    padding: 12px 14px;
    text-transform: uppercase;
    background: #F9FAFC;
  }

  td {
    padding: 13px 14px;
    border-top: 1px solid #E3E7EF;
    font-size: 13px;
    color: #12213F;
    vertical-align: middle;
  }

  tr.row-hover:hover td {
    background: #FAFBFD;
  }

  .pickup-id {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 12.5px;
    color: #12213F;
  }

  .pickup-customer {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .pickup-customer strong {
    font-size: 13px;
    color: #12213F;
  }

  .pickup-customer span {
    font-size: 11.5px;
    color: #9AA1B4;
  }

  .pickup-location {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .pickup-location .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #3E7BFA;
    display: inline-block;
  }

  .vehicle-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 5px 9px;
    border-radius: 999px;
    background: #EEF0F4;
    color: #697086;
    font-size: 11px;
    font-weight: 600;
  }
`;

const defaultItems = [
  { id: 'PU-2048', customer: 'Urban Mart', priority: 'High', window: 'Today · 9:00 AM', location: 'Colombo 07', vehicle: 'LK-1738', status: 'Confirmed', cod: 'Rs 28,500' },
  { id: 'PU-2049', customer: 'Nimal Silva', priority: 'Medium', window: 'Today · 11:30 AM', location: 'Galle Road', vehicle: 'LK-1821', status: 'Assigned', cod: 'Rs 12,900' },
  { id: 'PU-2050', customer: 'FreshCart', priority: 'High', window: 'Today · 1:15 PM', location: 'Kandy City', vehicle: 'LK-2109', status: 'Pending', cod: 'Rs 17,200' },
  { id: 'PU-2051', customer: 'Lanka Pharmacy', priority: 'Low', window: 'Tomorrow · 8:45 AM', location: 'Negombo', vehicle: 'LK-1180', status: 'Delayed', cod: 'Rs 9,400' },
];

export default function PickupList({ pickups = defaultItems }) {
  const data = pickups.length ? pickups : defaultItems;

  return (
    <div className="pickup-list-shell">
      <style>{styles}</style>

      <div className="pickup-list-header">
        <div className="pickup-list-title">Pickup queue</div>
        <div className="pickup-list-link">View all</div>
      </div>

      <div className="pickup-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Pickup ID</th>
              <th>Customer</th>
              <th>Pickup window</th>
              <th>Location</th>
              <th>Vehicle</th>
              <th>Status</th>
              <th>COD</th>
            </tr>
          </thead>
          <tbody>
            {data.map((pickup) => (
              <tr key={pickup.id} className="row-hover">
                <td>
                  <div className="pickup-id">{pickup.id}</div>
                </td>
                <td>
                  <div className="pickup-customer">
                    <strong>{pickup.customer}</strong>
                    <span>{pickup.priority} priority</span>
                  </div>
                </td>
                <td>{pickup.window}</td>
                <td>
                  <span className="pickup-location">
                    <span className="dot" />
                    {pickup.location}
                  </span>
                </td>
                <td>
                  <span className="vehicle-chip">{pickup.vehicle}</span>
                </td>
                <td>
                  <ShipmentStatusBadge status={pickup.status} />
                </td>
                <td>{pickup.cod}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
