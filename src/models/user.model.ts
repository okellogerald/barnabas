import { RoleDTO } from "@/data/role";
import { Role } from "@/models/role.model";
import { UserDTO } from "../data/user/schema";

/**
 * User model representing a system user with enhanced functionality
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

  // Related entities
  role: Role | null;

  constructor(dto: UserDTO) {
    this.id = dto.id;
    this.name = dto.name;
    this.email = dto.email;
    this.phoneNumber = dto.phoneNumber;
    this.churchId = dto.churchId;
    this.roleId = dto.roleId;
    this.isActive = typeof dto.isActive === 'number' ? Boolean(dto.isActive) : dto.isActive;
    this.isDeleted = typeof dto.isDeleted === 'number' ? Boolean(dto.isDeleted) : dto.isDeleted;
    this.createdAt = new Date(dto.createdAt);
    this.updatedAt = new Date(dto.updatedAt);

    // Handle related entities
    this.role = dto.role ? Role.fromDTO(dto.role as unknown as RoleDTO) : null;
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
    return this.role?.getDisplayName() || "Unknown Role";
  }

  /**
   * Checks if the user is active and not deleted
   */
  isAvailable(): boolean {
    return this.isActive && !this.isDeleted;
  }

  /**
   * Gets user's status as a formatted string
   */
  getStatusText(): string {
    if (this.isDeleted) return "Deleted";
    return this.isActive ? "Active" : "Inactive";
  }

  /**
   * Gets a summary of contact information
   */
  getContactSummary(): string {
    const contacts = [];
    if (this.email) contacts.push(this.email);
    if (this.phoneNumber) contacts.push(this.phoneNumber);
    
    return contacts.length > 0 ? contacts.join(" | ") : "No contact information";
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
      isActive: typeof this.isActive === 'boolean' ? Boolean(this.isActive) : this.isActive,
      isDeleted: typeof this.isDeleted === 'boolean' ? Boolean(this.isDeleted) : this.isDeleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      role: this.role ? this.role.toDTO() : null,
    };
  }

  /**
   * Creates a User instance from JSON data
   */
  static fromJSON(json: string): User {
    try {
      const obj = JSON.parse(json);
      
      // Convert numeric boolean fields if needed
      if (typeof obj.isActive === "number") {
        obj.isActive = Boolean(obj.isActive);
      }
      if (typeof obj.isDeleted === "number") {
        obj.isDeleted = Boolean(obj.isDeleted);
      }
      
      return User.fromDTO(obj);
    } catch (error) {
      throw new Error(`Failed to parse User from JSON: ${
        error instanceof Error ? error.message : "Unknown error"
      }`);
    }
  }

  /**
   * Creates a JSON representation of the User
   */
  toJSON(): string {
    return JSON.stringify({
      ...this.toDTO(),
      // Ensure dates are serialized as ISO strings
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      // Store booleans as booleans in JSON
      isActive: this.isActive,
      isDeleted: this.isDeleted,
    });
  }
}