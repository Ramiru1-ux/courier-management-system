import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';

// Pages outside PortalLayout (login, password reset, public tracking,
// contact support, 404...) each set `min-height: 100vh` on their own root.
// This wrapper lets that root fill only the space above the footer, so the
// footer sits at the bottom of the screen instead of below it.
const styles = `
  .public-layout { min-height: 100vh; display: flex; flex-direction: column; }
  .public-layout-body { flex: 1; display: flex; flex-direction: column; }
  .public-layout-body > * { flex: 1 0 auto; min-height: 0 !important; }
`;

export default function PublicLayout() {
  return (
    <div className="public-layout">
      <style>{styles}</style>
      <div className="public-layout-body">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}