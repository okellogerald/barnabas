import { EnvelopeHistoryDTO } from "@/data/envelope";
import { Member } from "./member.model";
import { modelFactory } from "./model.factory";

export enum EnvelopeActivityType {
    ASSIGN = "ASSIGN",
    RELEASE = "RELEASE"
}

export class EnvelopeHistory {
    id: string;
    envelopeId: string;
    churchId: string;
    memberId: string;
    activityType: EnvelopeActivityType;
    activityAt: Date;
    createdAt: Date;
    updatedAt: Date;

    // Related entities
    member?: Member;

    constructor(dto: EnvelopeHistoryDTO) {
        this.id = dto.id;
        this.envelopeId = dto.envelopeId;
        this.churchId = dto.churchId;
        this.memberId = dto.memberId;
        this.activityType = dto.activityType as EnvelopeActivityType;
        this.activityAt = new Date(dto.activityAt);
        this.createdAt = new Date(dto.createdAt);
        this.updatedAt = new Date(dto.updatedAt);

        // // Handle member if present
        // if (dto.member) {
        //     this.member = modelFactory.createMember(dto.member);
        // }
    }

    /**
     * Gets a description of the activity
     */
    getActivityDescription(): string {
        const memberName = this.member ? this.member.getFullName() : "Unknown Member";
        const date = this.activityAt.toLocaleDateString();

        switch (this.activityType) {
            case EnvelopeActivityType.ASSIGN:
                return `Assigned to ${memberName} on ${date}`;
            case EnvelopeActivityType.RELEASE:
                return `Released from ${memberName} on ${date}`;
            default:
                return `Unknown activity on ${date}`;
        }
    }

    /**
     * Factory method to create an EnvelopeHistory from a DTO
     */
    static fromDTO(dto: EnvelopeHistoryDTO): EnvelopeHistory {
        return new EnvelopeHistory(dto);
    }

    /**
     * Converts the model back to a DTO
     */
    toDTO(): EnvelopeHistoryDTO {
        return {
            id: this.id,
            envelopeId: this.envelopeId,
            churchId: this.churchId,
            memberId: this.memberId,
            activityType: this.activityType,
            activityAt: this.activityAt,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}

// Register the EnvelopeHistory class with the factory
modelFactory.register('EnvelopeHistory', EnvelopeHistory);