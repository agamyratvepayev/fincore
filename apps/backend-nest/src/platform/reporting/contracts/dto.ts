export type DateRangeFilters = {
  from?: string;
  to?: string;
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
  client?: string;
};

export type IncomeDetailsFilters = DateRangeFilters & {
  category?: string;
  offset?: number;
  limit?: number;
};

export type BalanceDetailsFilters = DateRangeFilters & {
  kind?: "cash" | "material" | "credit" | "bio" | "loan" | "advance";
  category?: string;
  offset?: number;
  limit?: number;
};
