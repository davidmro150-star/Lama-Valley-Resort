
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  CLIENT: "client",
};

export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: "dashboard.view",

  // Bookings
  BOOKINGS_VIEW: "bookings.view",
  BOOKINGS_CREATE: "bookings.create",
  BOOKINGS_UPDATE: "bookings.update",
  BOOKINGS_CANCEL: "bookings.cancel",
  BOOKINGS_DELETE: "bookings.delete",
  BOOKINGS_HISTORY_VIEW: "bookings.history.view",

  // Payments
  PAYMENTS_VIEW: "payments.view",
  PAYMENTS_VERIFY: "payments.verify",
  PAYMENTS_RECORD: "payments.record",
  PAYMENTS_HISTORY_VIEW: "payments.history.view",
  RESTAURANT_PAYMENTS_SYNC: "restaurant-payments.sync",

  // Admin-only financial access
  FINANCIAL_REPORTS_VIEW: "financial-reports.view",

  // Resort management
  GUESTS_VIEW: "guests.view",
  COTTAGES_VIEW: "cottages.view",
  COTTAGES_MANAGE: "cottages.manage",

  RESTAURANT_VIEW: "restaurant.view",
  RESTAURANT_MANAGE: "restaurant.manage",
  RESTAURANT_ORDERS_VIEW: "restaurant-orders.view",

  PACKAGES_VIEW: "packages.view",
  PACKAGES_MANAGE: "packages.manage",

  GALLERY_VIEW: "gallery.view",
  GALLERY_MANAGE: "gallery.manage",

  // Website content
  WEBSITE_CONTENT_MANAGE: "website-content.manage",
  MESSAGES_VIEW: "messages.view",

  // System administration
  SETTINGS_MANAGE: "settings.manage",
  USERS_MANAGE: "users.manage",
};

// Admin receives every defined permission.
const adminPermissions = Object.values(PERMISSIONS);

// Manager receives operational permissions only.
const managerPermissions = [
  // Dashboard
  PERMISSIONS.DASHBOARD_VIEW,

  // Bookings
  PERMISSIONS.BOOKINGS_VIEW,
  PERMISSIONS.BOOKINGS_CREATE,
  PERMISSIONS.BOOKINGS_UPDATE,
  PERMISSIONS.BOOKINGS_CANCEL,
  PERMISSIONS.BOOKINGS_HISTORY_VIEW,

  // Individual guest payments
  PERMISSIONS.PAYMENTS_VIEW,
  PERMISSIONS.PAYMENTS_VERIFY,
  PERMISSIONS.PAYMENTS_RECORD,
  PERMISSIONS.PAYMENTS_HISTORY_VIEW,

  // Restaurant payment synchronization
  PERMISSIONS.RESTAURANT_PAYMENTS_SYNC,

  // Guest management
  PERMISSIONS.GUESTS_VIEW,

  // Cottage management
  PERMISSIONS.COTTAGES_VIEW,
  PERMISSIONS.COTTAGES_MANAGE,

  // Restaurant management
  PERMISSIONS.RESTAURANT_VIEW,
  PERMISSIONS.RESTAURANT_MANAGE,
  PERMISSIONS.RESTAURANT_ORDERS_VIEW,

  // Packages
  PERMISSIONS.PACKAGES_VIEW,
  PERMISSIONS.PACKAGES_MANAGE,

  // Gallery
  PERMISSIONS.GALLERY_VIEW,
  PERMISSIONS.GALLERY_MANAGE,

  // Guest communication
  PERMISSIONS.MESSAGES_VIEW,
];

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: adminPermissions,

  [ROLES.MANAGER]: managerPermissions,

  [ROLES.CLIENT]: [],
};

export function hasPermission(role, permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role, permissions = []) {
  return permissions.some((permission) =>
    hasPermission(role, permission)
  );
}

export function hasAllPermissions(role, permissions = []) {
  return permissions.every((permission) =>
    hasPermission(role, permission)
  );
}
