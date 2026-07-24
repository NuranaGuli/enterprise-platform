export const craftErrorResponse = (detail: string, statusCode?: number) => ({
  ok: false,
  errorDetail: detail,
  statusCode: statusCode ?? 500,
});

export const deriveNextId = (prefix: string, collectionSize: number): string =>
  `${prefix}${String(collectionSize + 1).padStart(3, "0")}`;

export const formatCurrency = (amount: number): string =>
  `$${amount.toFixed(2)}`;
