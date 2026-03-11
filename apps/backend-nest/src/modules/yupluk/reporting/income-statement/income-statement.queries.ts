type RevenueFilterParams = {
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
};

type DetailParams = RevenueFilterParams & {
  id?: number;
  offset?: number;
  limit?: number;
};

export function queryDateFilters() {
  return "EXEC YUPINCDATVAL";
}

export function queryRevenueTotals(filters: RevenueFilterParams = {}) {
  void filters;
  return "EXEC YUPINCREVTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryExpenseTotals(filters: RevenueFilterParams = {}) {
  void filters;
  return "EXEC YUPINCEXPTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryRevenueDetails(filters: DetailParams = {}) {
  void filters;
  return "EXEC YUPINCREVDET @ID = :id, @OFFSET = :offset, @LIMIT = :limit, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryExpenseDetails(filters: DetailParams = {}) {
  void filters;
  return "EXEC YUPINCEXPDET @ID = :id, @OFFSET = :offset, @LIMIT = :limit, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}
