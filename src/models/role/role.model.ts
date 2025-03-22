import { RoleDTO } from "@/data/role";

/**
 * Role model representing a user role
 */
export class Role {
    id: string;
    name: string;
    churchId: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;

    // Transient properties
    permissions?: string[];

    constructor(dto: RoleDTO) {
        this.id = dto.id;
        this.name = dto.name;
        this.churchId = dto.churchId;
        this.description = dto.description;
        this.createdAt = new Date(dto.createdAt);
        this.updatedAt = new Date(dto.updatedAt);

        // Handle permissions if present in the DTO
        if ((dto as any).permissions) {
            this.permissions = (dto as any).permissions;
        }
    }

    /**
     * Gets a formatted display name for the role
     */
    getDisplayName(): string {
        return this.name;
    }

    /**
     * Gets a description for display, with fallback
     */
    getDescription(): string {
        return this.description || "No description available";
    }

    /**
     * Checks if this role has a specific permission
     * @param permission Permission to check
     */
    hasPermission(permission: string): boolean {
        return this.permissions ? this.permissions.includes(permission) : false;
    }

    /**
     * Factory method to create a Role from a DTO
     */
    static fromDTO(dto: RoleDTO): Role {
        return new Role(dto);
    }

    /**
     * Converts the model back to a DTO
     */
    toDTO(): RoleDTO {
        return {
            id: this.id,
            name: this.name,
            churchId: this.churchId,
            description: this.description,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
