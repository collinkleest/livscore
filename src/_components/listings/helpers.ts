// Small helpers used by listings components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Listing = Record<string, any>;

export const sanitizeKey = (s: string) =>
  String(s).replace(/[^a-zA-Z0-9_]/g, "_");

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const detectColumnType = (
  header: string,
  sampleData: Listing[],
): "currency" | "number" | "date" | "url" | "string" => {
  let isCurrency = true;
  let isNumber = true;
  let isDate = true;
  let isUrl = true;

  let samplesChecked = 0;

  for (const row of sampleData) {
    const val = row[header];
    if (val === undefined || val === null || val === "") continue;
    samplesChecked++;

    const strVal = String(val).trim();

    // Check URL
    if (!/^https?:\/\/.+/.test(strVal)) {
      isUrl = false;
    }

    // Check currency
    if (!/^\$?\s?[\d,]+(\.\d+)?$/.test(strVal)) {
      isCurrency = false;
    }
    // check number (allow commas)
    if (isNaN(Number(strVal.replace(/[$,]/g, "")))) {
      isNumber = false;
      isCurrency = false; // if not number, not currency
    }

    // Check date (simple check)
    if (isNaN(Date.parse(strVal))) {
      isDate = false;
    }
  }

  if (samplesChecked === 0) return "string";

  if (isUrl) return "url";
  if (isCurrency && header.toLowerCase().includes("price")) return "currency";
  if (isNumber) return "number";
  if (isDate) return "date";

  return "string";
};
