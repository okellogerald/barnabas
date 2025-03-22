import { DependantRelationship } from "@/constants";
import { DependantDTO } from "@/data/member";

/**
 * Dependant model representing a member's dependant
 */
export class Dependant {
    id: string;
    churchId: string;
    memberId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date | null;
    relationship: DependantRelationship;
    createdAt: Date;
    updatedAt: Date;

    constructor(dto: DependantDTO) {
        this.id = dto.id;
        this.churchId = dto.churchId;
        this.memberId = dto.memberId;
        this.firstName = dto.firstName;
        this.lastName = dto.lastName;
        this.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
        this.relationship = dto.relationship;
        this.createdAt = new Date(dto.createdAt);
        this.updatedAt = new Date(dto.updatedAt);
    }

    /**
     * Gets a formatted display name for the dependant
     */
    getDisplayName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    /**
     * Gets the dependant's age in years
     */
    getAge(): number | null {
        if (!this.dateOfBirth) return null;

        const today = new Date();
        const birthDate = new Date(this.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (
            monthDifference < 0 ||
            (monthDifference === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }

        return age;
    }

    /**
     * Factory method to create a Dependant from a DTO
     */
    static fromDTO(dto: DependantDTO): Dependant {
        return new Dependant(dto);
    }

    /**
     * Converts the model back to a DTO
     */
    toDTO(): DependantDTO {
        return {
            id: this.id,
            churchId: this.churchId,
            memberId: this.memberId,
            firstName: this.firstName,
            lastName: this.lastName,
            dateOfBirth: this.dateOfBirth,
            relationship: this.relationship,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
