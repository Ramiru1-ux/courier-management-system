import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import PublicTrackingPage from '../pages/public/PublicTrackingPage';
import HomePage from '../pages/public/HomePage';
import ContactSupportPage from '../pages/public/ContactSupportPage';
import NotFoundPage from '../pages/NotFoundPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import PrivateRoute from './PrivateRoute';
import RoleBasedRoute from './RoleBasedRoute';
import RoleHome from '../pages/RoleHome';
import ProfilePage from '../pages/ProfilePage';
import { PORTAL_ROLE } from '../config/portal';

import ShipmentsListPage from '../pages/shipments/ShipmentsListPage';
import ShipmentDetailsPage from '../pages/shipments/ShipmentDetailsPage';
import CreateShipmentPage from '../pages/shipments/CreateShipmentPage';

import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import UsersPage from '../pages/admin/UsersPage';
import DriversPage from '../pages/admin/DriversPage';
import BranchesPage from '../pages/admin/BranchesPage';
import AuditLogsPage from '../pages/admin/AuditLogsPage';
import SystemSettingsPage from '../pages/admin/SystemSettingsPage';
import VehiclesPage from '../pages/admin/VehiclesPage';
import ManifestsPage from '../pages/admin/ManifestsPage';
import PricingZonesPage from '../pages/admin/PricingZonesPage';
import NotificationTemplatesPage from '../pages/admin/NotificationTemplatesPage';
import SupportPage from '../pages/admin/SupportPage';
import ExceptionsPage from '../pages/admin/ExceptionsPage';
import ApiKeysPage from '../pages/admin/ApiKeysPage';
import WebhooksPage from '../pages/admin/WebhooksPage';
import OrganizationsPage from '../pages/admin/OrganizationsPage';
import SubscriptionsPage from '../pages/admin/SubscriptionsPage';

import FinanceDashboardPage from '../pages/finance/FinanceDashboardPage';
import CodManagementPage from '../pages/finance/CodManagementPage';
import DriverReconciliationPage from '../pages/finance/DriverReconciliationPage';
import MerchantSettlementsPage from '../pages/finance/MerchantSettlementsPage';
import InvoicesPage from '../pages/finance/InvoicesPage';
import PaymentsPage from '../pages/finance/PaymentsPage';
import RefundsPage from '../pages/finance/RefundsPage';
import FinancialReportsPage from '../pages/finance/FinancialReportsPage';

import DispatcherDashboardPage from '../pages/dispatcher/DispatcherDashboardPage';
import PendingDeliveriesPage from '../pages/dispatcher/PendingDeliveriesPage';
import ActiveDriversPage from '../pages/dispatcher/ActiveDriversPage';
import AssignDriverPage from '../pages/dispatcher/AssignDriverPage';
import RouteOptimizerPage from '../pages/dispatcher/RouteOptimizerPage';
import LiveTrackingPage from '../pages/dispatcher/LiveTrackingPage';

import DriverDashboardPage from '../pages/driver/DriverDashboardPage';
import MyDeliveriesPage from '../pages/driver/MyDeliveriesPage';
import PodCapturePage from '../pages/driver/PodCapturePage';
import FailedDeliveryPage from '../pages/driver/FailedDeliveryPage';
import CodCollectionPage from '../pages/driver/CodCollectionPage';
import RouteViewPage from '../pages/driver/RouteViewPage';

import MerchantDashboardPage from '../pages/merchant/MerchantDashboardPage';
import MerchantShipmentsPage from '../pages/merchant/MerchantShipmentsPage';
import MerchantBulkUploadPage from '../pages/merchant/BulkUploadPage';
import MerchantOwnSettlementsPage from '../pages/merchant/SettlementsPage';
import MerchantInvoicesPage from '../pages/merchant/InvoicesPage';
import MerchantAddressesPage from '../pages/merchant/AddressesPage';
import MerchantApiCredentialsPage from '../pages/merchant/ApiCredentialsPage';
import MerchantReportsPage from '../pages/merchant/ReportsPage';

