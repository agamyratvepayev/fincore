type CashflowParams = {
  code?: string;
  clcode?: string;
  offset?: number;
  limit?: number;
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
};

export function queryCashflowTotals(params: CashflowParams = {}) {
  void params;
  return "EXEC ALBCFLCASTOT @CODE = :code, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryCashflowAccounts() {
  return "EXEC ALBCFLCASNAM";
}

export function queryCashflowDetails(params: CashflowParams = {}) {
  void params;
  return "EXEC ALBCFLCASDET @CODE = :code, @CLCODE = :clcode, @OFFSET = :offset, @LIMIT = :limit, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryCashflowDateFilters() {
  return "EXEC ALBCFLCASDAT";
}
