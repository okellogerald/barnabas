import {
    DependantRelationship,
    EducationLevel,
    Gender,
    MaritalStatus,
    MarriageType,
    MemberRole,
} from "@/constants";
import axios, { AxiosError } from "axios";

/**
 * Church Membership Management System - Sample Data Generator
 * This script creates sample data for the Church Membership Management System by making API calls.
 *
 * Requirements:
 * - Node.js installed
 * - Axios library (npm install axios)
 * - TypeScript (npm install typescript ts-node @types/node)
 *
 * Usage:
 * ts-node sample-data-generator.ts
 */

// API base URL - change this to match your local API
const API_BASE_URL = "http://localhost:3045";
let authToken =
    "0ea74e2458639515db3614fc389774e0668b2858908e4298b89f69484159b1e9";
let churchId = "a1c01b9947d74962be25314a2981ef4d";

/**
 * Helper function to extract the error message from different error types
 */
function getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
        return error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}

/**
 * Generates a random date within a range
 */
function randomDate(start: Date, end: Date): Date {
    return new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime()),
    );
}

/**
 * Formats a date in YYYY-MM-DD format
 */
function formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
}

/**
 * Sample data generator for Church Membership Management System
 */
export class ChurchApiClient {
    // Store IDs of created resources
    private roles: { id: string; name: string }[] = [];
    private users: { id: string; name: string; email: string }[] = [];
    private members: {
        id: string;
        firstName: string;
        lastName: string;
        gender: string;
        fellowshipId: string;
    }[] = [];
    private fellowships: { id: string; name: string }[] = [];
    private opportunities: { id: string; name: string }[] = [];

    /**
     * Initialize the API client with authentication
     */
    async initialize() {
        try {
            // Login as admin
            const loginResponse = await axios.post(
                `${API_BASE_URL}/auth/login`,
                {
                    username: "admin@mychurch.com",
                    password: "guest",
                },
            );

            authToken = loginResponse.data.token;
            churchId = loginResponse.data.user.churchId;

            console.log("Successfully authenticated with the API");
            console.log(`Church ID: ${churchId}`);

            // Set default auth header for subsequent requests
            axios.defaults.headers.common["Authorization"] =
                `Bearer ${authToken}`;

            // Generate all sample data
            await this.generateSampleData();
        } catch (error: unknown) {
            console.error(
                "Failed to authenticate:",
                getErrorMessage(error),
            );
            console.log(
                "Please ensure the API server is running and the admin user exists.",
            );
            process.exit(1);
        }
    }

    /**
     * Main method to generate all sample data
     */
    async generateSampleData() {
        try {
            console.log("\n=== Generating Sample Data ===");

            // Generate in the correct sequence to maintain dependencies
            await this.generateRoles();
            await this.generateUsers();
            await this.generateOpportunities();
            await this.generateFellowships(); // Create fellowships before members
            await this.generateMembers(); // Now members can be created with fellowships assigned
            await this.assignLeadersToFellowships(); // Update fellowship leaders after members exist

            console.log("\n=== Sample Data Generation Complete ===");
            console.log(`Roles created: ${this.roles.length}`);
            console.log(`Users created: ${this.users.length}`);
            console.log(
                `Volunteer opportunities created: ${this.opportunities.length}`,
            );
            console.log(`Fellowships created: ${this.fellowships.length}`);
            console.log(`Members created: ${this.members.length}`);
        } catch (error: unknown) {
            console.error(
                "Error generating sample data:",
                getErrorMessage(error),
            );
        }
    }

    /**
     * Creates sample roles
     */
    async generateRoles() {
        console.log("\nCreating roles...");

        const rolesToCreate = [
            {
                name: "Moderator",
                description: "Can manage members and fellowships",
            },
            {
                name: "Viewer",
                description: "Read-only access to system data",
            },
        ];

        // Get existing roles first to avoid duplicates
        try {
            const existingRoles = await axios.get(`${API_BASE_URL}/role`);
            this.roles = existingRoles.data.data || [];
            console.log(`Found ${this.roles.length} existing roles`);

            // Create new roles if they don't exist
            for (const role of rolesToCreate) {
                if (!this.roles.some((r) => r.name === role.name)) {
                    const response = await axios.post(
                        `${API_BASE_URL}/role`,
                        role,
                    );
                    this.roles.push(response.data);
                    console.log(`Created role: ${role.name}`);
                } else {
                    console.log(`Role already exists: ${role.name}`);
                }
            }
        } catch (error: unknown) {
            console.error(
                "Error creating roles:",
                getErrorMessage(error),
            );
        }
    }

