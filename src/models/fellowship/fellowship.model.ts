import {
    CreateFellowshipDTO,
    FellowshipDTO,
    UpdateFellowshipDTO,
} from "@/data/fellowship";

/**
 * Fellowship model representing a church fellowship
 */
export class Fellowship {
    id: string;
    churchId: string;
    name: string;
    notes: string | null;
    chairmanId: string | null;
    deputyChairmanId: string | null;
    secretaryId: string | null;
    treasurerId: string | null;
    createdAt: Date;
    updatedAt: Date;

    // Transient properties for related entities
    chairman?: any;
    deputyChairman?: any;
    secretary?: any;
    treasurer?: any;
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
        if ((dto as any).chairman) {
            this.chairman = (dto as any).chairman;
        }

        if ((dto as any).deputyChairman) {
            this.deputyChairman = (dto as any).deputyChairman;
        }

        if ((dto as any).secretary) {
            this.secretary = (dto as any).secretary;
        }

        if ((dto as any).treasurer) {
            this.treasurer = (dto as any).treasurer;
        }

        if ((dto as any).memberCount !== undefined) {
            this.memberCount = (dto as any).memberCount;
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
            const name = typeof this.chairman === "string"
                ? this.chairman
                : `${this.chairman.firstName} ${this.chairman.lastName}`;
            leaders.push(`Chairman: ${name}`);
        }

        if (this.secretary) {
            const name = typeof this.secretary === "string"
                ? this.secretary
                : `${this.secretary.firstName} ${this.secretary.lastName}`;
            leaders.push(`Secretary: ${name}`);
        }

        if (this.treasurer) {
            const name = typeof this.treasurer === "string"
                ? this.treasurer
                : `${this.treasurer.firstName} ${this.treasurer.lastName}`;
            leaders.push(`Treasurer: ${name}`);
        }

        if (this.deputyChairman) {
            const name = typeof this.deputyChairman === "string"
                ? this.deputyChairman
                : `${this.deputyChairman.firstName} ${this.deputyChairman.lastName}`;
            leaders.push(`Deputy Chairman: ${name}`);
        }

        return leaders.length > 0 ? leaders.join(", ") : "No leaders assigned";
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
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
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
