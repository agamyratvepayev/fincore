type RevenueFilterParams = {
  code?: string;
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
};

type DetailParams = RevenueFilterParams & {
  category?: string | number;
  offset?: number;
  limit?: number;
};

function isAgroTenant(tenantId?: string) {
  return String(tenantId ?? "").toLowerCase() === "agro";
}

export function queryDateFilters(tenantId?: string) {
  if (isAgroTenant(tenantId)) {
    return "SELECT DISTINCT DATE_ FROM UNRN..LG_115_01_STLINE WHERE DATE_ IS NOT NULL";
  }
  return "EXEC GURINCDATVAL";
}

export function queryClientNames(tenantId?: string) {
  if (isAgroTenant(tenantId)) {
    return "SELECT TOP 0 '' AS CODE, '' AS NAME";
  }
  return "EXEC GURINCCLIVAL";
}

export function queryRevenueTotals(tenantId: string, filters: RevenueFilterParams = {}) {
  void filters;
  if (isAgroTenant(tenantId)) {
    return "EXEC AGRINCREVTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
  }
  return "EXEC GURINCREVTOT @CODE = :code, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryExpenseTotals(tenantId: string, filters: RevenueFilterParams = {}) {
  void filters;
  if (isAgroTenant(tenantId)) {
    return "";
  }
  return "EXEC GURINCEXPTOT @CODE = :code, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryBalanceTotals(tenantId: string, filters: RevenueFilterParams = {}) {
  void filters;
  if (isAgroTenant(tenantId)) {
    return "";
  }
  return "EXEC GURINVBALTOT @CODE = :code, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryRevenueDetails(tenantId: string, filters: DetailParams = {}) {
  void filters;
  if (isAgroTenant(tenantId)) {
    return `
      WITH RankedData AS (
        SELECT
          CASE
            WHEN STL.LINETYPE = 4 THEN 'HYZMATLAR'
            ELSE 'SATYSLAR'
          END AS CATEGORY,
          WHO.NAME AS WHOUSE,
          STL.DATE_,
          CLC.DEFINITION_ AS CLIENT,
          ISNULL(ITM.NAME, SVC.DEFINITION_) AS DEFINITION_,
          UPPER(UNI.NAME) AS UNIT,
          STL.AMOUNT,
          CASE
            WHEN STL.TRCODE IN (7,8,9) THEN STL.LINENET
            WHEN STL.TRCODE IN (2,3) THEN STL.LINENET * (-1)
          END AS LINENET,
          CASE
            WHEN STL.TRCODE IN (7,8,9) THEN STL.LINENET / IIF(STL.REPORTRATE = 0, 19.5, STL.REPORTRATE)
            WHEN STL.TRCODE IN (2,3) THEN STL.LINENET / IIF(STL.REPORTRATE = 0, 19.5, STL.REPORTRATE) * (-1)
          END AS REPORTNET,
          CASE
            WHEN STL.TRCODE IN (7,8,9) THEN STL.AMOUNT * STL.OUTCOST
            WHEN STL.TRCODE IN (2,3) THEN STL.AMOUNT * STL.OUTCOST * (-1)
          END AS OUTCOST,
          CASE
            WHEN STL.TRCODE IN (7,8,9) THEN STL.AMOUNT * STL.OUTCOSTCURR
            WHEN STL.TRCODE IN (2,3,9) THEN STL.AMOUNT * STL.OUTCOSTCURR * (-1)
          END AS OUTCOSTCURR
        FROM UNRN..LG_115_01_STLINE STL
        LEFT JOIN UNRN..LG_115_ITEMS ITM
          ON ITM.LOGICALREF = STL.STOCKREF
          AND STL.LINETYPE = 0
        LEFT JOIN UNRN..L_CAPIWHOUSE WHO
          ON STL.SOURCEINDEX = WHO.NR
          AND WHO.FIRMNR = 115
        LEFT JOIN UNRN..LG_115_UNITSETF UNI
          ON ITM.UNITSETREF = UNI.LOGICALREF
        LEFT JOIN UNRN..LG_115_CLCARD CLC
          ON STL.CLIENTREF = CLC.LOGICALREF
        LEFT JOIN UNRN..LG_115_SRVCARD SVC
          ON STL.STOCKREF = SVC.LOGICALREF
          AND STL.LINETYPE = 4
        WHERE STL.TRCODE IN (7,8,2,3,9)
          AND STL.LINETYPE IN (0,4)
          AND STL.LINETYPE = ISNULL(:category, STL.LINETYPE)
          AND YEAR(STL.DATE_) = ISNULL(:year, YEAR(STL.DATE_))
          AND MONTH(STL.DATE_) = ISNULL(:month, MONTH(STL.DATE_))
          AND STL.DATE_ BETWEEN ISNULL(:startDate, '1900-01-01')
            AND ISNULL(:endDate, '2115-01-01')
      )
      SELECT *
      FROM RankedData
      ORDER BY DATE_ DESC
      OFFSET ISNULL(:offset, 0) ROWS
      FETCH NEXT ISNULL(:limit, 999999999) ROWS ONLY
    `;
  }
  return "EXEC GURINCREVDET @CODE = :code, @CATEGORY = :category, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}

export function queryExpenseDetails(tenantId: string, filters: DetailParams = {}) {
  void filters;
  if (isAgroTenant(tenantId)) {
    return "";
  }
  return "EXEC GURINCEXPDET @CODE = :code, @CATEGORY = :category, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}

export function queryBalanceDetails(tenantId: string, filters: DetailParams = {}) {
  void filters;
  if (isAgroTenant(tenantId)) {
    return "";
  }
  return "EXEC GURINVBALDET @CODE = :code, @CATEGORY = :category, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate, @OFFSET = :offset, @LIMIT = :limit";
}
