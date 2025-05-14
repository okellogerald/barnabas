import { QueryBuilder, SortDirection } from "@/lib/query";

// Symbol for envelope query builder type
export const ENVELOPE_QUERY_BUILDER_TYPE = Symbol(
    "envelope-query-builder-type",
);

/**
 * Structured criteria for querying envelopes
 */
export interface EnvelopeQueryCriteria {
    // Pagination
    page?: number;
    pageSize?: number;

    // Filters
    number?: number;
    isAssigned?: boolean;
    memberId?: string;

    // Sorting
    sortBy?: string;
    sortDirection?: SortDirection;
}

/**
 * Query builder for Envelope queries with typed filter methods, eager loading,
 * and query criteria application.
 */
export class EnvelopeQueryBuilder extends QueryBuilder {
    /**
     * Type tag to identify EnvelopeQueryBuilder instances
     */
    [ENVELOPE_QUERY_BUILDER_TYPE] = true;

    /**
     * Determines if an object is an instance of EnvelopeQueryBuilder.
     * @param obj - The object to check.
     * @returns `true` if the object is an EnvelopeQueryBuilder, otherwise `false`.
     */
    static is(obj: any): obj is EnvelopeQueryBuilder {
        return QueryBuilder.is(obj) && ENVELOPE_QUERY_BUILDER_TYPE in obj;
    }

    // === 📝 Filter Methods ===

    /**
     * Filters the query by a specific envelope number.
     * @param number - The envelope number to filter by.
     * @returns The current query builder instance.
     */
    filterByEnvelopeNumber(number: number): this {
        return this.where("envelopeNumber", number);
    }

    /**
     * Filters the query by assignment status.
     * If `isAssigned` is true, only assigned envelopes are returned.
     * If false, only unassigned envelopes are included.
     * @param isAssigned - The assignment status to filter by.
     * @returns The current query builder instance.
     */
    filterByAssignmentStatus(isAssigned: boolean): this {
        if (isAssigned) {
            return this.whereNotNull("assignedAt");
        }
        return this.whereNull("assignedAt");
    }

    /**
     * Filters the query by a specific member ID.
     * @param memberId - The member ID to filter by.
     * @returns The current query builder instance.
     */
    filterByMemberId(memberId: string): this {
        return this.where("memberId", memberId);
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
     * Includes pagination, filtering, and sorting logic.
     * @param options - The query criteria to apply.
     * @returns The current query builder instance.
     */
    applyCriteria(options: EnvelopeQueryCriteria): this {
        if (options.number !== undefined) {
            this.filterByEnvelopeNumber(options.number);
        }
        if (options.isAssigned !== undefined) {
            this.filterByAssignmentStatus(options.isAssigned);
        }
        if (options.memberId) {
            this.filterByMemberId(options.memberId);
        }
        if (options.sortBy) {
            this.orderBy(
                options.sortBy,
                options.sortDirection || SortDirection.ASC,
            );
        } else {
            this.orderBy("envelopeNumber", SortDirection.ASC);
        }
        if (options.page && options.pageSize) {
            this.paginate(options.page, options.pageSize);
        }
        return this;
    }

    /**
     * Includes default relations for eager loading.
     * This ensures that related `member` data is fetched automatically.
     * @returns The current query builder instance.
     */
    includeDefaultRelations(): this {
        return this.with("member");
    }

    // === 🏗️ Factory Methods ===

    /**
     * Creates a new instance of EnvelopeQueryBuilder.
     * @returns A new instance of the query builder.
     */
    static newInstance(): EnvelopeQueryBuilder {
        return new EnvelopeQueryBuilder();
    }

    /**
     * Creates a new instance of EnvelopeQueryBuilder and applies query criteria.
     * Automatically includes default relations.
     * @param options - The query criteria to apply.
     * @returns A configured instance of the query builder.
     */
    static createFromCriteria(
        options?: EnvelopeQueryCriteria,
    ): EnvelopeQueryBuilder {
        if (!options) {
            return EnvelopeQueryBuilder.newInstance().includeDefaultRelations();
        }

        return EnvelopeQueryBuilder.newInstance()
            .includeDefaultRelations()
            .applyCriteria(options);
    }

    /**
     * Creates a new EnvelopeQueryBuilder from either query criteria or another builder.
     * If an existing builder is provided, it clones it.
     * @param options - Query criteria or an existing builder instance.
     * @returns A new instance of EnvelopeQueryBuilder.
     */
    static createFromBuilderOrCriteria(
        options: EnvelopeQueryCriteria | EnvelopeQueryBuilder,
    ): EnvelopeQueryBuilder {
        if (EnvelopeQueryBuilder.is(options)) {
            return options.clone();
        }

        return EnvelopeQueryBuilder.createFromCriteria(options);
    }

    /**
     * Shortcut method to create an instance from criteria or builder.
     * @param options - Optional criteria or builder to clone.
     * @returns A new instance of EnvelopeQueryBuilder.
     */
    static from(
        options?: EnvelopeQueryCriteria | EnvelopeQueryBuilder,
    ): EnvelopeQueryBuilder {
        if (!options) {
            return EnvelopeQueryBuilder.newInstance().includeDefaultRelations();
        }

        return EnvelopeQueryBuilder.createFromBuilderOrCriteria(options);
    }
}
