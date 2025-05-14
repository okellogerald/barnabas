export enum FilterOperator {
    EQUALS = "eq",
    NOT_EQUALS = "neq",
    LESS_THAN = "lt",
    LESS_THAN_OR_EQUAL = "lte",
    GREATER_THAN = "gt",
    GREATER_THAN_OR_EQUAL = "gte",
    LIKE = "like",
    LIKE_LOWER = "likeLower",
    IS_NULL = "isNull",
    IS_NOT_NULL = "isNotNull",
    IN = "in",
}

export enum SortDirection {
    ASC = "asc",
    DESC = "desc",
}

export interface FilterCriteria {
    field: string;
    operator: FilterOperator;
    value?: any;
}

export interface SortCriteria {
    field: string;
    direction: SortDirection;
}

export interface QueryOptions {
    // Pagination
    page?: number;
    pageSize?: number;

    // Filtering
    filters?: FilterCriteria[];

    // Sorting
    sort?: SortCriteria[];

    // Relationships
    includes?: string[];
    
    // Join relations explicitly (for filtering on related fields)
    join?: string[];
    
    // Group By (for aggregation queries)
    groupBy?: string[];

    // Count
    count?: string;
}