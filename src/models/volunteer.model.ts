import {
    CreateVolunteerOpportunityDTO,
    UpdateVolunteerOpportunityDTO,
    VolunteerOpportunityDTO,
} from "@/data/volunteer";

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

    constructor(dto: VolunteerOpportunityDTO) {
        this.id = dto.id;
        this.churchId = dto.churchId;
        this.name = dto.name;
        this.description = dto.description;
        this.createdAt = new Date(dto.createdAt);
        this.updatedAt = new Date(dto.updatedAt);
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
     * Factory method to create an Opportunity from a DTO
     */
    static fromDTO(dto: VolunteerOpportunityDTO): VolunteerOpportunity {
        return new VolunteerOpportunity(dto);
    }

    /**
     * Converts the model back to a DTO
     */
    toDTO(): VolunteerOpportunityDTO {
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
    toCreateDTO(): CreateVolunteerOpportunityDTO {
        return {
            name: this.name,
            description: this.description,
        };
    }

    /**
     * Converts to a DTO for updating
     */
    toUpdateDTO(): UpdateVolunteerOpportunityDTO {
        return {
            name: this.name,
            description: this.description,
        };
    }
}
