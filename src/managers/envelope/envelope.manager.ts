import {
    EnvelopeBlockDTO,
    EnvelopeQueryParams,
    EnvelopeRepository,
} from "@/data/envelope";
import { Envelope, EnvelopeHistory } from "@/models";
import { Actions, PermissionsManager } from "@/managers/auth/permission";
import { PermissionError } from "@/lib/error";

/**
 * @typedef {object} GetEnvelopesResponse
 * @property {Envelope[]} envelopes - An array of envelope objects.
 * @property {number} total - The total number of envelopes matching the query.
 */
type GetEnvelopesResponse = {
    envelopes: Envelope[];
    total: number;
};

/**
 * Envelope Manager
 *
 * Handles envelope-related operations, orchestrating data retrieval
 * from the repository and enforcing necessary permissions using PermissionsManager.
 * Implemented as a singleton.
 */
export class EnvelopeManager {
    private static _instance: EnvelopeManager;
    private _repo: EnvelopeRepository;
    private _permissionsManager: PermissionsManager;

    /**
     * Private constructor to enforce singleton pattern.
     */
    private constructor(
        repo: EnvelopeRepository,
        permissionsManager: PermissionsManager,
    ) {
        this._repo = repo;
        this._permissionsManager = permissionsManager;
    }

    /**
     * Gets the singleton instance of EnvelopeManager.
     */
    public static get instance(): EnvelopeManager {
        if (!EnvelopeManager._instance) {
            EnvelopeManager._instance = new EnvelopeManager(
                new EnvelopeRepository(),
                PermissionsManager.instance,
            );
        }
        return EnvelopeManager._instance;
    }

    /**
     * Retrieves a filtered count of envelopes.
     */
    public async getEnvelopesCount(
        queryParams?: EnvelopeQueryParams,
    ): Promise<number> {
        if (!this._permissionsManager.hasPermission(Actions.MEMBER_CREATE)) {
            throw PermissionError.fromAction(Actions.MEMBER_CREATE);
        }

        try {
            const updatedQueryParams: EnvelopeQueryParams = {
                ...queryParams,
                rangeStart: 0,
                rangeEnd: 1,
            };
            const response = await this._repo.getAll(updatedQueryParams);
            return response.total;
        } catch (error) {
            console.error("Error retrieving filtered envelopes count:", error);
            throw new Error("Failed to retrieve envelopes count.");
        }
    }

    /**
     * Retrieves all envelopes with optional filtering and pagination.
     */
    public async getEnvelopes(
        queryParams?: EnvelopeQueryParams,
    ): Promise<GetEnvelopesResponse> {
        if (!this._permissionsManager.hasPermission(Actions.MEMBER_CREATE)) {
            throw PermissionError.fromAction(Actions.MEMBER_CREATE);
        }

        try {
            const response = await this._repo.getAll(queryParams);
            const envelopes = response.results.map(Envelope.fromDTO);
            return { envelopes, total: response.total };
        } catch (error) {
            console.error("Error retrieving envelopes:", error);
            throw new Error("Failed to retrieve envelopes.");
        }
    }

    /**
     * Retrieves available envelopes.
     */
    public async getAvailableEnvelopes(): Promise<Envelope[]> {
        if (!this._permissionsManager.hasPermission(Actions.MEMBER_CREATE)) {
            throw PermissionError.fromAction(Actions.MEMBER_CREATE);
        }

        try {
            const dtos = await this._repo.getAvailable();
            return dtos.map(Envelope.fromDTO);
        } catch (error) {
            console.error("Error retrieving available envelopes:", error);
            throw new Error("Failed to retrieve available envelopes.");
        }
    }

    /**
     * Retrieves an envelope by ID.
     */
    public async getEnvelopeById(
        envelopeId: string,
    ): Promise<Envelope | undefined> {
        if (!this._permissionsManager.hasPermission(Actions.MEMBER_CREATE)) {
            throw PermissionError.fromAction(Actions.MEMBER_CREATE);
        }

        try {
            const dto = await this._repo.getById(envelopeId);
            return dto ? Envelope.fromDTO(dto) : undefined;
        } catch (error) {
            console.error(
                `Error retrieving envelope by ID (${envelopeId}):`,
                error,
            );
            throw new Error("Failed to retrieve envelope by ID.");
        }
    }

