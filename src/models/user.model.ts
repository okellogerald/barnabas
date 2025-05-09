import type { Role } from "./role.model";
import type { Church } from "./church.model";
import { UserDTO } from "@/data/user";
import { modelFactory } from "@/factories";

/**
 * User model representing a system user
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

  role?: Role;
  church?: Church;
  permissions?: string[];

  constructor(dto: UserDTO) {
    this.id = dto.id;
    this.name = dto.name;
    this.email = dto.email;
    this.phoneNumber = dto.phoneNumber ?? null;
    this.churchId = dto.churchId;
    this.roleId = dto.roleId;
    this.isActive = Boolean(dto.isActive);
    this.isDeleted = Boolean(dto.isDeleted);
    this.createdAt = new Date(dto.createdAt);
    this.updatedAt = new Date(dto.updatedAt);

    const RoleClass = modelFactory.getModelClass("Role");
    const ChurchClass = modelFactory.getModelClass("Church");

    if (dto.role && RoleClass) {
      this.role = new RoleClass(dto.role);
    }

    if (dto.church && ChurchClass) {
      this.church = new ChurchClass(dto.church);
    }

    this.permissions = dto.permissions;
  }

  /**
   * Static factory method to create a User from a DTO.
   */
  static fromDTO(dto: UserDTO): User {
    return new User(dto);
  }

  /**
   * Converts the User model back to a UserDTO.
   */
  toDTO(): UserDTO {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phoneNumber: this.phoneNumber,
      churchId: this.churchId,
      roleId: this.roleId,
      isActive: this.isActive,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      role: this.role ? this.role.toDTO?.() ?? this.role : undefined,
      church: this.church ? this.church.toDTO?.() ?? this.church : undefined,
      permissions: this.permissions,
    };
  }

  /**
   * Static factory method to create a User from a JSON string.
   * @param jsonString JSON string representing a User
   */
  static fromJson(jsonString: string): User {
    const parsed = JSON.parse(jsonString);
    return User.fromDTO(parsed);
  }

  /**
   * Converts the User model to a JSON string.
   */
  toJson(): string {
    return JSON.stringify(this.toDTO());
  }

  get displayName(): string {
    return this.name || this.email;
  }

  get isMarkedDeleted(): boolean {
    return this.isDeleted;
  }

  hasPermission(permission: string): boolean {
    return this.permissions?.includes(permission) ?? false;
  }

  getRoleName(): string {
    return this.role?.name ?? "";
  }

  get isAdmin(): boolean {
    return this.role?.name.toLowerCase() === "admin";
  }

  getStatusText(): string {
    return this.isActive ? "Active" : "Inactive";
  }
}
