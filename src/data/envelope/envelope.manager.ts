import { EnvelopeBlockDTO, EnvelopeQueryBuilder, EnvelopeQueryCriteria, EnvelopeRepository } from "@/data/envelope";
import { Envelope, EnvelopeHistory } from "@/models";
import { Actions, AuthorizationManager } from "@/data/authorization";
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
 * from the repository and enforcing necessary permissions using AuthorizationManager.
 * Implemented as a singleton.
 */
export class EnvelopeManager {
  private static _instance: EnvelopeManager;
  private _repo: EnvelopeRepository;
  private _permManager: AuthorizationManager;

  /**
   * Private constructor to enforce singleton pattern.
   */
  private constructor(repo: EnvelopeRepository, permissionsManager: AuthorizationManager) {
    this._repo = repo;
    this._permManager = permissionsManager;
  }

  /**
   * Gets the singleton instance of EnvelopeManager.
   */
  public static get instance(): EnvelopeManager {
    if (!EnvelopeManager._instance) {
      EnvelopeManager._instance = new EnvelopeManager(new EnvelopeRepository(), AuthorizationManager.getInstance());
    }
    return EnvelopeManager._instance;
  }

  /**
   * Retrieves a filtered count of envelopes
   */
  public async getEnvelopesCount(options: EnvelopeQueryCriteria | EnvelopeQueryBuilder): Promise<number> {
    if (!this._permManager.canPerformAction(Actions.ENVELOPE_FIND_ALL)) {
      throw PermissionError.fromAction(Actions.ENVELOPE_FIND_ALL);
    }

    try {
      const builder = EnvelopeQueryBuilder.from(options).configureForCount();
      const response = await this._repo.getAll(builder);
      return response.total;
    } catch (error) {
      console.error("Error retrieving filtered envelopes count:", error);
      throw error;
    }
  }

  /**
   * Retrieves all envelopes with optional filtering and pagination.
   */
  public async getEnvelopes(options?: EnvelopeQueryCriteria | EnvelopeQueryBuilder): Promise<GetEnvelopesResponse> {
    if (!this._permManager.canPerformAction(Actions.ENVELOPE_FIND_ALL)) {
      throw PermissionError.fromAction(Actions.ENVELOPE_FIND_ALL);
    }

    try {
      const builder = EnvelopeQueryBuilder.from(options);
      const response = await this._repo.getAll(builder);
      console.log("response: ", response);

      const envelopes = response.results.map(Envelope.fromDTO);
      return { envelopes, total: response.total };
    } catch (error) {
      console.error("Error retrieving envelopes:", error);
      throw error;
    }
  }

  /**
   * Retrieves available envelopes.
   */
  public async getAvailableEnvelopes(): Promise<Envelope[]> {
    if (!this._permManager.canPerformAction(Actions.ENVELOPE_FIND_ALL)) {
      throw PermissionError.fromAction(Actions.ENVELOPE_FIND_ALL);
    }

    try {
      const dtos = await this._repo.getAvailable();
      return dtos.map(Envelope.fromDTO);
    } catch (error) {
      console.error("Error retrieving available envelopes:", error);
      throw error;
    }
  }

  /**
   * Retrieves an envelope by ID.
   */
  public async getEnvelopeById(envelopeId: string): Promise<Envelope | undefined> {
    if (!this._permManager.canPerformAction(Actions.ENVELOPE_FIND_BY_ID)) {
      throw PermissionError.fromAction(Actions.ENVELOPE_FIND_BY_ID);
    }

    try {
      const dto = await this._repo.getById(envelopeId);
      return dto ? Envelope.fromDTO(dto) : undefined;
    } catch (error) {
      console.error(`Error retrieving envelope by ID (${envelopeId}):`, error);
      throw error;
    }
  }

  /**
   * Retrieves an envelope by number.
   */
  public async getEnvelopeByNumber(number: number): Promise<Envelope | undefined> {
    if (!this._permManager.canPerformAction(Actions.ENVELOPE_FIND_ALL)) {
      throw PermissionError.fromAction(Actions.ENVELOPE_FIND_ALL);
    }

    try {
      const dto = await this._repo.getByNumber(number);
      return dto ? Envelope.fromDTO(dto) : undefined;
    } catch (error) {
      console.error(`Error retrieving envelope by number (${number}):`, error);
      throw error;
    }
  }

  /**
   * Retrieves an envelope's assignment history.
   */
  public async getEnvelopeHistory(envelopeId: string): Promise<EnvelopeHistory[]> {
    if (!this._permManager.canPerformAction(Actions.ENVELOPE_GET_HISTORY)) {
      throw PermissionError.fromAction(Actions.ENVELOPE_GET_HISTORY);
    }

    try {
      const dtos = await this._repo.getHistory(envelopeId);
      return dtos.map(EnvelopeHistory.fromDTO);
    } catch (error) {
      console.error(`Error retrieving envelope history (${envelopeId}):`, error);
      throw error;
    }
  }

  /**
   * Creates a block of sequential envelopes.
   */
  public async createEnvelopeBlock(
    data: EnvelopeBlockDTO
  ): Promise<{ count: number; startNumber: number; endNumber: number }> {
    if (!this._permManager.canPerformAction(Actions.ENVELOPE_CREATE)) {
      throw PermissionError.fromAction(Actions.ENVELOPE_CREATE);
    }

    try {
      return await this._repo.createBlock(data);
    } catch (error) {
      console.error("Error creating envelope block:", error);
      throw error;
    }
  }

  /**
   * Deletes a block of sequential envelopes.
   */
  public async deleteEnvelopeBlock(
    data: EnvelopeBlockDTO
  ): Promise<{ count: number; startNumber: number; endNumber: number }> {
    if (!this._permManager.canPerformAction(Actions.ENVELOPE_DELETE)) {
      throw PermissionError.fromAction(Actions.ENVELOPE_DELETE);
    }

    try {
      return await this._repo.deleteBlock(data);
    } catch (error) {
      console.error("Error deleting envelope block:", error);
      throw error;
    }
  }

  /**
   * Assigns an envelope to a member.
   */
  public async assignEnvelope(envelopeId: string, memberId: string): Promise<Envelope> {
    if (!this._permManager.canPerformAction(Actions.ENVELOPE_ASSIGN)) {
      throw PermissionError.fromAction(Actions.ENVELOPE_ASSIGN);
    }

    try {
      const dto = await this._repo.assign(envelopeId, { memberId });
      return Envelope.fromDTO(dto);
    } catch (error) {
      console.error(`Error assigning envelope (${envelopeId}):`, error);
      throw error;
    }
  }

  /**
   * Releases an envelope from a member.
   */
  public async releaseEnvelope(envelopeId: string): Promise<Envelope> {
    if (!this._permManager.canPerformAction(Actions.ENVELOPE_RELEASE)) {
      throw PermissionError.fromAction(Actions.ENVELOPE_RELEASE);
    }

    try {
      const dto = await this._repo.release(envelopeId);
      return Envelope.fromDTO(dto);
    } catch (error) {
      console.error(`Error releasing envelope (${envelopeId}):`, error);
      throw error;
    }
  }
}
