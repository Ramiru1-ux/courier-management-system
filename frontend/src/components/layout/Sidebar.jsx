import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  MapPinned,
  PackageOpen,
  Plus,
  Settings,
  ShieldCheck,
  Truck,
  WalletCards,
} from 'lucide-react';

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/shipments', label: 'Shipments', icon: PackageOpen },
  { to: '/shipments/new', label: 'Create Shipment', icon: Plus },
  { to: '/tracking', label: 'Tracking', icon: MapPinned },
  { to: '/finance', label: 'COD & Finance', icon: WalletCards },
  { to: '/drivers', label: 'Drivers', icon: Truck },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const styles = `
  .sidebar-shell {
    width: 236px;
    background: #12213F;
    color: #C7D0EA;
    padding: 22px 16px 24px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex-shrink: 0;
  }

  .sidebar-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 4px 8px 22px;
  }

  .sidebar-brand-mark {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    background: linear-gradient(135deg, #F5A524, #D9860F);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #211200;
    font-family: 'Sora', sans-serif;
    font-weight: 800;
    font-size: 14px;
  }

  .sidebar-brand-name {
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 14.5px;
    color: #fff;
    line-height: 1.15;
  }

  .sidebar-brand-sub {
    font-size: 10.5px;
    color: #8792B0;
    font-weight: 500;
  }

  .sidebar-group-label {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: .06em;
    color: #5F6A8C;
    margin: 16px 10px 6px;
    text-transform: uppercase;
  }

  .sidebar-link {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 9px 11px;
    border-radius: 9px;
    font-size: 13.5px;
    font-weight: 500;
    color: #B7C0DE;
    text-decoration: none;
    transition: background 0.2s ease, color 0.2s ease;
  }

  .sidebar-link:hover {
    background: #1B2E5C;
  }

  .sidebar-link.active {
    background: #24396E;
    color: #fff;
  }

  .sidebar-link .icon {
    width: 17px;
    height: 17px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    opacity: 0.85;
  }

  .sidebar-link.active .icon {
    opacity: 1;
  }

  .sidebar-footer {
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid #26385E;
    display: flex;
    align-items: center;
    gap: 10px;
    padding-left: 8px;
  }

  .sidebar-avatar {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    background: #7C6CF0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 12px;
    flex-shrink: 0;
  }

  .sidebar-user-name {
    font-size: 12.5px;
    font-weight: 600;
    color: #fff;
  }

  .sidebar-user-role {
    font-size: 10.5px;
    color: #8792B0;
  }

  @media (max-width: 920px) {
    .sidebar-shell {
      width: 100%;
    }
  }
`;

export default function Sidebar() {
  return (
    <aside className="sidebar-shell">
      <style>{styles}</style>

      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">E</div>
        <div>
          <div className="sidebar-brand-name">EgoTECHWORLD</div>
          <div className="sidebar-brand-sub">Courier CMS</div>
        </div>
      </div>

      <div className="sidebar-group-label">Operations</div>
      {navigation.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <span className="icon"><Icon size={16} /></span>
          <span>{label}</span>
        </NavLink>
      ))}

      <div className="sidebar-group-label">Admin</div>
      <div className="sidebar-link">
        <span className="icon"><BriefcaseBusiness size={16} /></span>
        <span>Branches</span>
      </div>
      <div className="sidebar-link">
        <span className="icon"><FileText size={16} /></span>
        <span>Reports</span>
      </div>
      <div className="sidebar-link">
        <span className="icon"><ShieldCheck size={16} /></span>
        <span>Audit Logs</span>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-avatar">AK</div>
        <div>
          <div className="sidebar-user-name">Aisha Khan</div>
          <div className="sidebar-user-role">Operations Lead</div>
        </div>
      </div>
    </aside>
  );
}
