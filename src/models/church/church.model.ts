import { ChurchDTO } from "@/data/church";

/**
 * Church model class
 * Represents a church entity in the system
 */
export class Church {
    id: string;
    name: string;
    domainName: string;
    registrationNumber: string;
    contactPhone: string;
    contactEmail: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: {
        id: string;
        name: string;
        domainName: string;
        registrationNumber: string;
        contactPhone: string;
        contactEmail: string;
        createdAt: Date | string;
        updatedAt: Date | string;
    }) {
        this.id = data.id;
        this.name = data.name;
        this.domainName = data.domainName;
        this.registrationNumber = data.registrationNumber;
        this.contactPhone = data.contactPhone;
        this.contactEmail = data.contactEmail;
        this.createdAt = data.createdAt instanceof Date
            ? data.createdAt
            : new Date(data.createdAt);
        this.updatedAt = data.updatedAt instanceof Date
            ? data.updatedAt
            : new Date(data.updatedAt);
    }

    /**
     * Create a Church instance from a ChurchDTO
     * @param json ChurchDTO data from API
     * @returns Church model instance
     */
    static fromJson(json: ChurchDTO): Church {
        return new Church({
            id: json.id,
            name: json.name,
            domainName: json.domainName,
            registrationNumber: json.registrationNumber,
            contactPhone: json.contactPhone,
            contactEmail: json.contactEmail,
            createdAt: json.createdAt,
            updatedAt: json.updatedAt,
        });
    }

    /**
     * Create a Church instance from a ChurchDTO
     * @param dto ChurchDTO data from API
     * @returns Church model instance
     */
    static fromDTO(dto: ChurchDTO): Church {
        return new Church({
            id: dto.id,
            name: dto.name,
            domainName: dto.domainName,
            registrationNumber: dto.registrationNumber,
            contactPhone: dto.contactPhone,
            contactEmail: dto.contactEmail,
            createdAt: dto.createdAt,
            updatedAt: dto.updatedAt,
        });
    }

    /**
     * Convert Church model instance to ChurchDTO
     * @returns ChurchDTO for API operations
     */
    toJson(): ChurchDTO {
        return {
            id: this.id,
            name: this.name,
            domainName: this.domainName,
            registrationNumber: this.registrationNumber,
            contactPhone: this.contactPhone,
            contactEmail: this.contactEmail,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }

    /**
     * Convert Church model instance to ChurchDTO
     * @returns ChurchDTO for API operations
     */
    toDTO(): ChurchDTO {
        return {
            id: this.id,
            name: this.name,
            domainName: this.domainName,
            registrationNumber: this.registrationNumber,
            contactPhone: this.contactPhone,
            contactEmail: this.contactEmail,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }

    /**
     * Get full church name with domain
     */
    get fullName(): string {
        return `${this.name} (${this.domainName})`;
    }
}
