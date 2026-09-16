import React from 'react';

const styles = `
  .shipment-table-shell {
    background: #fff;
    border: 1px solid #E3E7EF;
    border-radius: 14px;
    padding: 18px 20px;
  }

  .shipment-table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .shipment-table-title {
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 14.5px;
    color: #12213F;
  }

  .shipment-table-link {
    font-size: 12px;
    font-weight: 600;
    color: #3E7BFA;
  }

  .shipment-filters {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .filter-chip {
    display: flex;
    align-items: center;
    gap: 7px;
    background: #fff;
    border: 1px solid #E3E7EF;
    border-radius: 9px;
    padding: 8px 12px;
    font-size: 12.5px;
    font-weight: 500;
    color: #697086;
  }

  .filter-chip strong {
    color: #151A2E;
    font-weight: 600;
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
    padding: 0 14px 10px;
    text-transform: uppercase;
  }

  td {
    padding: 13px 14px;
    border-top: 1px solid #E3E7EF;
    font-size: 13px;
    vertical-align: middle;
  }

  tr.row-hover:hover td {
    background: #FAFBFD;
  }

  .tracking-id {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 12.5px;
    color: #12213F;
  }

  .cell-sub {
    font-size: 11.5px;
    color: #9AA1B4;
    margin-top: 2px;
  }

  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11.5px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 999px;
    letter-spacing: .01em;
  }

  .status-pill .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
  }

  .status-blue {
    background: #E8EFFE;
    color: #2453B8;
  }

  .status-blue .dot {
    background: #3E7BFA;
  }

  .status-amber {
    background: #FCEFD6;
    color: #8A5A05;
  }

  .status-amber .dot {
    background: #D9860F;
  }

  .status-coral {
    background: #FDE9E7;
    color: #B23528;
  }

  .status-coral .dot {
    background: #EF5B4E;
  }

  .status-teal {
    background: #E4F7F4;
    color: #087367;
  }

  .status-teal .dot {
    background: #0EA394;
  }
`;

function getStatusClass(status) {
  if (status === 'Delivered') return 'status-teal';
  if (status === 'Out for delivery') return 'status-amber';
  if (status === 'Delayed') return 'status-coral';
  return 'status-blue';
}

export default function ShipmentTable({ shipments = [] }) {
  const data = shipments.length
    ? shipments
    : [
        {
          id: 'SH-28491',
          route: 'Colombo → Kandy',
          customer: 'Pasan Perera',
          status: 'In transit',
          eta: 'Today, 4:30 PM',
          amount: 'Rs 1,250',
          type: 'Domestic',
        },
        {
          id: 'SH-28492',
          route: 'Galle → Matara',
          customer: 'Nimal Silva',
          status: 'Out for delivery',
          eta: 'Today, 2:15 PM',
          amount: 'Rs 980',
          type: 'Same-Day',
        },
        {
          id: 'SH-28495',
          route: 'Negombo → Kurunegala',
          customer: 'Sajini Fernando',
          status: 'Delayed',
          eta: 'Tomorrow',
          amount: 'Rs 1,420',
          type: 'Express',
        },
        {
          id: 'SH-28501',
          route: 'Jaffna → Colombo',
          customer: 'Kavindu Raj',
          status: 'Delivered',
          eta: 'Completed',
          amount: 'Rs 1,890',
          type: 'Priority',
        },
      ];

  return (
    <div className="shipment-table-shell">
      <style>{styles}</style>

      <div className="shipment-table-header">
        <div className="shipment-table-title">Active shipments</div>
        <div className="shipment-table-link">View all</div>
      </div>

      <div className="shipment-filters">
        <div className="filter-chip"><strong>All</strong></div>
        <div className="filter-chip">Status</div>
        <div className="filter-chip">Zone</div>
        <div className="filter-chip">Date range</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Tracking ID</th>
            <th>Route</th>
            <th>Customer</th>
            <th>Status</th>
            <th>ETA</th>
            <th>COD</th>
          </tr>
        </thead>
        <tbody>
          {data.map((shipment) => (
            <tr key={shipment.id} className="row-hover">
              <td>
                <div className="tracking-id">{shipment.id}</div>
              </td>
              <td>{shipment.route}</td>
              <td>
                <div>{shipment.customer}</div>
                <div className="cell-sub">{shipment.type}</div>
              </td>
              <td>
                <span className={`status-pill ${getStatusClass(shipment.status)}`}>
                  <span className="dot" />
                  {shipment.status}
                </span>
              </td>
              <td>{shipment.eta}</td>
              <td>{shipment.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
