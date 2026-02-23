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
  return "EXEC AGRINCDATVAL";
}

export function queryRevenueTotals(filters: RevenueFilterParams = {}) {
  void filters;
  return "EXEC AGRINCREVTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryRevenueDetails(filters: DetailParams = {}) {
  void filters;
  return "EXEC AGRINCREVDET @ID = :id, @OFFSET = :offset, @LIMIT = :limit, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}
