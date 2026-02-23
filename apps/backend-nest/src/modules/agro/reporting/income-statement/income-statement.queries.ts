type RevenueFilterParams = {
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
};

type DetailParams = RevenueFilterParams & {
  id?: number;
  offset?: number;
  limit?: number;
};

export function queryDateFilters() {
  return "EXEC AGRINCDATVAL";
}

export function queryRevenueTotals(filters: RevenueFilterParams = {}) {
  void filters;
  return "EXEC AGRINCREVTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryExpenseTotals(filters: RevenueFilterParams = {}) {
  void filters;
  return "EXEC AGRINCEXPTOT @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryRevenueDetails(filters: DetailParams = {}) {
  void filters;
  return "EXEC AGRINCREVDET @ID = :id, @OFFSET = :offset, @LIMIT = :limit, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryExpenseDetails(filters: DetailParams = {}) {
  void filters;
  return "EXEC AGRINCEXPDET @ID = :id, @YEAR = :year, @MONTH = :month, @STARTDATE = :startDate, @ENDDATE = :endDate";
}

export function queryExpenseDetailsFallback(filters: DetailParams = {}) {
  void filters;
  return `
    ;WITH CTE AS (
      SELECT
        SRC.DEFINITION_ AS CATEGORY,
        STL.DATE_,
        CLC.DEFINITION_,
        STL.LINEEXP,
        CAST(STL.AMOUNT AS VARCHAR(64)) AS AMOUNT,
        STL.LINENET AS LINENET,
        STL.LINENET / IIF(STL.REPORTRATE = 0, 19.5, STL.REPORTRATE) AS REPORTNET
      FROM UNRN..LG_115_01_STLINE STL
      LEFT JOIN UNRN..LG_115_SRVCARD SRC ON STL.STOCKREF = SRC.LOGICALREF
      LEFT JOIN UNRN..L_CAPIWHOUSE WHO ON STL.SOURCEINDEX = WHO.NR AND WHO.FIRMNR = 115
      LEFT JOIN UNRN..LG_115_CLCARD CLC ON STL.CLIENTREF = CLC.LOGICALREF
      WHERE STL.TRCODE = 4
        AND SRC.AFFECTCOST = 0
        AND YEAR(STL.DATE_) = ISNULL(:year, YEAR(STL.DATE_))
        AND MONTH(STL.DATE_) = ISNULL(:month, MONTH(STL.DATE_))
        AND STL.DATE_ BETWEEN ISNULL(:startDate, '1900-01-01') AND ISNULL(:endDate, '2115-01-01')

      UNION ALL

      SELECT
        'SKIDKA' AS CATEGORY,
        CFL.DATE_,
        CLC.DEFINITION_,
        CFL.LINEEXP,
        CAST(1 AS VARCHAR(64)) AS AMOUNT,
        CASE WHEN CFL.SIGN = 0 THEN CFL.AMOUNT WHEN CFL.SIGN = 1 THEN CFL.AMOUNT * (-1) END AS LINENET,
        CASE WHEN CFL.SIGN = 0 THEN CFL.REPORTNET WHEN CFL.SIGN = 1 THEN CFL.REPORTNET * (-1) END AS REPORTNET
      FROM UNRN..LG_115_CLCARD CLC
      INNER JOIN UNRN..LG_115_01_CLFLINE CFL ON CLC.LOGICALREF = CFL.CLIENTREF
      WHERE CFL.MODULENR = 5
        AND CFL.TRCODE IN (3,4)
        AND YEAR(CFL.DATE_) = ISNULL(:year, YEAR(CFL.DATE_))
        AND MONTH(CFL.DATE_) = ISNULL(:month, MONTH(CFL.DATE_))
        AND CFL.DATE_ BETWEEN ISNULL(:startDate, '1900-01-01') AND ISNULL(:endDate, '2115-01-01')

      UNION ALL

      SELECT
        CASE
          WHEN STL.TRCODE = 50 THEN 'ARTYK'
          WHEN STL.TRCODE = 51 THEN 'YENLAN'
          WHEN STL.TRCODE = 11 THEN 'ZAYALANAN'
          WHEN STL.TRCODE = 12 THEN 'ULANYLAN'
          WHEN STL.TRCODE = 13 THEN 'ONDURILEN'
        END AS CATEGORY,
        STL.DATE_,
        ITM.NAME AS DEFINITION_,
        STL.LINEEXP,
        CAST(STL.AMOUNT AS VARCHAR(64)) + ' ' + UNI.NAME AS AMOUNT,
        CASE
          WHEN STL.TRCODE = 13 THEN STL.LINENET + STL.DIFFPRICE
          WHEN STL.TRCODE IN (11,12,51) THEN STL.AMOUNT * STL.OUTCOST * (-1)
          WHEN STL.TRCODE = 50 THEN STL.LINENET
        END AS LINENET,
        CASE
          WHEN STL.TRCODE = 13 THEN STL.LINENET / IIF(STL.REPORTRATE = 0, 19.5, STL.REPORTRATE) + STL.DIFFREPPRICE
          WHEN STL.TRCODE IN (11,12,51) THEN STL.AMOUNT * STL.OUTCOSTCURR * (-1)
          WHEN STL.TRCODE = 50 THEN STL.LINENET / IIF(STL.REPORTRATE = 0, 19.5, STL.REPORTRATE)
        END AS REPORTNET
      FROM UNRN..LG_115_ITEMS ITM
      LEFT JOIN UNRN..LG_115_01_STLINE STL ON ITM.LOGICALREF = STL.STOCKREF
      LEFT JOIN UNRN..LG_115_UNITSETF UNI ON ITM.UNITSETREF = UNI.LOGICALREF
      WHERE STL.TRCODE IN (11,12,50,51,13)
        AND ITM.CARDTYPE <> 4
        AND STL.LINETYPE <> 4
        AND YEAR(STL.DATE_) = ISNULL(:year, YEAR(STL.DATE_))
        AND MONTH(STL.DATE_) = ISNULL(:month, MONTH(STL.DATE_))
        AND STL.DATE_ BETWEEN ISNULL(:startDate, '1900-01-01') AND ISNULL(:endDate, '2115-01-01')
    ),
    Ranked AS (
      SELECT
        DENSE_RANK() OVER (ORDER BY CATEGORY) AS RN,
        *
      FROM CTE
    )
    SELECT *
    FROM Ranked
    WHERE RN = ISNULL(:id, RN)
    ORDER BY DATE_ DESC
    OFFSET ISNULL(:offset, 0) ROWS
    FETCH NEXT ISNULL(:limit, 999999999) ROWS ONLY
  `;
}
