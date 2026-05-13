// /client/src/utils/formatters.js

/**
 * Formats a number into USD currency string
 * Adds "+" sign for positive values
 */
export const formatCurrency = (value) => {
  if (value == null) return "Open";
  const sign = value > 0 ? "+" : "";
  return (
    sign +
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    })
  );
};

/**
 * Formats a numeric price to 2 decimal places
 * e.g. 19500.2500 → "19,500.25"
 */
export const formatPrice = (value) => {
  if (value == null) return "—";
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Formats quantity as a whole number integer
 * e.g. 1.0000 → "1"
 */
export const formatQuantity = (value) => {
  if (value == null) return "—";
  return parseInt(value, 10).toString();
};

/**
 * Formats an ISO datetime string into a readable short format
 * e.g. "Jan 5, 02:30 PM"
 */
export const formatDateTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
