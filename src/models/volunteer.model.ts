import {
    CreateOpportunityDTO,
    OpportunityDTO,
    UpdateOpportunityDTO,
} from "@/data/volunteer";
import { modelFactory } from "./model.factory";

/**
 * Volunteer Opportunity model
 *
 * Represents a volunteer opportunity in the church
 */
export class VolunteerOpportunity {
    id: string;
    churchId: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;

    // Transient properties
    interestedMembers?: any[]; // Will be Member[] at runtime
    memberCount?: number;

    constructor(dto: OpportunityDTO) {
        this.id = dto.id;
        this.churchId = dto.churchId;
        this.name = dto.name;
        this.description = dto.description;
        this.createdAt = new Date(dto.createdAt);
        this.updatedAt = new Date(dto.updatedAt);

        // Handle related entities if present in the DTO
        if ((dto as any).interestedMembers) {
            this.interestedMembers = ((dto as any).interestedMembers).map(
                (member: any) => modelFactory.createMember(member)
            );
        }

        if ((dto as any).memberCount !== undefined) {
            this.memberCount = (dto as any).memberCount;
        }
    }

    /**
     * Gets a formatted display name for the opportunity
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
     * Gets a summary of the member interest count
     */
    getInterestSummary(): string {
        if (this.memberCount === undefined) {
            return "Unknown interest count";
        }

        return `${this.memberCount} interested member${
            this.memberCount !== 1 ? "s" : ""
        }`;
    }

    /**
     * Factory method to create an Opportunity from a DTO
     */
    static fromDTO(dto: OpportunityDTO): VolunteerOpportunity {
        return new VolunteerOpportunity(dto);
    }

    /**
     * Converts the model back to a DTO
     */
    toDTO(): OpportunityDTO {
        return {
            id: this.id,
            churchId: this.churchId,
            name: this.name,
            description: this.description,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    /**
     * Converts to a DTO for creation
     */
    toCreateDTO(): CreateOpportunityDTO {
        return {
            name: this.name,
            description: this.description,
        };
    }

    /**
     * Converts to a DTO for updating
     */
    toUpdateDTO(): UpdateOpportunityDTO {
        return {
            name: this.name,
            description: this.description,
        };
    }
}

// Register the VolunteerOpportunity class with the factory
modelFactory.register('VolunteerOpportunity', VolunteerOpportunity);