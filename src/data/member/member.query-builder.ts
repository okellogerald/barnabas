import { QueryBuilder } from "@/lib/query/query.builder";
import { SortDirection } from "@/lib/query/query.types";

// Symbol for member query builder type
export const MEMBER_QUERY_BUILDER_TYPE = Symbol(
    "member-query-builder-type",
);

/**
 * Structured criteria for querying members
 */
export interface MemberQueryCriteria {
    // Pagination
    page?: number;
    pageSize?: number;

    // Filters
    name?: string;
    phoneNumber?: string;
    fellowshipId?: string;
    gender?: string;
    maritalStatus?: string;
    memberRole?: string;
    attendsFellowship?: boolean;
    isBaptized?: boolean;
    isConfirmed?: boolean;

    // Search
    search?: string;

    // Sorting
    sortBy?: string;
    sortDirection?: SortDirection;
}

/**
 * Query builder for Member queries with typed filter methods, eager loading,
 * and query criteria application.
 */
export class MemberQueryBuilder extends QueryBuilder {
    /**
     * Type tag to identify MemberQueryBuilder instances
     */
    [MEMBER_QUERY_BUILDER_TYPE] = true;

    /**
     * Determines if an object is an instance of MemberQueryBuilder.
     * @param obj - The object to check.
     * @returns `true` if the object is a MemberQueryBuilder, otherwise `false`.
     */
    static is(obj: any): obj is MemberQueryBuilder {
        return QueryBuilder.is(obj) && MEMBER_QUERY_BUILDER_TYPE in obj;
    }

    // === 📝 Filter Methods ===

    /**
     * Filters the query by a member's name (first, middle, or last).
     * @param name - The name to filter by.
     * @returns The current query builder instance.
     */
    filterByName(name: string): this {
        const namePattern = `%${name}%`;
        // Since we don't have a built-in orWhere in the base class,
        // we'll use multiple filter conditions
        this.whereLikeLower(`firstName`, namePattern);
        this.whereLikeLower(`middleName`, namePattern);
        this.whereLikeLower(`lastName`, namePattern);
        return this;
    }

    /**
     * Filters the query by a member's phone number.
     * @param phoneNumber - The phone number to filter by.
     * @returns The current query builder instance.
     */
    filterByPhoneNumber(phoneNumber: string): this {
        return this.where("phoneNumber:likeLower", `%${phoneNumber}%`);
    }

    /**
     * Filters the query by a fellowship ID.
     * @param fellowshipId - The fellowship ID to filter by.
     * @returns The current query builder instance.
     */
    filterByFellowshipId(fellowshipId: string): this {
        return this.where("fellowshipId", fellowshipId);
    }

    /**
     * Filters the query by gender.
     * @param gender - The gender to filter by.
     * @returns The current query builder instance.
     */
    filterByGender(gender: string): this {
        return this.where("gender", gender);
    }

    /**
     * Filters the query by marital status.
     * @param maritalStatus - The marital status to filter by.
     * @returns The current query builder instance.
     */
    filterByMaritalStatus(maritalStatus: string): this {
        return this.where("maritalStatus", maritalStatus);
    }

    /**
     * Filters the query by member role.
     * @param memberRole - The member role to filter by.
     * @returns The current query builder instance.
     */
    filterByMemberRole(memberRole: string): this {
        return this.where("memberRole", memberRole);
    }

    /**
     * Filters the query by fellowship attendance.
     * @param attendsFellowship - The fellowship attendance status to filter by.
     * @returns The current query builder instance.
     */
    filterByFellowshipAttendance(attendsFellowship: boolean): this {
        return this.where("attendsFellowship", attendsFellowship ? 1 : 0);
    }

    /**
     * Filters the query by baptism status.
     * @param isBaptized - The baptism status to filter by.
     * @returns The current query builder instance.
     */
    filterByBaptismStatus(isBaptized: boolean): this {
        return this.where("isBaptized", isBaptized ? 1 : 0);
    }

    /**
     * Filters the query by confirmation status.
     * @param isConfirmed - The confirmation status to filter by.
     * @returns The current query builder instance.
     */
    filterByConfirmationStatus(isConfirmed: boolean): this {
        return this.where("isConfirmed", isConfirmed ? 1 : 0);
    }