import CustomerDashboardPage from '../pages/customer/CustomerDashboardPage';
import CustomerComplaintsPage from '../pages/customer/ComplaintsPage';
import CustomerSupportPage from '../pages/customer/SupportPage';
import CustomerTrackShipmentPage from '../pages/customer/TrackShipmentPage';
import CustomerShipmentHistoryPage from '../pages/customer/ShipmentHistoryPage';
import CustomerPaymentsPage from '../pages/customer/PaymentsPage';

import BranchDashboardPage from '../pages/branch/BranchDashboardPage';
import BranchShipmentsPage from '../pages/branch/BranchShipmentsPage';
import PublicLayout from '../components/layout/PublicLayout';

// Counter Staff is no longer an active role in this system (see
// controllers/authController.js CREATABLE_ROLES) - the route below and its
// nav entry (components/layout/PortalLayout.jsx) were removed so no path
// in the app leads to it anymore. counter/CounterDashboardPage.jsx itself
// is left in place, unimported and unreachable, exactly like the other
// dead pages already documented elsewhere in this codebase - not deleted,
// in case any historical counter-role account (see MongoDB) is ever
// reassigned to a role that needs equivalent functionality restored later.
const ALL_ROLES = ['admin', 'finance', 'dispatcher', 'driver', 'merchant', 'customer', 'branch'];

