import { AppConfig } from "@/app";
import {
    FilterCriteria,
    FilterOperator,
    QueryOptions,
    SortCriteria,
    SortDirection,
} from "./types";

// Symbol for type identification
export const QUERY_BUILDER_TYPE = Symbol("query-builder-type");

export class QueryBuilder {
    protected options: QueryOptions = {
        filters: [],
        sort: [],
        includes: [],

        count: "*",
        page: 1,
        pageSize: AppConfig.DEFAULT_PAGE_SIZE,
    };

    constructor(options: QueryOptions = {}) {
        this.options = {
            filters: options.filters || [],
            sort: options.sort || [],
            includes: options.includes || [],
            page: options.page,
            pageSize: options.pageSize,
        };
    }

    /**
     * Type tag to identify QueryBuilder instances
     */
    [QUERY_BUILDER_TYPE] = "query-builder";

    /**
     * Safely check if an object is a QueryBuilder instance
     */
    static is(obj: any): obj is QueryBuilder {
        return obj !== null &&
            typeof obj === "object" &&
            QUERY_BUILDER_TYPE in obj &&
            obj[QUERY_BUILDER_TYPE] === "query-builder";
    }

    // FILTER METHODS

    addFilter(criteria: FilterCriteria): this {
        this.options.filters = [...(this.options.filters || []), criteria];
        return this;
    }

    where(field: string, value: any): this {
        return this.addFilter({
            field,
            operator: FilterOperator.EQUALS,
            value,
        });
    }

    whereNot(field: string, value: any): this {
        return this.addFilter({
            field,
            operator: FilterOperator.NOT_EQUALS,
            value,
        });
    }

    whereLike(field: string, value: string): this {
        return this.addFilter({
            field,
            operator: FilterOperator.LIKE,
            value,
        });
    }

    whereLikeLower(field: string, value: string): this {
        return this.addFilter({
            field,
            operator: FilterOperator.LIKE_LOWER,
            value,
        });
    }

    whereContains(field: string, value: string): this {
        return this.addFilter({
            field,
            operator: FilterOperator.LIKE_LOWER,
            value: `%${value}%`,
        });
    }

    whereStartsWith(field: string, value: string): this {
        return this.addFilter({
            field,
            operator: FilterOperator.LIKE_LOWER,
            value: `${value}%`,
        });
    }

    whereEndsWith(field: string, value: string): this {
        return this.addFilter({
            field,
            operator: FilterOperator.LIKE_LOWER,
            value: `%${value}`,
        });
    }

    whereIn(field: string, values: any[]): this {
        return this.addFilter({
            field,
            operator: FilterOperator.IN,
            value: values,
        });
    }

    whereNull(field: string): this {
        return this.addFilter({
            field,
            operator: FilterOperator.IS_NULL,
        });
    }

    whereNotNull(field: string): this {
        return this.addFilter({
            field,
            operator: FilterOperator.IS_NOT_NULL,
        });
    }

    // SORTING METHODS

    addSort(criteria: SortCriteria): this {
        this.options.sort = [...(this.options.sort || []), criteria];
        return this;
    }

    orderBy(field: string, direction: SortDirection = SortDirection.ASC): this {
        return this.addSort({ field, direction });
    }

    orderByAsc(field: string): this {
        return this.orderBy(field, SortDirection.ASC);
    }

    orderByDesc(field: string): this {
        return this.orderBy(field, SortDirection.DESC);
    }

    // PAGINATION METHODS

    paginate(page: number, pageSize: number): this {
        this.options.page = page;
        this.options.pageSize = pageSize;
        return this;
    }

    // RELATIONSHIP METHODS

    with(relations: string | string[]): this {
        const relationsArray = Array.isArray(relations)
            ? relations
            : [relations];
        this.options.includes = [
            ...(this.options.includes || []),
            ...relationsArray,
        ];
        return this;
    }

    // COUNT

    /**
     * Enable count mode for the query
     * @param expression Optional count expression (defaults to '*')
     */
    count(expression: string = "*"): this {
        this.options.count = expression;
        return this;
    }

    // BUILD METHOD

    /**
     * @returns an objection-find query
     */
    build(): Record<string, any> {
        const result: Record<string, any> = {};

        // Handle pagination
        if (
            this.options.page !== undefined &&
            this.options.pageSize !== undefined
        ) {
            const rangeStart = (this.options.page - 1) * this.options.pageSize;
            const rangeEnd = rangeStart + this.options.pageSize - 1;

            result.rangeStart = rangeStart;
            result.rangeEnd = rangeEnd;
        }

        // Handle filters
        if (this.options.filters && this.options.filters.length > 0) {
            for (const filter of this.options.filters) {
                switch (filter.operator) {
                    case FilterOperator.IS_NULL:
                        result[`${filter.field}:isNull`] = 1;
                        break;
                    case FilterOperator.IS_NOT_NULL:
                        result[`${filter.field}:isNotNull`] = 1;
                        break;
                    case FilterOperator.IN:
                        result[`${filter.field}:in`] =
                            Array.isArray(filter.value)
                                ? filter.value.join(",")
                                : filter.value;
                        break;
                    default:
                        result[`${filter.field}:${filter.operator}`] =
                            filter.value;
                }
            }
        }

        // Handle sorting
        if (this.options.sort && this.options.sort.length > 0) {
            const ascFields = this.options.sort
                .filter((s) => s.direction === "asc")
                .map((s) => s.field);

            const descFields = this.options.sort
                .filter((s) => s.direction === "desc")
                .map((s) => s.field);

            if (ascFields.length > 0) {
                result.orderBy = ascFields.join(",");
            }

            if (descFields.length > 0) {
                result.orderByDesc = descFields.join(",");
            }
        }

        // Handle relations
        if (this.options.includes && this.options.includes.length > 0) {
            if(this.options.includes.length === 1) {
                result.eager = this.options.includes[0];
            } else {
                result.eager = this.options.includes.join(",");
            }
        }

        // Handle count parameter
        if (this.options.count) {
            result.count = this.options.count;
        }

        return result;
    }

    /**
     * Create a clone of this query builder
     */
    clone(): this {
        // Create a new instance with the same options
        const ClonedBuilder = this.constructor as new (
            options: QueryOptions,
        ) => this;
        return new ClonedBuilder({ ...this.options });
    }

    // Static factory method
    static create(options?: QueryOptions): QueryBuilder {
        return new QueryBuilder(options);
    }
}
