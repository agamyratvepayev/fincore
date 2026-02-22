export type ReportPeriod = {
  from: string;
  to: string;
};

export type ReportLine = {
  code: string;
  label: string;
  amount: number;
  lineNet?: number;
  reportNet?: number;
  group?: string;
};

export type ReportResponse = {
  tenantId: string;
  report: "income-statement" | "balance-sheet";
  period: ReportPeriod;
  currency: "USD";
  generatedAt: string;
  lines: ReportLine[];
};

export type ReportQuery = {
  client?: string;
  from?: string;
  to?: string;
  year?: number | string;
  month?: number | string;
  startDate?: string;
  endDate?: string;
  startdate?: string;
  enddate?: string;
  kind?: "revenue" | "expense" | "balance" | "cash" | "material";
  category?: string;
  offset?: number;
  limit?: number;
};
