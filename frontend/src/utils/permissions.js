// Granular, per-action permission matrix (FR-03: Role-Based Access
// Control). Roles map to a flat list of "resource.action" permission
// strings. UI elements check usePermissions().can('x.y') before rendering
// sensitive actions/buttons, and route guards use the same matrix to
// block navigation to pages outside a role's allowed area.
export const ROLE_PERMISSIONS = {
  admin: ['*'],
  finance: [
    'shipments.view',
    'finance.cod.view', 'finance.cod.manage',
    'finance.settlements.view', 'finance.settlements.manage',
    'finance.reconciliation.view', 'finance.reconciliation.manage',
    'finance.invoices.view', 'finance.invoices.manage',
    'finance.payments.view',
    'finance.refunds.view', 'finance.refunds.manage',
    'finance.reports.view',
  ],
  dispatcher: [
    'shipments.view', 'shipments.assign', 'shipments.update_status',
    'dispatch.view', 'dispatch.assign',
    'drivers.view', 'drivers.manage_availability',
    'routes.view', 'routes.optimize',
    'tracking.view',
  ],
  driver: [
    'driver.dashboard.view',
    'driver.deliveries.view.own',
    'driver.pod.capture',
    'driver.failed.report',
    'driver.cod.collect',
  ],
  merchant: [
    'merchant.dashboard.view',
    'merchant.shipments.create', 'merchant.shipments.view.own',
    'merchant.settlements.view.own',
    'merchant.invoices.view.own',
    'merchant.addresses.manage',
    'merchant.api.manage',
  ],
  customer: [
    'customer.dashboard.view',
    'customer.shipments.create', 'customer.shipments.view.own',
    'customer.payments.view.own',
    'customer.support.create',
    'customer.ratings.submit',
  ],
};

export function permissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || [];
}
