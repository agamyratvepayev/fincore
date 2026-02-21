type DateFilterInput = {
  month?: number | string;
  year?: number | string;
  startDate?: string;
  endDate?: string;
};

type PageFilterInput = {
  offset?: number | string;
  limit?: number | string;
};

export function buildDateFilters(month?: number | string, year?: number | string, startDate?: string, endDate?: string) {
  const dateFilters: DateFilterInput = {};
  if (month !== undefined && month !== "") dateFilters.month = month;
  if (year !== undefined && year !== "") dateFilters.year = year;
  if (startDate) dateFilters.startDate = startDate;
  if (endDate) dateFilters.endDate = endDate;
  return dateFilters;
}

export function buildPageFilters(offset?: number | string, limit?: number | string) {
  const pageFilters: PageFilterInput = {};
  if (offset !== undefined && offset !== "") pageFilters.offset = offset;
  if (limit !== undefined && limit !== "") pageFilters.limit = limit;
  return pageFilters;
}

export function filterDate(filters: DateFilterInput = {}) {
  return {
    year: filters.year ?? "",
    month: filters.month ?? "",
    startDate: filters.startDate ?? "",
    endDate: filters.endDate ?? ""
  };
}

export function filterPage(filters: PageFilterInput = {}) {
  return {
    offset: Number(filters.offset ?? 0),
    limit: Number(filters.limit ?? 50)
  };
}
