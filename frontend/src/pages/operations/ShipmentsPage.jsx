import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import ShipmentTable from '../../components/shipment/ShipmentTable';

const styles = `
  .shipments-page {
    display: grid;
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

  .page-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .button {
    font-family: 'Sora', sans-serif;
    font-weight: 600;
    font-size: 13.5px;
    border-radius: 10px;
    padding: 11px 20px;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
  }

  .button-white {
    background: #fff;
    color: #12213F;
    border: 1px solid #E3E7EF;
  }

  .button-amber {
    background: #F5A524;
    color: #211200;
  }

  @media (max-width: 640px) {
    .page-head {
      flex-direction: column;
      align-items: flex-start;
    }

    .page-actions {
      width: 100%;
      justify-content: flex-start;
      flex-wrap: wrap;
    }
  }
`;

export default function ShipmentsPage() {
  const shipments = [
    { id: 'SH-28491', route: 'Colombo → Kandy', customer: 'Pasan Perera', status: 'In transit', eta: 'Today, 4:30 PM', amount: 'Rs 1,250', type: 'Domestic' },
    { id: 'SH-28492', route: 'Galle → Matara', customer: 'Nimal Silva', status: 'Out for delivery', eta: 'Today, 2:15 PM', amount: 'Rs 980', type: 'Same-Day' },
    { id: 'SH-28495', route: 'Negombo → Kurunegala', customer: 'Sajini Fernando', status: 'Delayed', eta: 'Tomorrow', amount: 'Rs 1,420', type: 'Express' },
    { id: 'SH-28501', route: 'Jaffna → Colombo', customer: 'Kavindu Raj', status: 'Delivered', eta: 'Completed', amount: 'Rs 1,890', type: 'Priority' },
    { id: 'SH-28502', route: 'Anuradhapura → Batticaloa', customer: 'Themiya Wickram', status: 'Awaiting pickup', eta: 'Today, 7:10 PM', amount: 'Rs 1,050', type: 'Regional' },
  ];

  return (
    <PortalLayout>
      <div className="shipments-page">
        <style>{styles}</style>

        <div className="page-head">
          <div>
            <div className="breadcrumb">Shipments / <strong>List</strong></div>
            <h1 className="page-title">Shipment management</h1>
          </div>

          <div className="page-actions">
            <button type="button" className="button button-white">
              <FileText size={15} />
              Export
            </button>

            <Link to="/shipments/new" className="button button-amber">
              <Plus size={15} />
              New shipment
            </Link>
          </div>
        </div>

        <ShipmentTable shipments={shipments} />
      </div>
    </PortalLayout>
  );
}
