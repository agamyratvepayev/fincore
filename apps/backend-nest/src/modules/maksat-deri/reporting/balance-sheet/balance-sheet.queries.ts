type DateParams = {
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
};

type DetailParams = DateParams & {
  code?: string;
  category?: string;
  offset?: number;
  limit?: number;
};

export function queryCashTotals(params: DateParams = {}) {
  void params;
  return "EXEC MKDBALCASTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryCashDetails(params: DetailParams = {}) {
  void params;
  return "EXEC MKDBALCASDET @CATEGORY = :category, @OFFSET = :offset, @LIMIT = :limit, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryMaterialTotals(params: DateParams = {}) {
  void params;
  return "EXEC MKDBALMATTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryMaterialDetails(params: DetailParams = {}) {
  void params;
  return "EXEC MKDBALMATDET @CATEGORY = :category, @OFFSET = :offset, @LIMIT = :limit, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryCreditTotals(params: DateParams = {}) {
  void params;
  return "EXEC MKDBALCRETOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryCreditDetails(params: DetailParams = {}) {
  void params;
  return "EXEC MKDBALCREDET @CODE = :code, @OFFSET = :offset, @LIMIT = :limit, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryLoanTotals(params: DateParams = {}) {
  void params;
  return "EXEC MKDBALLOATOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryLoanDetails(params: DetailParams = {}) {
  void params;
  return "EXEC MKDBALLOADET @CODE = :code, @OFFSET = :offset, @LIMIT = :limit, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryAdvanceTotals(params: DateParams = {}) {
  void params;
  return "EXEC MKDBALADVTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryAdvanceDetails(params: DetailParams = {}) {
  void params;
  return "EXEC MKDBALADVDET @CODE = :code, @OFFSET = :offset, @LIMIT = :limit, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}
