import React, { useMemo, useState } from 'react';
import { CalendarClock, CircleDashed, Clock3, Plus, Truck } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import SearchBar from '../../components/common/SearchBar';
import FilterPanel from '../../components/common/FilterPanel';
import Pagination from '../../components/common/Pagination';
import ShipmentStatusBadge from '../../components/shipment/ShipmentStatusBadge';

const styles = `
  .pickups-page {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .page-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
  }

  .breadcrumb {
    font-size: 12px;
    color: #9AA1B4;
    font-weight: 500;
    margin-bottom: 6px;
  }

  .breadcrumb strong {
    color: #697086;
  }

  .page-title {
    margin: 0;
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 21px;
    color: #12213F;
  }

  .page-subtitle {
    color: #697086;
    font-size: 13px;
    margin: 8px 0 0;
  }

  .page-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .action-button {
    border: none;
    border-radius: 10px;
    padding: 11px 18px;
    font-family: 'Sora', sans-serif;
    font-weight: 600;
    font-size: 13.5px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .action-button:hover {
    transform: translateY(-1px);
  }

  .action-button.primary {
    background: #F5A524;
    color: #211200;
  }

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(160px, 1fr));
    gap: 14px;
  }

  .kpi-card {
    background: #fff;
    border: 1px solid #E3E7EF;
    border-radius: 14px;
    padding: 17px 18px;
  }

  .kpi-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .kpi-label {
    font-size: 12px;
    font-weight: 600;
    color: #697086;
  }

  .kpi-icon {
    width: 32px;
    height: 32px;
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
    line-height: 1.2;
  }

  .kpi-delta {
    margin-top: 5px;
    font-size: 11.5px;
    font-weight: 600;
  }

  .kpi-delta.up {
    color: #0C8C6B;
  }

  .kpi-delta.down {
    color: #C4402F;
  }

  .panel {
    background: #fff;
    border: 1px solid #E3E7EF;
    border-radius: 14px;
    padding: 18px 20px;
  }

  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }

  .panel-title {
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 14.5px;
    color: #12213F;
  }

  .panel-link {
    font-size: 12px;
    font-weight: 600;
    color: #3E7BFA;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }

  .table-shell {
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
    letter-spacing: .04em;
    font-weight: 700;
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

  .cell-sub {
    font-size: 11.5px;
    color: #9AA1B4;
    margin-top: 2px;
  }

  .location {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .location-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #3E7BFA;
    display: inline-block;
  }

  .route-pill {
    display: inline-flex;
    align-items: center;
    padding: 5px 9px;
    border-radius: 999px;
    background: #EEF0F4;
    color: #697086;
    font-size: 11px;
    font-weight: 600;
  }

  @media (max-width: 900px) {
    .kpi-grid {
      grid-template-columns: repeat(2, minmax(160px, 1fr));
    }
  }

  @media (max-width: 640px) {
    .page-head, .toolbar {
      flex-direction: column;
      align-items: flex-start;
    }

    .kpi-grid {
      grid-template-columns: 1fr;
    }

    .panel-head {
      align-items: flex-start;
      flex-direction: column;
    }
  }
`;

