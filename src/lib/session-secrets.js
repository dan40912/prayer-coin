const secretCache = new Map();

function readSecret(name, developmentFallback) {
  const configured = process.env[name]?.trim();
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(`${name} is required in production.`);
  }

  return developmentFallback;
}

function getCachedSecret(name, developmentFallback) {
  if (secretCache.has(name)) {
    return secretCache.get(name);
  }

  const value = readSecret(name, developmentFallback);
  secretCache.set(name, value);
  return value;
}

export function getAdminSessionSecret() {
  return getCachedSecret(
    "ADMIN_SESSION_SECRET",
    "dev-admin-session-secret-change-me"
  );
}

export function getCustomerSessionSecret() {
  return getCachedSecret(
    "CUSTOMER_SESSION_SECRET",
    "dev-customer-session-secret-change-me"
  );
}
