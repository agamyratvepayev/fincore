type CashflowParams = {
  code?: string;
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
};

export function queryCashflowTotals(params: CashflowParams = {}) {
  void params;
  return "EXEC MKDCFLCASTOT @CODE = :code, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryCashflowAccounts() {
  return "EXEC MKDCFLCASNAM";
}

export function queryCashflowDateFilters() {
  return "EXEC MKDCFLCASDAT";
}

export function queryCashflowDetails(params: CashflowParams = {}) {
  void params;
  return "EXEC MKDCFLCASDET @CODE = :code, @CLCODE = :clcode, @OFFSET = :offset, @LIMIT = :limit, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}
