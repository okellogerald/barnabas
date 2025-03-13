/**
 * Represents the gender options for church members.
 */
export enum Gender {
    /** Male gender */
    Male = "Male",
    /** Female gender */
    Female = "Female",
}

/**
 * Represents the marital status options for church members.
 */
export enum MaritalStatus {
    /** Member who has never been married */
    Single = "Single",
    /** Member who is currently married */
    Married = "Married",
    /** Member who is married but living apart from spouse */
    Separated = "Separated",
    /** Member who was previously married but is legally divorced */
    Divorced = "Divorced",
}

/**
 * Represents the type of marriage for married church members.
 */
export enum MarriageType {
    /** Marriage performed under Christian rites */
    Christian = "Christian",
    /** Marriage performed under non-Christian rites */
    NonChristian = "Non-Christian",
}

/**
 * Represents the education level options for church members.
 */
export enum EducationLevel {
    /** No formal education */
    Informal = "Informal",
    /** Primary/elementary education */
    Primary = "Primary",
    /** Secondary/high school education */
    Secondary = "Secondary",
    /** Certificate level education (post-secondary) */
    Certificate = "Certificate",
    /** Diploma level education (post-secondary) */
    Diploma = "Diploma",
    /** Bachelor's degree */
    Bachelors = "Bachelors",
    /** Master's degree */
    Masters = "Masters",
    /** Doctoral degree */
    Doctorate = "Doctorate",
    /** Other education level not listed */
    Other = "Other",
}

/**
 * Represents the role of the member within the church organization.
 */
export enum MemberRole {
    /** Ordained minister or pastor */
    Clergy = "Clergy",
    /** Paid employee of the church */
    Staff = "Staff",
    /** Regular attending member without formal leadership role */
    Regular = "Regular",
    /** Member with leadership responsibilities */
    Leader = "Leader",
    /** Member who regularly volunteers for church activities */
    Volunteer = "Volunteer",
}

/**
 * Represents the relationship types for dependants of church members.
 */
export enum DependantRelationship {
    /** Son or daughter of the member */
    Child = "Child",
    /** Person employed to help with household work */
    HouseHelper = "House Helper",
    /** General term for a person related to the member */
    Relative = "Relative",
    /** Father or mother of the member */
    Parent = "Parent",
    /** Brother or sister of the member */
    Sibling = "Sibling",
    /** Child of the member's child */
    Grandchild = "Grandchild",
    /** Parent of the member's parent */
    Grandparent = "Grandparent",
    /** Child of the member's sibling */
    NieceNephew = "Niece/Nephew",
    /** Person legally responsible for the care of another */
    Guardian = "Guardian",
    /** Person under the care of a guardian */
    Ward = "Ward",
    /** Husband or wife of the member */
    Spouse = "Spouse",
    /** Relative by marriage */
    InLaw = "In-Law",
    /** Member of the extended family */
    ExtendedFamily = "Extended Family",
    /** Relationship not covered by other categories */
    Other = "Other",
}
