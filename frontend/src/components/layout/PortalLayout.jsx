import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  BriefcaseBusiness,
  CreditCard,
  FileText,
  History,
  TrendingUp,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MapPinned,
  MessageCircle,
  PackageOpen,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Tags,
  TriangleAlert,
  Truck,
  Users,
  Upload,
  WalletCards,
  ClipboardList,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useStore from '../../hooks/useStore';

// Only three roles ship in this build: admin, finance, dispatcher. Every
// section links only to routes actually registered in AppRoutes.jsx.
// IMPORTANT: which section shows is driven by the signed-in user's role,
// not the current URL - otherwise a user browsing a shared page (like
// /shipments) can end up looking at a menu for a role they don't have,
// click into a page they're not allowed on, and hit "Access restricted".
const SECTIONS = [
  {
    key: 'admin',
    label: 'Admin',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/shipments', label: 'Shipments', icon: PackageOpen },
      { to: '/admin/exceptions', label: 'Exceptions', icon: TriangleAlert },
      { to: '/admin/manifests', label: 'Manifests', icon: FileText },
      { to: '/admin/vehicles', label: 'Vehicles', icon: Truck },
      { to: '/admin/pricing-zones', label: 'Pricing & Zones', icon: Tags },
      { to: '/admin/notifications', label: 'Notification Templates', icon: Bell },
      { to: '/admin/support', label: 'Support & Complaints', icon: LifeBuoy },
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/admin/drivers', label: 'Drivers', icon: Truck },
      { to: '/admin/branches', label: 'Branches', icon: BriefcaseBusiness },
      { to: '/admin/audit-logs', label: 'Audit Logs', icon: ShieldCheck },
      { to: '/admin/api-keys', label: 'API Keys', icon: KeyRound },
      { to: '/admin/webhooks', label: 'Webhooks', icon: Send },
      { to: '/admin/settings', label: 'System Configuration', icon: ClipboardList },
      { to: '/profile', label: 'Settings', icon: Settings },
    ],
  },
  {
    key: 'finance',
    label: 'Finance',
    items: [
      { to: '/finance', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/shipments', label: 'Shipments', icon: PackageOpen },
      { to: '/finance/cod', label: 'COD Management', icon: WalletCards },
      { to: '/finance/reconciliation', label: 'Driver Reconciliation', icon: ClipboardList },
      { to: '/finance/settlements', label: 'Merchant Settlements', icon: WalletCards },
      { to: '/finance/invoices', label: 'Invoices', icon: FileText },
      { to: '/finance/payments', label: 'Payments', icon: WalletCards },
      { to: '/finance/refunds', label: 'Refunds', icon: WalletCards },
      { to: '/finance/reports', label: 'Financial Reports', icon: FileText },
    ],
  },
  {
    key: 'dispatcher',
    label: 'Dispatcher',
    items: [
      { to: '/dispatcher', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/shipments', label: 'Shipments', icon: PackageOpen },
      { to: '/dispatcher/pending', label: 'Pending Deliveries', icon: PackageOpen },
      { to: '/dispatcher/drivers', label: 'Active Drivers', icon: Truck },
      { to: '/dispatcher/assign', label: 'Assign Driver', icon: Truck },
      { to: '/dispatcher/routes', label: 'Route Optimizer', icon: MapPinned },
      { to: '/dispatcher/tracking', label: 'Live Tracking', icon: MapPinned },
    ],
  },
  {
    key: 'driver',
    label: 'Driver',
    items: [
      { to: '/driver', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/driver/deliveries', label: 'My Deliveries', icon: PackageOpen },
      { to: '/driver/pod', label: 'Capture POD', icon: ShieldCheck },
      { to: '/driver/failed', label: 'Report Failed Delivery', icon: TriangleAlert },
      { to: '/driver/cod', label: 'COD Collection', icon: WalletCards },
      { to: '/driver/route', label: 'My Route', icon: MapPinned },
    ],
  },
  {
    key: 'merchant',
    label: 'Merchant',
    items: [
      { to: '/merchant', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/shipments/new', label: 'Create Shipment', icon: PackageOpen },
      { to: '/merchant/bulk-upload', label: 'Bulk Upload', icon: Upload },
      { to: '/merchant/shipments', label: 'Track Shipments', icon: Search },
      { to: '/merchant/settlements', label: 'Settlements', icon: WalletCards },
      { to: '/merchant/invoices', label: 'Invoices', icon: FileText },
      { to: '/merchant/addresses', label: 'Addresses', icon: MapPinned },
      { to: '/merchant/api', label: 'API Credentials', icon: KeyRound },
      { to: '/merchant/reports', label: 'Reports', icon: TrendingUp },
    ],
  },
  {
    key: 'customer',
    label: 'Customer',
    items: [
      { to: '/customer', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/customer/history', label: 'Shipment history', icon: History },
      { to: '/customer/payments', label: 'Payments', icon: CreditCard },
      { to: '/customer/complaints', label: 'Complaints', icon: MessageCircle },
      { to: '/customer/support', label: 'Support', icon: LifeBuoy },
    ],
  },
  {
    key: 'branch',
    label: 'Branch',
    items: [
      { to: '/branch', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/branch/shipments', label: 'Shipments', icon: PackageOpen },
    ],
  },
  // Counter Staff is no longer an active role - its section here was
  // removed along with the /counter route in routes/AppRoutes.jsx. Section
  // lookup below falls back to SECTIONS[0] (admin) for an unrecognized
  // role/key, same safe fallback pattern as RoleHome.jsx.
];

const layoutStyles = `
  .portal-shell { display: flex; min-height: 100vh; background: #F3F5F9; color: #151A2E; font-family: 'Inter', sans-serif; }
  .portal-sidebar { width: 236px; background: #12213F; color: #C7D0EA; padding: 22px 16px 24px; display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
  .portal-brand { display: flex; align-items: center; gap: 10px; padding: 4px 8px 22px; }
  .portal-brand-mark { width: 32px; height: 32px; border-radius: 9px; background: linear-gradient(135deg, #F5A524, #D9860F); display: flex; align-items: center; justify-content: center; color: #211200; font-family: 'Sora', sans-serif; font-weight: 800; font-size: 14px; }
  .portal-brand-name { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 14.5px; color: #fff; line-height: 1.15; }
  .portal-brand-sub { font-size: 10.5px; color: #8792B0; font-weight: 500; }
  .portal-nav-label { font-size: 10.5px; font-weight: 700; letter-spacing: .06em; color: #5F6A8C; margin: 16px 10px 6px; text-transform: uppercase; }
  .portal-nav-item { display: flex; align-items: center; gap: 11px; padding: 9px 11px; border-radius: 9px; font-size: 13.5px; font-weight: 500; color: #B7C0DE; transition: all 0.2s ease; text-decoration: none; }
  .portal-nav-item .icon { width: 17px; height: 17px; display: inline-flex; align-items: center; justify-content: center; opacity: 0.85; }
  .portal-nav-item.active { background: #24396E; color: #fff; }
  .portal-nav-item.active .icon { opacity: 1; }
  .portal-nav-item:hover { background: #1B2E5C; }
  .portal-sidebar-foot { margin-top: auto; padding-top: 16px; border-top: 1px solid #26385E; display: flex; align-items: center; gap: 10px; padding-left: 8px; }
  .portal-avatar { width: 32px; height: 32px; border-radius: 9px; background: #7C6CF0; display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'Sora', sans-serif; font-weight: 700; font-size: 12px; flex-shrink: 0; }
  .portal-user-name { font-size: 12.5px; font-weight: 600; color: #fff; }
  .portal-user-role { font-size: 10.5px; color: #8792B0; }
  .portal-logout { margin-left: auto; width: 30px; height: 30px; border-radius: 8px; border: 1px solid #26385E; background: transparent; color: #B7C0DE; display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .portal-logout:hover { background: #1B2E5C; color: #fff; }
  .portal-main { flex: 1; min-width: 0; background: #F3F5F9; }
  .portal-topbar { height: 66px; border-bottom: 1px solid #E3E7EF; display: flex; align-items: center; justify-content: space-between; padding: 0 28px; background: #fff; gap: 16px; }
  .portal-search-form { display: flex; align-items: center; gap: 9px; background: #F3F5F9; border: 1px solid #E3E7EF; border-radius: 10px; padding: 9px 14px; width: 340px; color: #9AA1B4; font-size: 13px; }
  .portal-search-form input { border: none; outline: none; background: transparent; width: 100%; color: #151A2E; font-size: 13px; }
  .portal-topbar-right { display: flex; align-items: center; gap: 16px; position: relative; }
  .portal-icon-btn { width: 36px; height: 36px; border-radius: 10px; background: #F3F5F9; border: 1px solid #E3E7EF; display: flex; align-items: center; justify-content: center; position: relative; color: #12213F; cursor: pointer; transition: background .15s, border-color .15s; }
  .portal-icon-btn:hover { background: #E8EFFE; border-color: #C7D3F5; }
  .portal-icon-btn:focus-visible { outline: 2px solid #F5A524; outline-offset: 2px; }
  .portal-badge-dot { position: absolute; top: 7px; right: 7px; width: 7px; height: 7px; border-radius: 50%; background: #EF5B4E; border: 1.5px solid #fff; }
  .portal-content { padding: 26px 28px 40px; }
  .notif-dropdown { position: absolute; top: 46px; right: 60px; width: 300px; background: #fff; border: 1px solid #E3E7EF; border-radius: 12px; box-shadow: 0 14px 30px rgba(18,33,63,.16); padding: 8px; z-index: 40; }
  .notif-item { padding: 9px 10px; border-radius: 8px; font-size: 12px; color: #12213F; }
  .notif-item:hover { background: #F3F5F9; }
  .notif-item .n-detail { color: #697086; font-size: 11px; margin-top: 2px; }
  @media (max-width: 920px) { .portal-shell { flex-direction: column; } .portal-sidebar { width: 100%; } .portal-search-form { width: 200px; } }
  @media (max-width: 640px) { .portal-topbar { padding: 0 18px; } .portal-search-form { display: none; } .portal-content { padding: 18px; } }

  /* Dark mode (Settings > Appearance, see ThemeContext.js/ProfilePage.jsx).
     The sidebar is already dark-navy in light mode, so it needs no change -
     this only re-tones the large neutral canvas (shell background, main
     content background, top bar) behind it. Individual page content cards
     across the app use hardcoded inline light styling (a much larger,
     pre-existing pattern outside this task's scope to retrofit) and
     intentionally keep their current light-card appearance here - a
     light-card-on-dark-canvas layout that stays fully readable rather than
     a partial, inconsistent retheme of unrelated pages. */
  [data-theme="dark"] .portal-shell { background: #0B1220; color: #E7ECFB; }
  [data-theme="dark"] .portal-main { background: #0B1220; }
  [data-theme="dark"] .portal-topbar { background: #101A2E; border-color: #223052; }
  [data-theme="dark"] .portal-content { color: #E7ECFB; }
  [data-theme="dark"] .portal-icon-btn { background: #1B2740; border-color: #2C3B5E; color: #E7ECFB; }
  [data-theme="dark"] .portal-icon-btn:hover { background: #24304E; border-color: #3A4B76; }
`;

function initials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'U';
}

const ROLE_LABELS = {
  admin: 'Administrator',
  finance: 'Finance Officer',
  dispatcher: 'Dispatcher',
  driver: 'Driver',
  merchant: 'Merchant',
  customer: 'Customer',
  branch: 'Branch Manager',
  counter: 'Counter Staff',
};

export default function PortalLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { shipments, auditLogs } = useStore();
  const [search, setSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const section = SECTIONS.find((candidate) => candidate.key === user?.role) || SECTIONS[0];
  const displayName = user?.name || 'Guest User';
  const displayRole = ROLE_LABELS[user?.role] || 'Team member';

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const term = search.trim().toLowerCase();
    if (!term) return;
    const match = shipments.find((s) => s.trackingNumber.toLowerCase().includes(term) || s.recipientName.toLowerCase().includes(term));
    if (match) {
      navigate(`/shipments/${match.id}`);
      setSearch('');
    } else {
      navigate('/shipments');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="portal-shell">
      <style>{layoutStyles}</style>

      <aside className="portal-sidebar">
        <div className="portal-brand">
          <div className="portal-brand-mark">E</div>
          <div>
            <div className="portal-brand-name">EgoTECHWORLD</div>
            <div className="portal-brand-sub">Courier CMS</div>
          </div>
        </div>

        <div className="portal-nav-label">{section.label}</div>
        {section.items.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `portal-nav-item ${isActive ? 'active' : ''}`} end={end ?? to === '/'}>
            <span className="icon"><Icon size={16} /></span>
            <span>{label}</span>
          </NavLink>
        ))}

        <div className="portal-sidebar-foot">
          <div className="portal-avatar">{initials(displayName)}</div>
          <div>
            <div className="portal-user-name">{displayName}</div>
            <div className="portal-user-role">{displayRole}</div>
          </div>
          <button type="button" className="portal-logout" onClick={handleLogout} title="Sign out" aria-label="Sign out">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      <main className="portal-main">
        <header className="portal-topbar">
          <form className="portal-search-form" onSubmit={handleSearchSubmit}>
            <Search size={15} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tracking number or recipient…" />
          </form>

          <div className="portal-topbar-right">
            <button type="button" className="portal-icon-btn" onClick={() => setShowNotifications((v) => !v)} aria-label="Notifications">
              <Bell size={16} />
              {auditLogs.length > 0 && <span className="portal-badge-dot" />}
            </button>
            {showNotifications && (
              <div className="notif-dropdown">
                {auditLogs.slice(0, 6).map((log) => (
                  <div key={log.id} className="notif-item">
                    <div>{log.action}</div>
                    <div className="n-detail">{log.detail} · {log.timestamp}</div>
                  </div>
                ))}
                {auditLogs.length === 0 && <div className="notif-item">No recent activity.</div>}
              </div>
            )}
            <Link to="/profile" className="portal-icon-btn" title="Settings" aria-label="Settings"><Settings size={16} /></Link>
          </div>
        </header>

        <div className="portal-content">{children}</div>
      </main>
    </div>
  );
}