    /**
     * Creates sample users
     */
    async generateUsers() {
        console.log("\nCreating users...");

        // Find role IDs
        const adminRole = this.roles.find((role) => role.name === "Admin");
        const moderatorRole = this.roles.find((role) =>
            role.name === "Moderator"
        );
        const viewerRole = this.roles.find((role) => role.name === "Viewer");

        if (!adminRole || !moderatorRole || !viewerRole) {
            console.warn(
                "Warning: Not all required roles were found. Some users may not be created.",
            );
        }

        const usersToCreate = [
            {
                name: "John Smith",
                email: "john.smith@mychurch.com",
                password: "password123",
                phoneNumber: "255712345678",
                roleId: moderatorRole?.id,
            },
            {
                name: "Mary Johnson",
                email: "mary.johnson@mychurch.com",
                password: "password123",
                phoneNumber: "255787654321",
                roleId: moderatorRole?.id,
            },
            {
                name: "Robert Brown",
                email: "robert.brown@mychurch.com",
                password: "password123",
                phoneNumber: "255723456789",
                roleId: viewerRole?.id,
            },
            {
                name: "Sarah Davis",
                email: "sarah.davis@mychurch.com",
                password: "password123",
                phoneNumber: "255798765432",
                roleId: viewerRole?.id,
            },
        ];

        try {
            // Get existing users to avoid duplicates
            const existingUsers = await axios.get(`${API_BASE_URL}/user`);
            this.users = existingUsers.data || [];
            console.log(`Found ${this.users.length} existing users`);

            // Create new users if they don't exist
            for (const user of usersToCreate) {
                if (!this.users.some((u) => u.email === user.email)) {
                    const response = await axios.post(
                        `${API_BASE_URL}/user`,
                        user,
                    );
                    this.users.push(response.data);
                    console.log(`Created user: ${user.name} (${user.email})`);
                } else {
                    console.log(`User already exists: ${user.email}`);
                }
            }
        } catch (error: unknown) {
            console.error(
                "Error creating users:",
                getErrorMessage(error),
            );
        }
    }

    /**
     * Creates sample volunteer opportunities
     */
    async generateOpportunities() {
        console.log("\nCreating volunteer opportunities...");

        const opportunitiesToCreate = [
            {
                name: "Main Choir",
                description:
                    "Sing in the main church choir during Sunday services and special events",
            },
            {
                name: "Sunday School Teacher",
                description: "Teach children during Sunday School sessions",
            },
            {
                name: "Usher",
                description:
                    "Help with seating, offering collection, and maintaining order during services",
            },
            {
                name: "Youth Leader",
                description: "Organize and lead activities for the youth group",
            },
            {
                name: "Worship Team",
                description:
                    "Play musical instruments and lead worship during services",
            },
            {
                name: "Outreach Team",
                description:
                    "Participate in community outreach and evangelism activities",
            },
            {
                name: "Hospitality Team",
                description:
                    "Prepare refreshments and welcome visitors after services",
            },
        ];

        try {
            // Get existing opportunities to avoid duplicates
            const existingOpportunities = await axios.get(
                `${API_BASE_URL}/opportunity`,
            );
            this.opportunities = existingOpportunities.data || [];
            console.log(
                `Found ${this.opportunities.length} existing volunteer opportunities`,
            );

            // Create new opportunities if they don't exist
            for (const opportunity of opportunitiesToCreate) {
                if (
                    !this.opportunities.some((o) => o.name === opportunity.name)
                ) {
                    const response = await axios.post(
                        `${API_BASE_URL}/opportunity`,
                        opportunity,
                    );
                    this.opportunities.push(response.data);
                    console.log(
                        `Created volunteer opportunity: ${opportunity.name}`,
                    );
                } else {
                    console.log(
                        `Volunteer opportunity already exists: ${opportunity.name}`,
                    );
                }
            }
        } catch (error: unknown) {
            console.error(
                "Error creating volunteer opportunities:",
                getErrorMessage(error),
            );
        }
    }

