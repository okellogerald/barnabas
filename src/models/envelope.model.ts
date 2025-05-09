import { EnvelopeDTO } from "@/data/envelope";
import { Member } from "./member.model";
import { modelFactory } from "../factories";

export class Envelope {
    id: string;
    envelopeNumber: number;
    churchId: string;
    memberId: string | null;
    assignedAt: Date | null;
    releasedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;

    // Related entities
    member?: Member | null;

    constructor(dto: EnvelopeDTO) {
        this.id = dto.id;
        this.envelopeNumber = dto.envelopeNumber;
        this.churchId = dto.churchId;
        this.memberId = dto.memberId;
        this.assignedAt = dto.assignedAt ? new Date(dto.assignedAt) : null;
        this.releasedAt = dto.releasedAt ? new Date(dto.releasedAt) : null;
        this.createdAt = new Date(dto.createdAt);
        this.updatedAt = new Date(dto.updatedAt);

        // Handle member if present
        if (dto.member) {
            this.member = modelFactory.createMember(dto.member);
        }
    }

    /**
     * Gets the envelope status
     */
    getStatus(): string {
        if (this.memberId) {
            return "Assigned";
        } else if (this.releasedAt) {
            return "Available (Previously Used)";
        } else {
            return "Available (Never Used)";
        }
    }

    /**
     * Gets the assignment info
     */
    getAssignmentInfo(): string {
        if (!this.memberId) {
            return "Not assigned";
        }

        if (this.member) {
            return `Assigned to ${this.member.getFullName()} on ${this.assignedAt?.toLocaleDateString()}`;
        }

        return `Assigned since ${this.assignedAt?.toLocaleDateString()}`;
    }

    /**
     * Factory method to create an Envelope from a DTO
     */
    static fromDTO(dto: EnvelopeDTO): Envelope {
        return new Envelope(dto);
    }

    /**
     * Converts the model back to a DTO
     */
    toDTO(): EnvelopeDTO {
        return {
            id: this.id,
            envelopeNumber: this.envelopeNumber,
            churchId: this.churchId,
            memberId: this.memberId,
            assignedAt: this.assignedAt,
            releasedAt: this.releasedAt,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            member: this.member ? this.member.toDTO() : null,
        };
    }
}
