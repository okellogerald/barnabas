import { UserDTO } from "@/data/auth/schema";

/**
 * User model representing a system user
 *
 * This class provides an interface for working with user data,
 * including methods for displaying user information and checking properties.
 */
export class User {
    id: string;
    name: string;
    email: string;
    phoneNumber: string | null;
    churchId: string;
    roleId: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;

    // Additional properties that might come from API but aren't in base type
    role?: { id: string; name: string };

    constructor(dto: UserDTO) {
        this.id = dto.id;
        this.name = dto.name;
        this.email = dto.email;
        this.phoneNumber = dto.phoneNumber;
        this.churchId = dto.churchId;
        this.roleId = dto.roleId;
        this.isActive = Boolean(dto.isActive);
        this.isDeleted = Boolean(dto.isDeleted);
        this.createdAt = new Date(dto.createdAt);
        this.updatedAt = new Date(dto.updatedAt);

        // Handle related objects
        if ((dto as any).role) {
            this.role = (dto as any).role;
        }
    }

    /**
     * Gets the display name for the user
     */
    getDisplayName(): string {
        return this.name;
    }

    /**
     * Gets the role name if available, otherwise returns "Unknown Role"
     */
    getRoleName(): string {
        return this.role?.name || "Unknown Role";
    }

    /**
     * Checks if the user is active and not deleted
     */
    isAvailable(): boolean {
        return this.isActive && !this.isDeleted;
    }

    /**
     * Factory method to create a User from a DTO
     */
    static fromDTO(dto: UserDTO): User {
        return new User(dto);
    }

    /**
     * Converts the model back to a DTO
     */
    toDTO(): UserDTO {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            phoneNumber: this.phoneNumber,
            churchId: this.churchId,
            roleId: this.roleId,
            isActive: Number(this.isActive),
            isDeleted: Number(this.isDeleted),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    /**
     * Converts the User instance to a JSON string for storage
     * @returns {string} JSON string representation of the user
     */
    toJSON(): string {
        const obj = {
            ...this.toDTO(),
            // Ensure dates are serialized as ISO strings
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            // Include role if present
            role: this.role,
            // Store booleans as booleans in JSON (not numbers)
            isActive: this.isActive,
            isDeleted: this.isDeleted,
        };

        return JSON.stringify(obj);
    }

    /**
     * Creates a User instance from a JSON string
     * @param {string} json - JSON string representation of a user
     * @returns {User} User instance
     * @throws {Error} If the JSON string is invalid
     */
    static fromJSON(json: string): User {
        try {
            const obj = JSON.parse(json);

            // Convert any boolean fields stored as numbers
            if (typeof obj.isActive === "number") {
                obj.isActive = Boolean(obj.isActive);
            }

            if (typeof obj.isDeleted === "number") {
                obj.isDeleted = Boolean(obj.isDeleted);
            }

            // Create a User instance
            const user = new User({
                ...obj,
                // Ensure isActive and isDeleted are numbers in DTO
                isActive: typeof obj.isActive === "boolean"
                    ? Number(obj.isActive)
                    : obj.isActive,
                isDeleted: typeof obj.isDeleted === "boolean"
                    ? Number(obj.isDeleted)
                    : obj.isDeleted,
            });

            // Restore role property if it exists
            if (obj.role) {
                user.role = obj.role;
            }

            return user;
        } catch (error) {
            throw new Error(
                `Failed to parse User from JSON: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }
}
