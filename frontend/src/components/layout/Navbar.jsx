import React from 'react';
import { Bell, Search, Settings, UserCircle2 } from 'lucide-react';

const styles = `
  .navbar-shell {
    height: 66px;
    border-bottom: 1px solid #E3E7EF;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    background: #fff;
  }

  .navbar-search {
    display: flex;
    align-items: center;
    gap: 9px;
    background: #F3F5F9;
    border: 1px solid #E3E7EF;
    border-radius: 10px;
    padding: 9px 14px;
    width: 340px;
    color: #9AA1B4;
    font-size: 13px;
  }

  .navbar-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .navbar-icon-btn {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #F3F5F9;
    border: 1px solid #E3E7EF;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    color: #12213F;
  }

  .navbar-badge {
    position: absolute;
    top: 7px;
    right: 7px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #EF5B4E;
    border: 1.5px solid #fff;
  }

  @media (max-width: 640px) {
    .navbar-shell {
      padding: 0 18px;
    }

    .navbar-search {
      display: none;
    }
  }
`;

export default function Navbar() {
  return (
    <header className="navbar-shell">
      <style>{styles}</style>

      <div className="navbar-search">
        <Search size={15} />
        Search shipment, route, customer…
      </div>

      <div className="navbar-actions">
        <div className="navbar-icon-btn">
          <Bell size={16} />
          <span className="navbar-badge" />
        </div>

        <div className="navbar-icon-btn">
          <Settings size={16} />
        </div>

        <div className="navbar-icon-btn">
          <UserCircle2 size={16} />
        </div>
      </div>
    </header>
  );
}
