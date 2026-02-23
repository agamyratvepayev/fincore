type DateParams = {
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

export function queryCashTotals(params: DateParams = {}) {
  void params;
  return "EXEC AGRBALCASTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryCashDetails(params: DetailParams = {}) {
  void params;
  return "EXEC AGRBALCASDET @CATEGORY = :category, @OFFSET = :offset, @LIMIT = :limit, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryMaterialTotals(params: DateParams = {}) {
  void params;
  return "EXEC AGRBALMATTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryMaterialDetails(params: DetailParams = {}) {
  void params;
  return "EXEC AGRBALMATDET @CATEGORY = :category, @OFFSET = :offset, @LIMIT = :limit, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}
