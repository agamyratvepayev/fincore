type DateParams = {
  code?: string;
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
  category?: string;
  offset?: number;
  limit?: number;
};

export function queryCashTotals(params: DateParams = {}) {
  void params;
  return "EXEC GURBALCASTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryCashDetails(params: DateParams = {}) {
  void params;
  return "EXEC GURBALCASDET @CATEGORY = :category, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}

export function queryMaterialTotals(params: DateParams = {}) {
  void params;
  return "EXEC GURBALMATTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryMaterialDetails(params: DateParams = {}) {
  void params;
  return "EXEC GURBALMATDET @CATEGORY = :category, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}

export function queryCreditTotals(params: DateParams = {}) {
  void params;
  return "EXEC GURBALCRETOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryCreditDetails(params: DateParams = {}) {
  void params;
  return "EXEC GURBALCREDET @CODE = :code, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}

export function queryBioTotals(params: DateParams = {}) {
  void params;
  return "EXEC GURBALBIOTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryBioDetails(params: DateParams = {}) {
  void params;
  return "EXEC GURBALBIODET @CODE = :code, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}

export function queryLoanTotals(params: DateParams = {}) {
  void params;
  return "EXEC GURBALLOATOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryLoanDetails(params: DateParams = {}) {
  void params;
  return "EXEC GURBALLOADET @CODE = :code, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}

export function queryAdvanceTotals(params: DateParams = {}) {
  void params;
  return "EXEC GURBALADVTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryAdvanceDetails(params: DateParams = {}) {
  void params;
  return "EXEC GURBALADVDET @CODE = :code, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}
