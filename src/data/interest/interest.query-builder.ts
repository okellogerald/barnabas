import { QueryBuilder, SortDirection } from "@/lib/query";

// Symbol for interest query builder type
export const INTEREST_QUERY_BUILDER_TYPE = Symbol(
    "interest-query-builder-type",
);

/**
 * Structured criteria for querying interests
 */
export interface InterestQueryCriteria {
    // Pagination
    page?: number;
    pageSize?: number;

    // Filters
    memberId?: string;
    opportunityId?: string;

    // Sorting
    sortBy?: string;
    sortDirection?: SortDirection;
}

/**
 * Query builder for Interest queries with typed filter methods, eager loading,
 * and query criteria application.
 */
export class InterestQueryBuilder extends QueryBuilder {
    /**
     * Type tag to identify InterestQueryBuilder instances
     */
    [INTEREST_QUERY_BUILDER_TYPE] = true;

    /**
     * Determines if an object is an instance of InterestQueryBuilder.
     * @param obj - The object to check.
     * @returns `true` if the object is an InterestQueryBuilder, otherwise `false`.
     */
    static is(obj: any): obj is InterestQueryBuilder {
        return QueryBuilder.is(obj) && INTEREST_QUERY_BUILDER_TYPE in obj;
    }

    // === 📝 Filter Methods ===

    /**
     * Filters interests by member ID
     * @param memberId - The member ID to filter by
     * @returns The current query builder instance
     */
    filterByMemberId(memberId: string): this {
        return this.where("memberId", memberId);
    }

    /**
     * Filters interests by opportunity ID
     * @param opportunityId - The opportunity ID to filter by
     * @returns The current query builder instance
     */
    filterByOpportunityId(opportunityId: string): this {
        return this.where("opportunityId", opportunityId);
    }

    // === ⚙️ Query Configuration Methods ===

    /**
     * Configures the query for a count operation, only retrieving the number of results.
     * @returns The current query builder instance.
     */
    configureForCount(): this {
        this.count("*");
        return this;
    }

    /**
     * Applies query criteria from the provided options.
     * @param options - The query criteria to apply.
     * @returns The current query builder instance.
     */
    applyCriteria(options: InterestQueryCriteria): this {
        if (options.memberId) {
            this.filterByMemberId(options.memberId);
        }
        if (options.opportunityId) {
            this.filterByOpportunityId(options.opportunityId);
        }
        if (options.sortBy) {
            this.orderBy(
                options.sortBy,
                options.sortDirection || SortDirection.ASC,
            );
        }
        if (options.page && options.pageSize) {
            this.paginate(options.page, options.pageSize);
        }
        return this;
    }

    /**
     * Includes member and opportunity relations for eager loading.
     * @returns The current query builder instance.
     */
    includeDefaultRelations(): this {
        return this.with(["member", "opportunity"]);
    }

    // === 🏗️ Factory Methods ===

    /**
     * Creates a new instance of InterestQueryBuilder.
     * @returns A new instance of the query builder.
     */
    static newInstance(): InterestQueryBuilder {
        return new InterestQueryBuilder();
    }

    /**
     * Creates a new instance of InterestQueryBuilder with default relations.
     * @returns A new instance with default relations.
     */
    static createWithDefaultRelations(): InterestQueryBuilder {
        return InterestQueryBuilder.newInstance().includeDefaultRelations();
    }

    /**
     * Creates a new instance of InterestQueryBuilder and applies query criteria.
     * @param options - The query criteria to apply.
     * @returns A configured instance of the query builder.
     */
    static createFromCriteria(
        options?: InterestQueryCriteria,
    ): InterestQueryBuilder {
        if (!options) {
            return InterestQueryBuilder.createWithDefaultRelations();
        }

        return InterestQueryBuilder.newInstance()
            .includeDefaultRelations()
            .applyCriteria(options);
    }

    /**
     * Creates a new InterestQueryBuilder from either query criteria or another builder.
     * @param options - Query criteria or an existing builder instance.
     * @returns A new instance of InterestQueryBuilder.
     */
    static from(
        options?: InterestQueryCriteria | InterestQueryBuilder,
    ): InterestQueryBuilder {
        if (!options) {
            return InterestQueryBuilder.createWithDefaultRelations();
        }

        if (InterestQueryBuilder.is(options)) {
            return options.clone();
        }

        return InterestQueryBuilder.createFromCriteria(options);
    }
}
