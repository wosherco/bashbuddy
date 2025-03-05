export const isDev =
  process.env.NODE_ENV === "development" ||
  process.env.PUBLIC_ENVIRONMENT === "development";

const DEV_SITE_URLS = {
  ACCOUNT_URL: "http://localhost:5174",
  API_URL: "http://localhost:3000",
  AUTHENTICATOR_URL: "http://localhost:5173",
  LANDING_URL: "http://localhost:5175",
  DOCS_URL: "http://localhost:3001",
};

const PROD_SITE_URLS = {
  ACCOUNT_URL: "https://account.bashbuddy.run",
  API_URL: "https://api.bashbuddy.run",
  AUTHENTICATOR_URL: "https://auth.bashbuddy.run",
  LANDING_URL: "https://bashbuddy.run",
  DOCS_URL: "https://docs.bashbuddy.run",
};

export const SITE_URLS = isDev ? DEV_SITE_URLS : PROD_SITE_URLS;

const DEV_STRIPE_PRICE_ID = "price_1QxbUQRJ9x8LyhxTPSntQtcy";
const PROD_STRIPE_PRICE_ID = "price_1QzPoVRJ9x8LyhxTHdzGpkTz";

export const STRIPE_PRICE_ID = isDev
  ? DEV_STRIPE_PRICE_ID
  : PROD_STRIPE_PRICE_ID;