    /**
     * Retrieves an envelope by number.
     */
    public async getEnvelopeByNumber(
        number: number,
    ): Promise<Envelope | undefined> {
        if (!this._permissionsManager.hasPermission(Actions.MEMBER_CREATE)) {
            throw PermissionError.fromAction(Actions.MEMBER_CREATE);
        }

        try {
            const dto = await this._repo.getByNumber(number);
            return dto ? Envelope.fromDTO(dto) : undefined;
        } catch (error) {
            console.error(
                `Error retrieving envelope by number (${number}):`,
                error,
            );
            throw new Error("Failed to retrieve envelope by number.");
        }
    }

    /**
     * Retrieves an envelope's assignment history.
     */
    public async getEnvelopeHistory(
        envelopeId: string,
    ): Promise<EnvelopeHistory[]> {
        if (!this._permissionsManager.hasPermission(Actions.MEMBER_CREATE)) {
            throw PermissionError.fromAction(Actions.MEMBER_CREATE);
        }

        try {
            const dtos = await this._repo.getHistory(envelopeId);
            return dtos.map(EnvelopeHistory.fromDTO);
        } catch (error) {
            console.error(
                `Error retrieving envelope history (${envelopeId}):`,
                error,
            );
            throw new Error("Failed to retrieve envelope history.");
        }
    }

    /**
     * Creates a block of sequential envelopes.
     */
    public async createEnvelopeBlock(
        data: EnvelopeBlockDTO,
    ): Promise<{ count: number; startNumber: number; endNumber: number }> {
        if (!this._permissionsManager.hasPermission(Actions.MEMBER_CREATE)) {
            throw PermissionError.fromAction(Actions.MEMBER_CREATE);
        }

        try {
            return await this._repo.createBlock(data);
        } catch (error) {
            console.error("Error creating envelope block:", error);
            throw new Error("Failed to create envelope block.");
        }
    }

    /**
     * Deletes a block of sequential envelopes.
     */
    public async deleteEnvelopeBlock(
        data: EnvelopeBlockDTO,
    ): Promise<{ count: number; startNumber: number; endNumber: number }> {
        if (!this._permissionsManager.hasPermission(Actions.MEMBER_CREATE)) {
            throw PermissionError.fromAction(Actions.MEMBER_CREATE);
        }

        try {
            return await this._repo.deleteBlock(data);
        } catch (error) {
            console.error("Error deleting envelope block:", error);
            throw new Error("Failed to delete envelope block.");
        }
    }

    /**
     * Assigns an envelope to a member.
     */
    public async assignEnvelope(
        envelopeId: string,
        memberId: string,
    ): Promise<Envelope> {
        if (!this._permissionsManager.hasPermission(Actions.MEMBER_CREATE)) {
            throw PermissionError.fromAction(Actions.MEMBER_CREATE);
        }

        try {
            const dto = await this._repo.assign(envelopeId, { memberId });
            return Envelope.fromDTO(dto);
        } catch (error) {
            console.error(`Error assigning envelope (${envelopeId}):`, error);
            throw new Error("Failed to assign envelope.");
        }
    }

    /**
     * Releases an envelope from a member.
     */
    public async releaseEnvelope(envelopeId: string): Promise<Envelope> {
        if (!this._permissionsManager.hasPermission(Actions.MEMBER_CREATE)) {
            throw PermissionError.fromAction(Actions.MEMBER_CREATE);
        }

        try {
            const dto = await this._repo.release(envelopeId);
            return Envelope.fromDTO(dto);
        } catch (error) {
            console.error(`Error releasing envelope (${envelopeId}):`, error);
            throw new Error("Failed to release envelope.");
        }
    }
}