export default function AppRoutes() {
  // The customer build (vite --mode customer, port 5175) is a fully public
  // shipment-tracking experience - recipients never create an account,
  // never sign in, and never see a dashboard/sidebar/profile. Every path in
  // this build renders the same public tracking page (search, status,
  // limited driver info, complaint form, and - once DELIVERED - a review
  // form, all backed by real unauthenticated endpoints in
  // backend/controllers/trackingController.js). This must be checked
  // BEFORE the authenticated routes below, since without it "/" falls
  // through to <PrivateRoute> and bounces an anonymous visitor to /login -
  // exactly the behaviour this portal must never have.
    if (PORTAL_ROLE === 'customer') {
    return (
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="*" element={<PublicTrackingPage />} />
        </Route>
      </Routes>
    );
  }

  return (
    <Routes>
        <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/track" element={<PublicTrackingPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        {/* Anonymous-accessible marketing pages - deliberately at their own
            paths, never at "/", so the existing authenticated "/" -> RoleHome
            redirect chain below is completely untouched. */}
        <Route path="/welcome" element={<HomePage />} />
        <Route path="/contact-support" element={<ContactSupportPage />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route element={<RoleBasedRoute allowedRoles={ALL_ROLES} />}>
          <Route path="/" element={<RoleHome />} />
          <Route path="/shipments" element={<ShipmentsListPage />} />
          <Route path="/shipments/:id" element={<ShipmentDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Finance is a financial-operations-only role - it has never had a
            "Create Shipment" nav link (see PortalLayout.jsx's finance
            section, which only links to the read-only /shipments list), and
            the backend now rejects a finance account's shipment writes
            server-side regardless (FINANCE_EXCLUDED_WRITE_KEYS in
            appDataController.js) - this route guard is defense-in-depth so
            a finance user typing the URL directly is bounced immediately
            instead of reaching a form whose submit would just fail. */}
        <Route element={<RoleBasedRoute allowedRoles={['admin', 'dispatcher', 'merchant']} />}>
          <Route path="/shipments/new" element={<CreateShipmentPage />} />
        </Route>

        <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/drivers" element={<DriversPage />} />
          <Route path="/admin/branches" element={<BranchesPage />} />
          <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
          <Route path="/admin/settings" element={<SystemSettingsPage />} />
          <Route path="/admin/vehicles" element={<VehiclesPage />} />
          <Route path="/admin/manifests" element={<ManifestsPage />} />
          <Route path="/admin/pricing-zones" element={<PricingZonesPage />} />
          <Route path="/admin/notifications" element={<NotificationTemplatesPage />} />
          <Route path="/admin/support" element={<SupportPage />} />
          <Route path="/admin/exceptions" element={<ExceptionsPage />} />
          <Route path="/admin/api-keys" element={<ApiKeysPage />} />
          <Route path="/admin/webhooks" element={<WebhooksPage />} />
          <Route path="/admin/organizations" element={<OrganizationsPage />} />
          <Route path="/admin/subscriptions" element={<SubscriptionsPage />} />
        </Route>

        <Route element={<RoleBasedRoute allowedRoles={['finance']} />}>
          <Route path="/finance" element={<FinanceDashboardPage />} />
          <Route path="/finance/cod" element={<CodManagementPage />} />
          <Route path="/finance/reconciliation" element={<DriverReconciliationPage />} />
          <Route path="/finance/settlements" element={<MerchantSettlementsPage />} />
          <Route path="/finance/invoices" element={<InvoicesPage />} />
          <Route path="/finance/payments" element={<PaymentsPage />} />
          <Route path="/finance/refunds" element={<RefundsPage />} />
          <Route path="/finance/reports" element={<FinancialReportsPage />} />
        </Route>

        <Route element={<RoleBasedRoute allowedRoles={['dispatcher']} />}>
          <Route path="/dispatcher" element={<DispatcherDashboardPage />} />
          <Route path="/dispatcher/pending" element={<PendingDeliveriesPage />} />
          <Route path="/dispatcher/drivers" element={<ActiveDriversPage />} />
          <Route path="/dispatcher/assign" element={<AssignDriverPage />} />
          <Route path="/dispatcher/routes" element={<RouteOptimizerPage />} />
          <Route path="/dispatcher/tracking" element={<LiveTrackingPage />} />
        </Route>

        <Route element={<RoleBasedRoute allowedRoles={['driver']} />}>
          <Route path="/driver" element={<DriverDashboardPage />} />
          <Route path="/driver/deliveries" element={<MyDeliveriesPage />} />
          <Route path="/driver/pod" element={<PodCapturePage />} />
          <Route path="/driver/failed" element={<FailedDeliveryPage />} />
          <Route path="/driver/cod" element={<CodCollectionPage />} />
          <Route path="/driver/route" element={<RouteViewPage />} />
        </Route>

        <Route element={<RoleBasedRoute allowedRoles={['merchant']} />}>
          <Route path="/merchant" element={<MerchantDashboardPage />} />
          <Route path="/merchant/shipments" element={<MerchantShipmentsPage />} />
          <Route path="/merchant/shipments/new" element={<CreateShipmentPage />} />
          <Route path="/merchant/shipments/bulk" element={<MerchantBulkUploadPage />} />
          <Route path="/merchant/bulk-upload" element={<MerchantBulkUploadPage />} />
          <Route path="/merchant/settlements" element={<MerchantOwnSettlementsPage />} />
          <Route path="/merchant/invoices" element={<MerchantInvoicesPage />} />
          <Route path="/merchant/addresses" element={<MerchantAddressesPage />} />
          <Route path="/merchant/api" element={<MerchantApiCredentialsPage />} />
          <Route path="/merchant/reports" element={<MerchantReportsPage />} />
        </Route>

        <Route element={<RoleBasedRoute allowedRoles={['customer']} />}>
          <Route path="/customer" element={<CustomerDashboardPage />} />
          <Route path="/customer/tracking" element={<CustomerTrackShipmentPage />} />
          <Route path="/customer/history" element={<CustomerShipmentHistoryPage />} />
          <Route path="/customer/payments" element={<CustomerPaymentsPage />} />
          <Route path="/customer/complaints" element={<CustomerComplaintsPage />} />
          <Route path="/customer/support" element={<CustomerSupportPage />} />
        </Route>

        <Route element={<RoleBasedRoute allowedRoles={['branch']} />}>
          <Route path="/branch" element={<BranchDashboardPage />} />
          <Route path="/branch/shipments" element={<BranchShipmentsPage />} />
        </Route>
      </Route>

      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
