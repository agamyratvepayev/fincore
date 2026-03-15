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
  return "EXEC YUPBALCASTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryCashDetails(params: DetailParams = {}) {
  void params;
  return "EXEC YUPBALCASDET @CATEGORY = :category, @OFFSET = :offset, @LIMIT = :limit, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryMaterialTotals(params: DateParams = {}) {
  void params;
  return "EXEC YUPBALMATTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryMaterialDetails(params: DetailParams = {}) {
  void params;
  return "EXEC YUPBALMATDET @CATEGORY = :category, @OFFSET = :offset, @LIMIT = :limit, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryCreditTotals(params: DateParams = {}) {
  void params;
  return "EXEC YUPBALCRETOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryCreditDetails(params: DetailParams = {}) {
  void params;
  return "EXEC YUPBALCREDET @CODE = :code, @OFFSET = :offset, @LIMIT = :limit, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryDebitTotals(params: DateParams = {}) {
  void params;
  return "EXEC YUPBALDEBTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryDebitDetails(params: DetailParams = {}) {
  void params;
  return "EXEC YUPBALDEBDET @CODE = :code, @OFFSET = :offset, @LIMIT = :limit, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryAdvanceTotals(params: DateParams = {}) {
  void params;
  return "EXEC YUPBALADVTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryAdvanceDetails(params: DetailParams = {}) {
  void params;
  return "EXEC YUPBALADVDET @CODE = :code, @OFFSET = :offset, @LIMIT = :limit, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}
