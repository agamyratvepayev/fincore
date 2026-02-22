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


