type DateParams = {
  client?: string;
  code?: string;
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
  category?: string;
  offset?: number;
  limit?: number;
};

export function queryBalanceTotals(params: DateParams = {}) {
  void params;
  return "EXEC CONINVBALTOT @CODE = :client, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryBalanceDetails(params: DateParams = {}) {
  void params;
  return "EXEC CONINVBALDET @CODE = :client, @CATEGORY = :category, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}

export function queryCashTotals(params: DateParams = {}) {
  void params;
  return "EXEC CONBALCASTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryCashDetails(params: DateParams = {}) {
  void params;
  return "EXEC CONBALCASDET @CATEGORY = :category, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}

export function queryMaterialTotals(params: DateParams = {}) {
  void params;
  return "EXEC CONBALMATTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryMaterialDetails(params: DateParams = {}) {
  void params;
  return "EXEC CONBALMATDET @CATEGORY = :category, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}

export function queryAdvanceTotals(params: DateParams = {}) {
  void params;
  return "EXEC CONBALADVTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryAdvanceDetails(params: DateParams = {}) {
  void params;
  return "EXEC CONBALADVDET @CODE = :code, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}

export function queryCreditTotals(params: DateParams = {}) {
  void params;
  return "EXEC CONBALCRETOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryCreditDetails(params: DateParams = {}) {
  void params;
  return "EXEC CONBALCREDET @CODE = :code, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}

export function queryDebitTotals(params: DateParams = {}) {
  void params;
  return "EXEC CONBALDEBTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryDebitDetails(params: DateParams = {}) {
  void params;
  return "EXEC CONBALDEBDET @CODE = :code, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}

export function queryBioTotals(params: DateParams = {}) {
  void params;
  return "EXEC CONBALBIOTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryBioDetails(params: DateParams = {}) {
  void params;
  return "EXEC CONBALBIODET @CATEGORY = :category, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}

export function queryIntTotals(params: DateParams = {}) {
  void params;
  return "EXEC CONBALINTTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryIntDetails(params: DateParams = {}) {
  void params;
  return "EXEC CONBALINTDET @CATEGORY = :category, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}

export function queryShcTotals(params: DateParams = {}) {
  void params;
  return "EXEC CONBALSHCTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryShcDetails(params: DateParams = {}) {
  void params;
  return "EXEC CONBALSHCDET @CODE = :code, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}

export function queryLoanTotals(params: DateParams = {}) {
  void params;
  return "EXEC CONBALLOATOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryLoanDetails(params: DateParams = {}) {
  void params;
  return "EXEC CONBALLOADET @CODE = :code, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}