    /**
     * Creates sample fellowships
     */
    async generateFellowships() {
        console.log("\nCreating fellowships...");

        const fellowshipNames = [
            "Bethany",
            "Tumaini",
            "Grace",
            "Faith",
            "Hope",
            "Cornerstone",
            "Emmanuel",
        ];

        try {
            // Get existing fellowships to avoid duplicates
            const existingFellowships = await axios.get(
                `${API_BASE_URL}/fellowship`,
            );
            this.fellowships = existingFellowships.data || [];
            console.log(
                `Found ${this.fellowships.length} existing fellowships`,
            );

            // Create new fellowships if they don't exist
            for (const name of fellowshipNames) {
                if (!this.fellowships.some((f) => f.name === name)) {
                    const fellowshipData = {
                        name,
                        notes: `${name} fellowship group`,
                    };

                    const response = await axios.post(
                        `${API_BASE_URL}/fellowship`,
                        fellowshipData,
                    );
                    this.fellowships.push(response.data);
                    console.log(`Created fellowship: ${name}`);
                } else {
                    console.log(`Fellowship already exists: ${name}`);
                }
            }
        } catch (error: unknown) {
            console.error(
                "Error creating fellowships:",
                getErrorMessage(error),
            );
        }
    }

    /**
     * Creates sample members with dependants and volunteer interests
     * Now includes fellowship assignment during creation
     */
    async generateMembers() {
        console.log("\nCreating members...");

        if (this.fellowships.length === 0) {
            console.error(
                "Cannot create members: No fellowships available. Please create fellowships first.",
            );
            return;
        }

        // Sample names for realistic data
        const firstNames = [
            "John",
            "Mary",
            "Robert",
            "Sarah",
            "Michael",
            "Jennifer",
            "David",
            "Linda",
            "James",
            "Patricia",
            "Richard",
            "Elizabeth",
            "Thomas",
            "Susan",
            "Charles",
            "Jessica",
            "Daniel",
            "Karen",
            "Matthew",
            "Nancy",
        ];
        const middleNames = [
            "Lee",
            "Ann",
            "James",
            "Marie",
            "Joseph",
            "Lynn",
            "Ray",
            "Grace",
            "Edward",
            "Joy",
            "William",
            "Faith",
            "Michael",
            "Hope",
            "Thomas",
            "Ruth",
            "Paul",
            "Jane",
            "Peter",
            "Rose",
        ];
        const lastNames = [
            "Smith",
            "Johnson",
            "Williams",
            "Brown",
            "Jones",
            "Miller",
            "Davis",
            "Wilson",
            "Taylor",
            "Clark",
            "Lewis",
            "Young",
            "Harris",
            "Allen",
            "King",
            "Wright",
            "Hill",
            "Scott",
            "Green",
            "Adams",
        ];

        try {
            // Get existing members to avoid creating too many
            const existingMembers = await axios.get(`${API_BASE_URL}/member`);
            this.members = existingMembers.data || [];
            console.log(`Found ${this.members.length} existing members`);

            // Only create more members if we have fewer than 20
            const membersToCreate = Math.max(0, 20 - this.members.length);
            console.log(`Creating ${membersToCreate} additional members...`);

            // Generate and create members
            for (let i = 0; i < membersToCreate; i++) {
                const firstName =
                    firstNames[Math.floor(Math.random() * firstNames.length)];
                const middleName = Math.random() > 0.3
                    ? middleNames[
                        Math.floor(Math.random() * middleNames.length)
                    ]
                    : null;
                const lastName =
                    lastNames[Math.floor(Math.random() * lastNames.length)];
                const gender = Math.random() > 0.5
                    ? Gender.Male
                    : Gender.Female;

                // Randomize marital status with distribution
                let maritalStatus: MaritalStatus;
                let marriageType: MarriageType = MarriageType.None;
                let dateOfMarriage: string | null = null;
                let spouseName: string | null = null;
                let placeOfMarriage: string | null = null;
                let spousePhoneNumber: string | null = null;

                const statusRandom = Math.random();
                if (statusRandom < 0.6) {
                    maritalStatus = MaritalStatus.Married;
                    marriageType = Math.random() > 0.8
                        ? MarriageType.NonChristian
                        : MarriageType.Christian;
                    dateOfMarriage = formatDate(
                        randomDate(new Date(1990, 0, 1), new Date(2024, 0, 1)),
                    );
                    spouseName = `${
                        firstNames[
                            Math.floor(Math.random() * firstNames.length)
                        ]
                    } ${
                        lastNames[
                            Math.floor(Math.random() * lastNames.length)
                        ]
                    }`;
                    placeOfMarriage = [
                        "Dar es Salaam",
                        "Arusha",
                        "Mwanza",
                        "Dodoma",
                        "Zanzibar",
                    ][Math.floor(Math.random() * 5)];
                    spousePhoneNumber = `255${Math.floor(Math.random() * 10)}${
                        Math.floor(Math.random() * 10000000) + 10000000
                    }`;
                } else if (statusRandom < 0.9) {
                    maritalStatus = MaritalStatus.Single;
                } else if (statusRandom < 0.95) {
                    maritalStatus = MaritalStatus.Divorced;
                } else {
                    maritalStatus = MaritalStatus.Separated;
                }

                // Generate a birthdate between 18 and 80 years ago
                const birthYear = new Date().getFullYear() -
                    Math.floor(Math.random() * 62) - 18;
                const birthMonth = Math.floor(Math.random() * 12);
                const birthDay = Math.floor(Math.random() * 28) + 1;
                const dateOfBirth = formatDate(
                    new Date(birthYear, birthMonth, birthDay),
                );

                // Random education level with weighted distribution
                const educationLevels = [
                    EducationLevel.Primary,
                    EducationLevel.Secondary,
                    EducationLevel.Certificate,
                    EducationLevel.Diploma,
                    EducationLevel.Bachelors,
                    EducationLevel.Masters,
                    EducationLevel.Doctorate,
                    EducationLevel.Informal,
                    EducationLevel.Other,
                ];
                const educationWeights = [
                    0.15,
                    0.25,
                    0.1,
                    0.15,
                    0.2,
                    0.1,
                    0.02,
                    0.02,
                    0.01,
                ];

                let educationIndex = 0;
                const eduRandom = Math.random();
                let eduSum = 0;

                for (let j = 0; j < educationWeights.length; j++) {
                    eduSum += educationWeights[j];
                    if (eduRandom <= eduSum) {
                        educationIndex = j;
                        break;
                    }
                }

                const educationLevel = educationLevels[educationIndex];

                // Random member role with weighted distribution
                const roleRandom = Math.random();
                let memberRole: MemberRole;

                if (roleRandom < 0.7) {
                    memberRole = MemberRole.Regular;
                } else if (roleRandom < 0.85) {
                    memberRole = MemberRole.Volunteer;
                } else if (roleRandom < 0.95) {
                    memberRole = MemberRole.Leader;
                } else if (roleRandom < 0.98) {
                    memberRole = MemberRole.Staff;
                } else {
                    memberRole = MemberRole.Clergy;
                }

                // Generate dependants with probability
                const dependants = [];
                if (
                    maritalStatus === MaritalStatus.Married &&
                    Math.random() < 0.8
                ) {
                    // Number of children (0-3)
                    const numChildren = Math.floor(Math.random() * 4);

                    for (let c = 0; c < numChildren; c++) {
                        const childFirstName = firstNames[
                            Math.floor(Math.random() * firstNames.length)
                        ];
                        // Calculate child age between 1-20 years
                        const childAge = Math.floor(Math.random() * 20) + 1;
                        const childBirthDate = new Date();
                        childBirthDate.setFullYear(
                            childBirthDate.getFullYear() - childAge,
                        );

                        dependants.push({
                            firstName: childFirstName,
                            lastName, // Same as parent
                            dateOfBirth: formatDate(childBirthDate),
                            relationship: DependantRelationship.Child,
                        });
                    }
                }

                // Random residence info
                const residenceAreas = [
                    "Mikocheni",
                    "Mbezi",
                    "Kinondoni",
                    "Mwenge",
                    "Msasani",
                    "Kijitonyama",
                    "Sinza",
                    "Mwananyamala",
                    "Tegeta",
                    "Boko",
                ];
                const residenceArea = residenceAreas[
                    Math.floor(Math.random() * residenceAreas.length)
                ];
                const residenceNumber = `Block ${
                    Math.floor(Math.random() * 20) + 1
                }, House ${Math.floor(Math.random() * 100) + 1}`;
                const residenceBlock = `${residenceArea} ${
                    String.fromCharCode(65 + Math.floor(Math.random() * 26))
                }`;
                const postalBox = `P.O. Box ${
                    10000 + Math.floor(Math.random() * 90000)
                }`;

                // Random volunteer interests (0-3)
                const numInterests = Math.floor(Math.random() * 4);
                const shuffledOpportunities = [...this.opportunities].sort(() =>
                    Math.random() - 0.5
                );
                const interests = shuffledOpportunities.slice(0, numInterests)
                    .map((o) => o.id);

                // Assign to a fellowship (required)
                const fellowshipIndex = Math.floor(
                    Math.random() * this.fellowships.length,
                );
                const fellowshipId = this.fellowships[fellowshipIndex].id;
                const attendsFellowship = Math.random() > 0.2;

                // Fellowship absence reason if needed
                let fellowshipAbsenceReason = null;
                if (!attendsFellowship) {
                    const reasons = [
                        "Health Issues",
                        "Work Commitments",
                        "Travel",
                        "Family Responsibilities",
                        "School Commitments",
                        "Personal Reasons",
                        "Lack of Transport",
                        "Other",
                    ];
                    fellowshipAbsenceReason =
                        reasons[Math.floor(Math.random() * reasons.length)];
                }

                // Create the member object
                const memberData = {
                    envelopeNumber: (1000 + this.members.length + i).toString(),
                    firstName,
                    middleName,
                    lastName,
                    gender,
                    dateOfBirth,
                    placeOfBirth: [
                        "Dar es Salaam",
                        "Arusha",
                        "Mwanza",
                        "Dodoma",
                        "Mbeya",
                        "Tanga",
                        "Zanzibar",
                        "Morogoro",
                    ][Math.floor(Math.random() * 8)],
                    profilePhoto: null, // No profile photos for sample data
                    maritalStatus,
                    marriageType,
                    dateOfMarriage,
                    spouseName,
                    placeOfMarriage,
                    phoneNumber: `255${Math.floor(Math.random() * 10)}${
                        Math.floor(Math.random() * 10000000) + 10000000
                    }`,
                    email: Math.random() > 0.4
                        ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`
                        : null,
                    spousePhoneNumber,
                    residenceNumber,
                    residenceBlock,
                    postalBox,
                    residenceArea,
                    formerChurch: Math.random() > 0.7
                        ? [
                            "Grace Community Church",
                            "Faith Baptist Church",
                            "St. Mary's Cathedral",
                            "Victory Chapel",
                            "Cornerstone Fellowship",
                        ][Math.floor(Math.random() * 5)]
                        : null,
                    occupation: Math.random() > 0.2
                        ? [
                            "Teacher",
                            "Engineer",
                            "Doctor",
                            "Nurse",
                            "Accountant",
                            "Business Owner",
                            "Lawyer",
                            "Pastor",
                            "Driver",
                            "Farmer",
                            "Consultant",
                            "Student",
                            "Retired",
                            "Government Employee",
                        ][Math.floor(Math.random() * 14)]
                        : null,
                    placeOfWork: Math.random() > 0.3
                        ? [
                            "ABC Company",
                            "Ministry of Education",
                            "National Hospital",
                            "Self-employed",
                            "University",
                            "Tech Solutions Ltd",
                            "Government",
                            "XYZ Corporation",
                        ][Math.floor(Math.random() * 8)]
                        : null,
                    educationLevel,
                    profession: Math.random() > 0.2
                        ? [
                            "Education",
                            "Health",
                            "Engineering",
                            "Business",
                            "Legal",
                            "Clergy",
                            "Agriculture",
                            "Security",
                            "Skilled Trade",
                            "Other",
                        ][Math.floor(Math.random() * 10)]
                        : null,
                    memberRole,
                    isBaptized: Math.random() > 0.2,
                    isConfirmed: Math.random() > 0.3,
                    partakesLordSupper: Math.random() > 0.1,
                    fellowshipId, // Assign fellowship ID during creation
                    nearestMemberName: `${
                        firstNames[
                            Math.floor(Math.random() * firstNames.length)
                        ]
                    } ${
                        lastNames[
                            Math.floor(Math.random() * lastNames.length)
                        ]
                    }`,
                    nearestMemberPhone: `255${Math.floor(Math.random() * 10)}${
                        Math.floor(Math.random() * 10000000) + 10000000
                    }`,
                    attendsFellowship,
                    fellowshipAbsenceReason,
                    dependants,
                    interests,
                };

                // Create the member
                const response = await axios.post(
                    `${API_BASE_URL}/member`,
                    memberData,
                );
                console.log(
                    `Created member: ${firstName} ${lastName} in fellowship: ${
                        this.fellowships[fellowshipIndex].name
                    }`,
                );

                // Add to members array with fellowship info
                this.members.push({
                    ...response.data,
                    fellowshipId,
                });
            }
        } catch (error: unknown) {
            console.error(
                "Error creating members:",
                getErrorMessage(error),
            );
        }
    }

    /**
     * Assigns leaders to fellowships
     */
    async assignLeadersToFellowships() {
        if (this.fellowships.length === 0 || this.members.length === 0) {
            console.log("No fellowships or members to assign leadership roles");
            return;
        }

        console.log("\nAssigning leadership roles to fellowships...");

        // Filter members by fellowship and leadership potential
        const membersByFellowship: Record<string, any[]> = {};

        // Group members by fellowship
        for (const member of this.members) {
            if (member.fellowshipId) {
                if (!membersByFellowship[member.fellowshipId]) {
                    membersByFellowship[member.fellowshipId] = [];
                }
                membersByFellowship[member.fellowshipId].push(member);
            }
        }

        // Assign leaders to each fellowship
        for (const fellowship of this.fellowships) {
            const fellowshipMembers = membersByFellowship[fellowship.id] || [];

            if (fellowshipMembers.length >= 3) { // Need at least 3 members to fill required roles
                // Shuffle members to randomly assign roles
                const shuffledMembers = [...fellowshipMembers].sort(() =>
                    Math.random() - 0.5
                );

                try {
                    // Assign chairman, secretary, and treasurer (and optional deputy chairman)
                    const updateData = {
                        name: fellowship.name,
                       // notes: fellowship.notes,
                        chairmanId: shuffledMembers[0]?.id,
                        secretaryId: shuffledMembers[1]?.id,
                        treasurerId: shuffledMembers[2]?.id,
                        deputyChairmanId:
                            shuffledMembers.length > 3 && Math.random() > 0.4
                                ? shuffledMembers[3]?.id
                                : null,
                    };

                    await axios.patch(
                        `${API_BASE_URL}/fellowship/${fellowship.id}`,
                        updateData,
                    );

                    console.log(
                        `Updated fellowship ${fellowship.name} with leadership roles:`,
                    );
                    console.log(
                        `  - Chairman: ${shuffledMembers[0]?.firstName} ${
                            shuffledMembers[0]?.lastName
                        }`,
                    );
                    console.log(
                        `  - Secretary: ${shuffledMembers[1]?.firstName} ${
                            shuffledMembers[1]?.lastName
                        }`,
                    );
                    console.log(
                        `  - Treasurer: ${shuffledMembers[2]?.firstName} ${
                            shuffledMembers[2]?.lastName
                        }`,
                    );
                    if (updateData.deputyChairmanId) {
                        console.log(
                            `  - Deputy Chairman: ${
                                shuffledMembers[3]?.firstName
                            } ${shuffledMembers[3]?.lastName}`,
                        );
                    }
                } catch (error: unknown) {
                    console.error(
                        `Error updating fellowship ${fellowship.id} with leaders:`,
                        getErrorMessage(error),
                    );
                }
            } else {
                console.log(
                    `Not enough members in fellowship ${fellowship.name} to assign leaders (needs at least 3 members)`,
                );
            }
        }
    }
}
