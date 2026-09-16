import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { BranchProvider } from './context/BranchContext';
import { NotificationProvider } from './context/NotificationContext';
import { OrganizationProvider } from './context/OrganizationContext';
import { PermissionProvider } from './context/PermissionContext';
import { ThemeProvider } from './context/ThemeContext';
import useAuth from './hooks/useAuth';
import { permissionsForRole } from './utils/permissions';
import { PORTAL_LABEL, PORTAL_ROLE } from './config/portal';

const appStyles = `
  :root {
    --ink: #12213F;
    --ink-2: #1B2E5C;
    --ink-3: #24396E;
    --amber: #F5A524;
    --amber-dark: #D9860F;
    --teal: #0EA394;
    --teal-bg: #E4F7F4;
    --coral: #EF5B4E;
    --coral-bg: #FDE9E7;
    --sky: #3E7BFA;
    --sky-bg: #E8EFFE;
    --violet: #7C6CF0;
    --violet-bg: #EFEBFD;
    --paper: #F3F5F9;
    --surface: #FFFFFF;
    --line: #E3E7EF;
    --text: #151A2E;
    --text-mute: #697086;
    --text-faint: #9AA1B4;
  }

  * { box-sizing: border-box; }
  html, body, #root { margin: 0; min-height: 100%; min-width: 0; }
  body {
    font-family: 'Inter', sans-serif;
    background: #DCE1EA;
    color: var(--text);
  }
  a { text-decoration: none; color: inherit; }
  button, input, select, textarea { font: inherit; }

  .cms-app {
    min-height: 100vh;
    background: #dfe6f4;
    font-family: 'Inter', sans-serif;
  }
`;

// Bridges the signed-in user's role into the granular permission matrix
// (src/utils/permissions.js) so usePermissions().can('x.y') reflects who
// is actually logged in, instead of a hardcoded '*' for everyone.
function PermissionsBridge({ children }) {
  const { user } = useAuth();
  return <PermissionProvider permissions={permissionsForRole(user?.role)}>{children}</PermissionProvider>;
}

function PortalModeGuard({ children }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (PORTAL_ROLE && user && user.role !== PORTAL_ROLE) logout('portal-mismatch');
  }, [user, logout]);

  if (PORTAL_ROLE && user && user.role !== PORTAL_ROLE) {
    return <Navigate to="/login" replace state={{ from: location, portal: PORTAL_LABEL }} />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <StoreProvider>
            <OrganizationProvider>
              <BranchProvider>
                <PermissionsBridge>
                  <NotificationProvider>
                    <div className="cms-app">
                      <style>{appStyles}</style>
                      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Inter, sans-serif', fontSize: '13px' } }} />
                      <PortalModeGuard><AppRoutes /></PortalModeGuard>
                    </div>
                  </NotificationProvider>
                </PermissionsBridge>
              </BranchProvider>
            </OrganizationProvider>
          </StoreProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
