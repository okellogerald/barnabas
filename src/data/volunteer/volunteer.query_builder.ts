import { QueryBuilder, SortDirection } from "@/lib/query";

// Symbol for volunteer opportunity query builder type
export const VOLUNTEER_OPPORTUNITY_QUERY_BUILDER_TYPE = Symbol(
    "volunteer-query-builder-type",
);

/**
 * Structured criteria for querying volunteer opportunities
 */
export interface VolunteerOpportunityQueryCriteria {
    // Pagination
    page?: number;
    pageSize?: number;

    // Filters
    name?: string;
    description?: string;

    // Sorting
    sortBy?: string;
    sortDirection?: SortDirection;
}

/**
 * Query builder for Volunteer Opportunity queries with typed filter methods,
 * eager loading, and query criteria application.
 */
export class VolunteerOpportunityQueryBuilder extends QueryBuilder {
    /**
     * Type tag to identify VolunteerQueryBuilder instances
     */
    [VOLUNTEER_OPPORTUNITY_QUERY_BUILDER_TYPE] = true;

    /**
     * Determines if an object is an instance of VolunteerQueryBuilder.
     * @param obj - The object to check.
     * @returns `true` if the object is a VolunteerQueryBuilder, otherwise `false`.
     */
    static is(obj: any): obj is VolunteerOpportunityQueryBuilder {
        return QueryBuilder.is(obj) &&
            VOLUNTEER_OPPORTUNITY_QUERY_BUILDER_TYPE in obj;
    }

    // === 📝 Filter Methods ===

    /**
     * Filters the query by opportunity name (case-insensitive search).
     * @param name - The name or partial name to search for.
     * @returns The current query builder instance.
     */
    filterByName(name: string): this {
        return this.whereContains("name", name);
    }

    /**
     * Filters the query by opportunity description (case-insensitive search).
     * @param description - The description text to search for.
     * @returns The current query builder instance.
     */
    filterByDescription(description: string): this {
        return this.whereContains("description", description);
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
    applyCriteria(options: VolunteerOpportunityQueryCriteria): this {
        // Apply filters
        if (options.name !== undefined) {
            this.filterByName(options.name);
        }
        if (options.description !== undefined) {
            this.filterByDescription(options.description);
        }

        // Apply sorting
        if (options.sortBy) {
            this.orderBy(
                options.sortBy,
                options.sortDirection || SortDirection.ASC,
            );
        } else {
            this.orderBy("name", SortDirection.ASC);
        }

        // Apply pagination
        if (options.page && options.pageSize) {
            this.paginate(options.page, options.pageSize);
        }

        return this;
    }

    /**
     * Includes default relations for eager loading.
     * This ensures that related `interestedMembers` data is fetched automatically.
     * @returns The current query builder instance.
     */
    includeDefaultRelations(): this {
        return this;
    }

    // === 🏗️ Factory Methods ===

    /**
     * Creates a new instance of VolunteerQueryBuilder.
     * @returns A new instance of the query builder.
     */
    static newInstance(): VolunteerOpportunityQueryBuilder {
        return new VolunteerOpportunityQueryBuilder();
    }

    /**
     * Creates a new instance of VolunteerQueryBuilder and applies query criteria.
     * Automatically includes default relations.
     * @param options - The query criteria to apply.
     * @returns A configured instance of the query builder.
     */
    static createFromCriteria(
        options?: VolunteerOpportunityQueryCriteria,
    ): VolunteerOpportunityQueryBuilder {
        if (!options) {
            return VolunteerOpportunityQueryBuilder.newInstance()
                .includeDefaultRelations();
        }

        return VolunteerOpportunityQueryBuilder.newInstance()
            .includeDefaultRelations()
            .applyCriteria(options);
    }

    /**
     * Creates a new VolunteerQueryBuilder from either query criteria or another builder.
     * If an existing builder is provided, it clones it.
     * @param options - Query criteria or an existing builder instance.
     * @returns A new instance of VolunteerQueryBuilder.
     */
    static createFromBuilderOrCriteria(
        options:
            | VolunteerOpportunityQueryCriteria
            | VolunteerOpportunityQueryBuilder,
    ): VolunteerOpportunityQueryBuilder {
        if (VolunteerOpportunityQueryBuilder.is(options)) {
            return options.clone();
        }

        return VolunteerOpportunityQueryBuilder.createFromCriteria(options);
    }

    /**
     * Shortcut method to create an instance from criteria or builder.
     * @param options - Optional criteria or builder to clone.
     * @returns A new instance of VolunteerQueryBuilder.
     */
    static from(
        options?:
            | VolunteerOpportunityQueryCriteria
            | VolunteerOpportunityQueryBuilder,
    ): VolunteerOpportunityQueryBuilder {
        if (!options) {
            return VolunteerOpportunityQueryBuilder.newInstance()
                .includeDefaultRelations();
        }

        return VolunteerOpportunityQueryBuilder.createFromBuilderOrCriteria(
            options,
        );
    }
}