    /**
     * Filters the query by general search term across multiple fields.
     * @param searchTerm - The search term to filter by.
     * @returns The current query builder instance.
     */
    search(searchTerm: string): this {
        if (!searchTerm) return this;

        const pattern = `%${searchTerm}%`;
        // Apply multiple filters for each field
        this.whereLikeLower(`firstName`, pattern);
        this.whereLikeLower(`middleName`, pattern);
        this.whereLikeLower(`lastName`, pattern);
        this.whereLikeLower(`phoneNumber`, pattern);
        this.whereLikeLower(`email`, pattern);
        this.whereLikeLower(`envelopeNumber`, pattern);
        return this;
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
    applyCriteria(options: MemberQueryCriteria): this {
        if (options.name) {
            this.filterByName(options.name);
        }
        if (options.phoneNumber) {
            this.filterByPhoneNumber(options.phoneNumber);
        }
        if (options.fellowshipId) {
            this.filterByFellowshipId(options.fellowshipId);
        }
        if (options.gender) {
            this.filterByGender(options.gender);
        }
        if (options.maritalStatus) {
            this.filterByMaritalStatus(options.maritalStatus);
        }
        if (options.memberRole) {
            this.filterByMemberRole(options.memberRole);
        }
        if (options.attendsFellowship !== undefined) {
            this.filterByFellowshipAttendance(options.attendsFellowship);
        }
        if (options.isBaptized !== undefined) {
            this.filterByBaptismStatus(options.isBaptized);
        }
        if (options.isConfirmed !== undefined) {
            this.filterByConfirmationStatus(options.isConfirmed);
        }
        if (options.search) {
            this.search(options.search);
        }

        // Apply sorting
        if (options.sortBy) {
            this.orderBy(
                options.sortBy,
                options.sortDirection || SortDirection.ASC,
            );
        } else {
            // Default sort by last name
            this.orderBy("lastName", SortDirection.ASC);
        }

        // Apply pagination
        if (options.page && options.pageSize) {
            this.paginate(options.page, options.pageSize);
        }

        return this;
    }

    /**
     * Includes default relations for eager loading.
     * This ensures that related data is fetched automatically.
     * @returns The current query builder instance.
     */
    includeDefaultRelations(): this {
        return this.with("[dependants,fellowship,interests]");
    }

    // === 🏗️ Factory Methods ===

    /**
     * Creates a new instance of MemberQueryBuilder.
     * @returns A new instance of the query builder.
     */
    static newInstance(): MemberQueryBuilder {
        return new MemberQueryBuilder();
    }

    /**
     * Creates a new instance of MemberQueryBuilder and applies query criteria.
     * Automatically includes default relations.
     * @param options - The query criteria to apply.
     * @returns A configured instance of the query builder.
     */
    static createFromCriteria(
        options?: MemberQueryCriteria,
    ): MemberQueryBuilder {
        if (!options) {
            return MemberQueryBuilder.newInstance();
        }

        return MemberQueryBuilder.newInstance().applyCriteria(options);
    }

    /**
     * Creates a new MemberQueryBuilder from either query criteria or another builder.
     * If an existing builder is provided, it clones it.
     * @param options - Query criteria or an existing builder instance.
     * @returns A new instance of MemberQueryBuilder.
     */
    static createFromBuilderOrCriteria(
        options: MemberQueryCriteria | MemberQueryBuilder,
    ): MemberQueryBuilder {
        if (MemberQueryBuilder.is(options)) {
            return options.clone();
        }

        return MemberQueryBuilder.createFromCriteria(options);
    }

    /**
     * Shortcut method to create an instance from criteria or builder.
     * @param options - Optional criteria or builder to clone.
     * @returns A new instance of MemberQueryBuilder.
     */
    static from(
        options?: MemberQueryCriteria | MemberQueryBuilder,
    ): MemberQueryBuilder {
        if (!options) {
            return MemberQueryBuilder.newInstance();
        }

        return MemberQueryBuilder.createFromBuilderOrCriteria(options);
    }
}
