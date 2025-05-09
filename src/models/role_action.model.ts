import { RoleActionDTO } from "@/data/role-actions";

export class RoleAction {
  id: string;
  roleId: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(dto: RoleActionDTO) {
    this.id = dto.id;
    this.roleId = dto.roleId;
    this.action = dto.action;
    this.createdAt = new Date(dto.createdAt);
    this.updatedAt = new Date(dto.updatedAt);
  }

  static fromDTO(dto: RoleActionDTO): RoleAction {
    return new RoleAction(dto);
  }

  toDTO(): RoleActionDTO {
    return {
      id: this.id,
      roleId: this.roleId,
      action: this.action,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromJson(jsonString: string): RoleAction {
    return RoleAction.fromDTO(JSON.parse(jsonString));
  }

  toJson(): string {
    return JSON.stringify(this.toDTO());
  }
}