export interface PaginationOptions extends Record<string, unknown> {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
}

export interface PaginationResult<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default class PaginationUtil {
  private static readonly DEFAULT_PAGE = 1;
  private static readonly DEFAULT_LIMIT = 10;
  private static readonly MAX_LIMIT = 10000;
  private static readonly DEFAULT_SORT: Record<string, 1 | -1> = {
    createdAt: -1,
  };

  /**
   * Calculate pagination parameters
   * @param page - Current page number
   * @param limit - Number of items per page
   * @returns Object with pagination parameters
   */
  static calculatePagination(
    page: number = this.DEFAULT_PAGE,
    limit: number = this.DEFAULT_LIMIT
  ) {
    const currentPage = Math.max(this.DEFAULT_PAGE, Number(page));
    const itemsPerPage = Math.min(Math.max(1, Number(limit)), this.MAX_LIMIT);
    const skip = (currentPage - 1) * itemsPerPage;

    return {
      skip,
      limit: itemsPerPage,
      page: currentPage,
    };
  }

  /**
   * Format pagination result
   * @param items - Array of items
   * @param total - Total number of items
   * @param page - Current page
   * @param limit - Items per page
   * @returns Formatted pagination result
   */
  static formatResult<T>(
    items: T[],
    total: number,
    page: number = this.DEFAULT_PAGE,
    limit: number = this.DEFAULT_LIMIT
  ): PaginationResult<T> {
    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Parse sort options from query string
   * @param sort - Sort string from query
   * @returns Parsed sort options
   */
  static parseSortOptions(sort?: string): Record<string, 1 | -1> {
    if (!sort) return this.DEFAULT_SORT;

    try {
      return JSON.parse(sort);
    } catch {
      return this.DEFAULT_SORT;
    }
  }

  /**
   * Parse query parameters for pagination
   * @param query - Query parameters
   * @returns Parsed pagination options
   */
  static parseQuery(query: Record<string, unknown>): PaginationOptions {
    const { page, limit, sort, ...filters } = query;

    return {
      page: Math.max(this.DEFAULT_PAGE, Number(page) || this.DEFAULT_PAGE),
      limit: Math.min(
        Math.max(1, Number(limit) || this.DEFAULT_LIMIT),
        this.MAX_LIMIT
      ),
      sort: this.parseSortOptions(sort as string),
      ...filters,
    };
  }
}
