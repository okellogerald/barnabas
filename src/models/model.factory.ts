import type { FellowshipDTO } from "@/data/fellowship";
import type { MemberDTO } from "@/data/member";
import type { RoleDTO } from "@/data/role";
import { RoleActionDTO } from "@/data/role-actions";
import { UserDTO } from "@/data/user";
import type { OpportunityDTO } from "@/data/volunteer";

/**
 * Factory singleton class to handle model instantiation and resolve circular dependencies
 */
export class ModelFactory {
  private static _instance: ModelFactory;
  private _modelClasses: Record<string, any> = {};

  private constructor() {}

  /**
   * Gets the singleton instance of ModelFactory
   */
  public static get instance(): ModelFactory {
    if (!ModelFactory._instance) {
      ModelFactory._instance = new ModelFactory();
    }
    return ModelFactory._instance;
  }

  /**
   * Register a model class with the factory
   */
  public register(modelName: string, modelClass: any): void {
    this._modelClasses[modelName] = modelClass;
  }

  /**
   * Get a model class from the factory
   */
  public getModelClass(modelName: string): any {
    return this._modelClasses[modelName];
  }

  /**
   * Create a Member instance from DTO
   */
  public createMember(dto: MemberDTO): any {
    const MemberClass = this.getModelClass("Member");
    if (!MemberClass) return null;
    return MemberClass.fromDTO(dto);
  }

  /**
   * Create a Fellowship instance from DTO
   */
  public createFellowship(dto: FellowshipDTO): any {
    const FellowshipClass = this.getModelClass("Fellowship");
    if (!FellowshipClass) return null;
    return FellowshipClass.fromDTO(dto);
  }

  /**
   * Create a User instance from DTO
   */
  public createUser(dto: UserDTO): any {
    const UserClass = this.getModelClass("User");
    if (!UserClass) return null;
    return UserClass.fromDTO(dto);
  }

  /**
   * Create a Role instance from DTO
   */
  public createRole(dto: RoleDTO): any {
    const RoleClass = this.getModelClass("Role");
    if (!RoleClass) return null;
    return RoleClass.fromDTO(dto);
  }

  /**
   * Create a Role instance from DTO
   */
  public createRoleAction(dto: RoleActionDTO): any {
    const RoleActionClass = this.getModelClass("RoleAction");
    if (!RoleActionClass) return null;
    return RoleActionClass.fromDTO(dto);
  }

  /**
   * Create a VolunteerOpportunity instance from DTO
   */
  public createVolunteerOpportunity(dto: OpportunityDTO): any {
    const OpportunityClass = this.getModelClass("VolunteerOpportunity");
    if (!OpportunityClass) return null;
    return OpportunityClass.fromDTO(dto);
  }
}

// Export the singleton instance
export const modelFactory = ModelFactory.instance;
