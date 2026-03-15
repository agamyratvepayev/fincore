type DateParams = {
  code?: string;
  clcode?: string;
  id?: number;
  offset?: number;
  limit?: number;
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
};

export function queryDateFilters() {
  return "EXEC ALBINCFILDAT";
}

export function queryRevenueTotals(params: DateParams = {}) {
  void params;
  return "EXEC ALBINCREVTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryRevenueDetails(params: DateParams = {}) {
  void params;
  return "EXEC ALBINCREVDET @CODE = :code, @CLCODE = :clcode, @OFFSET = :offset, @LIMIT = :limit, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryExpenseTotals(params: DateParams = {}) {
  void params;
  return "EXEC ALBINCEXPTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryExpenseDetails(params: DateParams = {}) {
  void params;
  return "EXEC ALBINCEXPDET @CODE = :code, @CLCODE = :clcode, @OFFSET = :offset, @LIMIT = :limit, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}
