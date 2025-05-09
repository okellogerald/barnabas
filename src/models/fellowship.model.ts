import {
    CreateFellowshipDTO,
    FellowshipDTO,
    UpdateFellowshipDTO,
} from "@/data/fellowship";
import { modelFactory } from "../factories";
import type { Member } from "./member.model";

/**
 * Fellowship model representing a church fellowship
 */
export class Fellowship {
    id: string;
    churchId: string;
    name: string;
    notes: string | null | undefined;
    chairmanId: string | null | undefined;
    deputyChairmanId: string | null | undefined;
    secretaryId: string | null | undefined;
    treasurerId: string | null | undefined;
    createdAt: Date;
    updatedAt: Date;

    // Transient properties for related entities
    chairman?: Member; // Will be Member type at runtime
    deputyChairman?: Member; // Will be Member type at runtime
    secretary?: Member; // Will be Member type at runtime
    treasurer?: Member; // Will be Member type at runtime
    memberCount?: number;

    constructor(dto: FellowshipDTO) {
        this.id = dto.id;
        this.churchId = dto.churchId;
        this.name = dto.name;
        this.notes = dto.notes;
        this.chairmanId = dto.chairmanId;
        this.deputyChairmanId = dto.deputyChairmanId;
        this.secretaryId = dto.secretaryId;
        this.treasurerId = dto.treasurerId;
        this.createdAt = new Date(dto.createdAt);
        this.updatedAt = new Date(dto.updatedAt);

        // Handle related entities if present in the DTO
        const dtoAny = dto as FellowshipDTO & {
            chairman?: any;
            deputyChairman?: any;
            secretary?: any;
            treasurer?: any;
            memberCount?: number;
        };

        if (
            dtoAny.chairman && typeof dtoAny.chairman === "object" &&
            dtoAny.chairman.id
        ) {
            this.chairman = modelFactory.createMember(dtoAny.chairman);
        }

        if (
            dtoAny.deputyChairman &&
            typeof dtoAny.deputyChairman === "object" &&
            dtoAny.deputyChairman.id
        ) {
            this.deputyChairman = modelFactory.createMember(
                dtoAny.deputyChairman,
            );
        }

        if (
            dtoAny.secretary && typeof dtoAny.secretary === "object" &&
            dtoAny.secretary.id
        ) {
            this.secretary = modelFactory.createMember(dtoAny.secretary);
        }

        if (
            dtoAny.treasurer && typeof dtoAny.treasurer === "object" &&
            dtoAny.treasurer.id
        ) {
            this.treasurer = modelFactory.createMember(dtoAny.treasurer);
        }

        if (dtoAny.memberCount !== undefined) {
            this.memberCount = dtoAny.memberCount;
        }
    }

    /**
     * Gets a formatted display name for the fellowship
     */
    getDisplayName(): string {
        return this.name.toUpperCase();
    }

    /**
     * Checks if this fellowship has any leadership
     */
    hasLeadership(): boolean {
        return !!(this.chairmanId || this.deputyChairmanId ||
            this.secretaryId || this.treasurerId);
    }

    /**
     * Gets a leadership summary for display
     */
    getLeadershipSummary(): string {
        const leaders = [];

        if (this.chairman) {
            leaders.push(`Chairman: ${this.chairman.getFullName()}`);
        }

        if (this.secretary) {
            leaders.push(`Secretary: ${this.secretary.getFullName()}`);
        }

        if (this.treasurer) {
            leaders.push(`Treasurer: ${this.treasurer.getFullName()}`);
        }

        if (this.deputyChairman) {
            leaders.push(
                `Deputy Chairman: ${this.deputyChairman.getFullName()}`,
            );
        }

        return leaders.length > 0 ? leaders.join(", ") : "No leaders assigned";
    }

    /**
     * Gets the leader's role and contact information
     */
    getLeaderContactInfo(): string[] {
        const contacts = [];

        if (this.chairman) {
            contacts.push(
                `Chairman: ${this.chairman.getFullName()} | ${this.chairman.phoneNumber}`,
            );
        }

        if (this.secretary) {
            contacts.push(
                `Secretary: ${this.secretary.getFullName()} | ${this.secretary.phoneNumber}`,
            );
        }

        if (this.treasurer) {
            contacts.push(
                `Treasurer: ${this.treasurer.getFullName()} | ${this.treasurer.phoneNumber}`,
            );
        }

        if (this.deputyChairman) {
            contacts.push(
                `Deputy Chairman: ${this.deputyChairman.getFullName()} | ${this.deputyChairman.phoneNumber}`,
            );
        }

        return contacts;
    }

    /**
     * Gets a summary of the membership count
     */
    getMembershipSummary(): string {
        if (this.memberCount === undefined) {
            return "Unknown member count";
        }

        return `${this.memberCount} member${this.memberCount !== 1 ? "s" : ""}`;
    }

    /**
     * Factory method to create a Fellowship from a DTO
     */
    static fromDTO(dto: FellowshipDTO): Fellowship {
        return new Fellowship(dto);
    }

    /**
     * Converts the model back to a DTO
     */
    toDTO(): FellowshipDTO {
        return {
            id: this.id,
            churchId: this.churchId,
            name: this.name,
            notes: this.notes,
            chairmanId: this.chairmanId,
            deputyChairmanId: this.deputyChairmanId,
            secretaryId: this.secretaryId,
            treasurerId: this.treasurerId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    /**
     * Converts to a DTO for creation
     */
    toCreateDTO(): CreateFellowshipDTO {
        return {
            name: this.name,
            notes: this.notes,
        };
    }

    /**
     * Converts to a DTO for updating
     */
    toUpdateDTO(): UpdateFellowshipDTO {
        return {
            name: this.name,
            notes: this.notes,
            chairmanId: this.chairmanId,
            deputyChairmanId: this.deputyChairmanId,
            secretaryId: this.secretaryId,
            treasurerId: this.treasurerId,
        };
    }
}
