type DateParams = {
  client?: string;
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
};

type DetailParams = DateParams & {
  category?: string;
  offset?: number;
  limit?: number;
};

export function queryDateFilters() {
  return "EXEC CONINCDATFIL";
}

export function queryClientNames() {
  return "EXEC CONINCCLINAM";
}

export function queryRevenueTotals(dates: DateParams = {}) {
  void dates;
  return "EXEC CONINCREVTOT @CODE = :code, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryExpenseTotals(dates: DateParams = {}) {
  void dates;
  return "EXEC CONINCEXPTOT @CODE = :code, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryRevenueDetails(dates: DetailParams = {}) {
  void dates;
  return "EXEC CONINCREVDET @CODE = :code, @CATEGORY = :category, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}

export function queryExpenseDetails(dates: DetailParams = {}) {
  void dates;
  return "EXEC CONINCEXPDET @CODE = :code, @CATEGORY = :category, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}

export function queryBalanceTotals(dates: DateParams = {}) {
  void dates;
  return "EXEC CONINVBALTOT @CODE = :client, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryBalanceDetails(dates: DetailParams = {}) {
  void dates;
  return "EXEC CONINVBALDET @CODE = :client, @CATEGORY = :category, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}
