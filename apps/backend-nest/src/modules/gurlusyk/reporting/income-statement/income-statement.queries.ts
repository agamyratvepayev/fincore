type RevenueFilterParams = {
  code?: string;
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
};

type DetailParams = RevenueFilterParams & {
  category?: string | number;
  offset?: number;
  limit?: number;
};

export function queryDateFilters() {
  return "EXEC GURINCDATVAL";
}

export function queryClientNames() {
  return "EXEC GURINCCLIVAL";
}

export function queryRevenueTotals(filters: RevenueFilterParams = {}) {
  void filters;
  return "EXEC GURINCREVTOT @CODE = :code, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryExpenseTotals(filters: RevenueFilterParams = {}) {
  void filters;
  return "EXEC GURINCEXPTOT @CODE = :code, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryBalanceTotals(filters: RevenueFilterParams = {}) {
  void filters;
  return "EXEC GURINVBALTOT @CODE = :code, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryRevenueDetails(filters: DetailParams = {}) {
  void filters;
  return "EXEC GURINCREVDET @CODE = :code, @CATEGORY = :category, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}

export function queryExpenseDetails(filters: DetailParams = {}) {
  void filters;
  return "EXEC GURINCEXPDET @CODE = :code, @CATEGORY = :category, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}

export function queryBalanceDetails(filters: DetailParams = {}) {
  void filters;
  return "EXEC GURINVBALDET @CODE = :code, @CATEGORY = :category, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}