const pickupRequests = [
  { id: 'PU-2048', customer: 'Urban Mart', location: 'Colombo 07', window: 'Today · 9:00 AM', vehicle: 'LK-1738', status: 'Confirmed', cod: 'Rs 28,500', priority: 'High' },
  { id: 'PU-2049', customer: 'Nimal Silva', location: 'Galle Road', window: 'Today · 11:30 AM', vehicle: 'LK-1821', status: 'Assigned', cod: 'Rs 12,900', priority: 'Medium' },
  { id: 'PU-2050', customer: 'FreshCart', location: 'Kandy City', window: 'Today · 1:15 PM', vehicle: 'LK-2109', status: 'Pending', cod: 'Rs 17,200', priority: 'High' },
  { id: 'PU-2051', customer: 'Lanka Pharmacy', location: 'Negombo', window: 'Tomorrow · 8:45 AM', vehicle: 'LK-1180', status: 'Delayed', cod: 'Rs 9,400', priority: 'Low' },
  { id: 'PU-2052', customer: 'Galle Home Center', location: 'Matara', window: 'Tomorrow · 10:30 AM', vehicle: 'LK-2055', status: 'Confirmed', cod: 'Rs 21,700', priority: 'Medium' },
  { id: 'PU-2053', customer: 'Jaffna Market', location: 'Jaffna', window: 'Tomorrow · 12:20 PM', vehicle: 'LK-1354', status: 'Assigned', cod: 'Rs 15,600', priority: 'High' },
  { id: 'PU-2054', customer: 'City Mart', location: 'Kurunegala', window: 'Wed · 9:15 AM', vehicle: 'LK-2137', status: 'Pending', cod: 'Rs 11,300', priority: 'Medium' },
  { id: 'PU-2055', customer: 'Mithuru Foods', location: 'Anuradhapura', window: 'Wed · 2:00 PM', vehicle: 'LK-1772', status: 'Confirmed', cod: 'Rs 19,600', priority: 'High' },
];

const kpis = [
  { label: 'Pickup requests', value: '128', delta: '+12.4%', up: true, color: '#E8EFFE', icon: CalendarClock },
  { label: 'Assigned today', value: '46', delta: '+8.1%', up: true, color: '#E4F7F4', icon: Truck },
  { label: 'Pending review', value: '18', delta: '-3.2%', up: false, color: '#FDE9E7', icon: CircleDashed },
  { label: 'Avg. pickup ETA', value: '42m', delta: '-11m', up: true, color: '#EFEBFD', icon: Clock3 },
];

export default function PickupsPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return pickupRequests;

    return pickupRequests.filter((pickup) => {
      return [pickup.id, pickup.customer, pickup.location, pickup.vehicle, pickup.status]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <PortalLayout>
      <div className="pickups-page">
        <style>{styles}</style>

        <div className="page-head">
          <div>
            <div className="breadcrumb">Operations / <strong>Pickups</strong></div>
            <h1 className="page-title">Pickup management</h1>
            <p className="page-subtitle">Monitor confirmed pickups, assign vehicles, and track collection times.</p>
          </div>

          <div className="page-actions">
            <button type="button" className="action-button primary">
              <Plus size={15} />
              Schedule pickup
            </button>
          </div>
        </div>

        <div className="kpi-grid">
          {kpis.map(({ label, value, delta, up, color, icon: Icon }) => (
            <div key={label} className="kpi-card">
              <div className="kpi-top">
                <div className="kpi-label">{label}</div>
                <div className="kpi-icon" style={{ background: color }}>
                  <Icon size={16} color="#10213F" />
                </div>
              </div>
              <div className="kpi-value">{value}</div>
              <div className={`kpi-delta ${up ? 'up' : 'down'}`}>{delta} vs last week</div>
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Pickup queue</div>
            <div className="panel-link">Export list</div>
          </div>

          <div className="toolbar">
            <SearchBar
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search pickup id, customer, or driver"
              width="360px"
            />

            <FilterPanel
              filters={[
                { label: 'All', value: 'all', active: true },
                { label: 'Today', value: 'today' },
                { label: 'Priority', value: 'priority' },
                { label: 'Assigned', value: 'assigned' },
              ]}
              activeFilter="all"
            />
          </div>

          <div className="table-shell">
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
                {pageItems.map((pickup) => (
                  <tr key={pickup.id} className="row-hover">
                    <td>
                      <div className="pickup-id">{pickup.id}</div>
                    </td>
                    <td>
                      <div>{pickup.customer}</div>
                      <div className="cell-sub">{pickup.priority} priority</div>
                    </td>
                    <td>{pickup.window}</td>
                    <td>
                      <div className="location">
                        <span className="location-dot" />
                        {pickup.location}
                      </div>
                    </td>
                    <td>
                      <span className="route-pill">{pickup.vehicle}</span>
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

          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filtered.length}
            onPageChange={(nextPage) => setPage(nextPage)}
          />
        </div>
      </div>
    </PortalLayout>
  );
}
