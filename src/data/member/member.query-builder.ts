import { QueryBuilder, SortDirection } from "@/lib/query";

// Symbol for member query builder type
export const MEMBER_QUERY_BUILDER_TYPE = Symbol("member-query-builder-type");

/**
 * Enhanced structured criteria for querying members with new filter options
 */
export interface MemberQueryCriteria {
  // Pagination
  page?: number;
  pageSize?: number;

  // Basic filters
  search?: string;
  firstName?: string;
  lastName?: string;
  fellowshipId?: string;

  // Personal information filters
  gender?: string;
  maritalStatus?: string;

  // Church-related filters
  memberRole?: string;
  fellowshipAbsenceReason?: string;

  // NEW FILTERS
  educationLevel?: string; // Education level filter
  profession?: string; // Profession search filter
  hasEnvelope?: boolean; // Whether member has envelope number

  // Status filters
  isBaptized?: boolean;
  isConfirmed?: boolean;
  partakesLordSupper?: boolean;
  attendsFellowship?: boolean;

  // Contact filters
  email?: string;
  phoneNumber?: string;

  // Date filters
  dateOfBirth?: Date;
  dateOfMarriage?: Date;

  // Location filters
  residenceArea?: string;
  placeOfBirth?: string;

  // Work/Education filters
  occupation?: string;
  placeOfWork?: string;
  formerChurch?: string;

  // Sorting
  sortBy?: string;
  sortDirection?: SortDirection;
}

