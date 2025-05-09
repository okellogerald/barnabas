import { InterestDTO } from "@/data/interest";
import { modelFactory } from "../factories";

/**
 * Interest model representing a member's volunteer interest
 */
export class Interest {
    id: string;
    churchId: string;
    memberId: string;
    opportunityId: string;
    createdAt: Date;
    updatedAt: Date;

    // Transient properties for related entities
    member?: any; // Will be Member type at runtime
    opportunity?: any; // Will be VolunteerOpportunity type at runtime

    constructor(dto: InterestDTO) {
        this.id = dto.id;
        this.churchId = dto.churchId;
        this.memberId = dto.memberId;
        this.opportunityId = dto.opportunityId;
        this.createdAt = new Date(dto.createdAt);
        this.updatedAt = new Date(dto.updatedAt);

        // Handle related entities if present in the DTO
        if (dto.member && typeof dto.member === "object" && dto.member.id) {
            this.member = modelFactory.createMember(dto.member);
        }

        if (
            dto.opportunity && typeof dto.opportunity === "object" &&
            dto.opportunity.id
        ) {
            this.opportunity = modelFactory.createVolunteerOpportunity(
                dto.opportunity,
            );
        }
    }

    /**
     * Gets the member name if available
     */
    getMemberName(): string {
        return this.member ? this.member.getFullName() : "Unknown Member";
    }

    /**
     * Gets the opportunity name if available
     */
    getOpportunityName(): string {
        return this.opportunity ? this.opportunity.name : "Unknown Opportunity";
    }

    /**
     * Gets a summary string for display
     */
    getSummary(): string {
        return `${this.getMemberName()} - ${this.getOpportunityName()}`;
    }

    /**
     * Factory method to create an Interest from a DTO
     */
    static fromDTO(dto: InterestDTO): Interest {
        return new Interest(dto);
    }

    /**
     * Converts the model back to a DTO
     */
    toDTO(): InterestDTO {
        return {
            id: this.id,
            churchId: this.churchId,
            memberId: this.memberId,
            opportunityId: this.opportunityId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            member: this.member ? this.member.toDTO() : undefined,
            opportunity: this.opportunity
                ? this.opportunity.toDTO()
                : undefined,
        };
    }
}
