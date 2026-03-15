type DateParams = {
  code?: string;
  offset?: number;
  limit?: number;
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
};

export function queryCreditTotals(params: DateParams = {}) {
  void params;
  return "EXEC ALBBALCRETOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryCreditDetails(params: DateParams = {}) {
  void params;
  return "EXEC ALBBALCREDET @CODE = :code, @OFFSET = :offset, @LIMIT = :limit, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryDateFilters() {
  return "EXEC ALBBALFILDAT";
}