/**
 * Enhanced Query builder for Member queries with typed filter methods, eager loading,
 * and query criteria application including new filter support.
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

  // === 📝 Basic Filter Methods ===

  /**
   * Filters the query by a general search term across multiple fields.
   * @param searchTerm - The search term to filter by.
   * @returns The current query builder instance.
   */
  filterBySearch(searchTerm: string): this {
    if (!searchTerm) return this;

    // Search across multiple fields
    return this.whereLike("firstName", searchTerm);
    //   .whereLike("lastName", searchTerm)
    //   .whereLike("email", searchTerm)
    //   .whereLike("phoneNumber", searchTerm);
  }

  /**
   * Filters the query by member first name.
   * @param firstName - The name to search for.
   * @returns The current query builder instance.
   */
  filterByFirstName(firstName: string): this {
    if (!firstName) return this;
    return this.whereLike("firstName", firstName);
  }

  /**
   * Filters the query by member last name.
   * @param lastName - The name to search for.
   * @returns The current query builder instance.
   */
  filterByLastName(lastName: string): this {
    if (!lastName) return this;
    return this.whereLike("lastName", lastName);
  }

  /**
   * Filters the query by fellowship ID.
   * @param fellowshipId - The fellowship ID to filter by.
   * @returns The current query builder instance.
   */
  filterByFellowship(fellowshipId: string): this {
    return this.where("fellowshipId", fellowshipId);
  }

  // === 👤 Personal Information Filters ===

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

  // === ⛪ Church-Related Filters ===

  /**
   * Filters the query by member role.
   * @param memberRole - The member role to filter by.
   * @returns The current query builder instance.
   */
  filterByMemberRole(memberRole: string): this {
    return this.where("memberRole", memberRole);
  }

  // === 🎓 NEW EDUCATION & PROFESSION FILTERS ===

  /**
   * Filters the query by education level.
   * @param educationLevel - The education level to filter by.
   * @returns The current query builder instance.
   */
  filterByEducationLevel(educationLevel: string): this {
    return this.where("educationLevel", educationLevel);
  }

  /**
   * Filters the query by profession (searches within profession field).
   * @param profession - The profession search term.
   * @returns The current query builder instance.
   */
  filterByProfession(profession: string): this {
    if (!profession) return this;
    return this.whereLike("profession", profession);
  }

  // === 💌 NEW ENVELOPE FILTER ===

  /**
   * Filters the query by envelope assignment status.
   * @param hasEnvelope - Whether the member should have an envelope number.
   * @returns The current query builder instance.
   */
  filterByEnvelopeStatus(hasEnvelope: boolean): this {
    if (hasEnvelope) {
      return this.whereNotNull("envelopeNumber");
    } else {
      return this.whereNull("envelopeNumber");
    }
  }

  // === ✅ Status Filters ===

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
   * Filters the query by Lord's Supper participation status.
   * @param partakesLordSupper - The participation status to filter by.
   * @returns The current query builder instance.
   */
  filterByLordSupperStatus(partakesLordSupper: boolean): this {
    return this.where("partakesLordSupper", partakesLordSupper ? 1 : 0);
  }

  /**
   * Filters the query by fellowship attendance status.
   * @param attendsFellowship - The attendance status to filter by.
   * @returns The current query builder instance.
   */
  filterByFellowshipAttendance(attendsFellowship: boolean): this {
    return this.where("attendsFellowship", attendsFellowship ? 1 : 0);
  }

  // === 📞 Contact Filters ===

  /**
   * Filters the query by email address.
   * @param email - The email to filter by.
   * @returns The current query builder instance.
   */
  filterByEmail(email: string): this {
    return this.whereLike("email", email);
  }

  /**
   * Filters the query by phone number.
   * @param phoneNumber - The phone number to filter by.
   * @returns The current query builder instance.
   */
  filterByPhoneNumber(phoneNumber: string): this {
    return this.whereLike("phoneNumber", phoneNumber);
  }

  // === 🏢 Work & Location Filters ===

  /**
   * Filters the query by occupation.
   * @param occupation - The occupation to filter by.
   * @returns The current query builder instance.
   */
  filterByOccupation(occupation: string): this {
    return this.whereLike("occupation", occupation);
  }

  /**
   * Filters the query by place of work.
   * @param placeOfWork - The workplace to filter by.
   * @returns The current query builder instance.
   */
  filterByPlaceOfWork(placeOfWork: string): this {
    return this.whereLike("placeOfWork", placeOfWork);
  }

  /**
   * Filters the query by residence area.
   * @param residenceArea - The residence area to filter by.
   * @returns The current query builder instance.
   */
  filterByResidenceArea(residenceArea: string): this {
    return this.whereLike("residenceArea", residenceArea);
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
   * Enhanced method to apply query criteria from the provided options.
   * Now includes support for education level, profession, and envelope status filters.
   * @param options - The query criteria to apply.
   * @returns The current query builder instance.
   */
  applyCriteria(options: MemberQueryCriteria): this {
    // Basic filters
    if (options.search) {
      this.filterBySearch(options.search);
    }
    if (options.firstName) {
      this.filterByFirstName(options.firstName);
    }
    if (options.lastName) {
      this.filterByLastName(options.lastName);
    }
    if (options.fellowshipId) {
      this.filterByFellowship(options.fellowshipId);
    }

    // Personal information
    if (options.gender) {
      this.filterByGender(options.gender);
    }
    if (options.maritalStatus) {
      this.filterByMaritalStatus(options.maritalStatus);
    }

    // Church-related
    if (options.memberRole) {
      this.filterByMemberRole(options.memberRole);
    }

    // NEW FILTERS - Education & Profession
    if (options.educationLevel) {
      this.filterByEducationLevel(options.educationLevel);
    }
    if (options.profession) {
      this.filterByProfession(options.profession);
    }

    // NEW FILTER - Envelope Status
    if (options.hasEnvelope !== undefined) {
      this.filterByEnvelopeStatus(options.hasEnvelope);
    }

    // Status filters
    if (options.isBaptized !== undefined) {
      this.filterByBaptismStatus(options.isBaptized);
    }
    if (options.isConfirmed !== undefined) {
      this.filterByConfirmationStatus(options.isConfirmed);
    }
    if (options.partakesLordSupper !== undefined) {
      this.filterByLordSupperStatus(options.partakesLordSupper);
    }
    if (options.attendsFellowship !== undefined) {
      this.filterByFellowshipAttendance(options.attendsFellowship);
    }

    // Contact filters
    if (options.email) {
      this.filterByEmail(options.email);
    }
    if (options.phoneNumber) {
      this.filterByPhoneNumber(options.phoneNumber);
    }

    // Work & location filters
    if (options.occupation) {
      this.filterByOccupation(options.occupation);
    }
    if (options.placeOfWork) {
      this.filterByPlaceOfWork(options.placeOfWork);
    }
    if (options.residenceArea) {
      this.filterByResidenceArea(options.residenceArea);
    }

    // Sorting
    if (options.sortBy) {
      this.orderBy(options.sortBy, options.sortDirection || SortDirection.ASC);
    } else {
      // Default sorting
      this.orderBy("lastName", SortDirection.ASC);
    }

    // Pagination
    if (options.page && options.pageSize) {
      this.paginate(options.page, options.pageSize);
    }

    return this;
  }

  /**
   * Includes default relations for eager loading.
   * This ensures that related data (fellowship, dependants, interests) is fetched automatically.
   * @returns The current query builder instance.
   */
  includeDefaultRelations(): this {
    return this.with(["fellowship", "dependants", "interests"]);
  }

  // === 🏗️ Enhanced Factory Methods ===

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
  static createFromCriteria(options?: MemberQueryCriteria): MemberQueryBuilder {
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
  static createFromBuilderOrCriteria(options: MemberQueryCriteria | MemberQueryBuilder): MemberQueryBuilder {
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
  static from(options?: MemberQueryCriteria | MemberQueryBuilder): MemberQueryBuilder {
    if (!options) {
      return MemberQueryBuilder.newInstance();
    }

    return MemberQueryBuilder.createFromBuilderOrCriteria(options);
  }
}
