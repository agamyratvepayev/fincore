type DateParams = {
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
};

type DetailParams = DateParams & {
  id?: number;
  offset?: number;
  limit?: number;
};

export function queryExpenseTotals(params: DateParams = {}) {
  void params;
  return "EXEC MKDINCEXPTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryExpenseDetails(params: DetailParams = {}) {
  void params;
  return "EXEC MKDINCEXPDET @ID = :id, @OFFSET = :offset, @LIMIT = :limit, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryRevenueTotals(params: DateParams = {}) {
  void params;
  return "EXEC MKDINCREVTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryRevenueDetails(params: DetailParams = {}) {
  void params;
  return "EXEC MKDINCREVDET @ID = :id, @OFFSET = :offset, @LIMIT = :limit, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}
