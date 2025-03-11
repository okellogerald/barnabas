import { BaseRepository } from '@/data/_common';
import { fellowshipContract } from './contract';
import { FellowshipDTO, CreateFellowshipDTO, UpdateFellowshipDTO } from './schema';

export class FellowshipRepository extends BaseRepository<typeof fellowshipContract> {
  constructor() {
    super('fellowship', fellowshipContract);
  }

  /**
   * Retrieves all fellowships
   * @returns Array of fellowship data
   */
  async getAll(): Promise<FellowshipDTO[]> {
    const result = await this.client.getAll({});

    return this.handleResponse<FellowshipDTO[]>(result, 200);
  }

  /**
   * Retrieves a specific fellowship by ID
   * @param id Fellowship ID
   * @returns Fellowship data
   */
  async getById(id: string): Promise<FellowshipDTO> {
    const result = await this.client.getById({
      params: { id }
    });

    return this.handleResponse<FellowshipDTO>(result, 200);
  }

  /**
   * Creates a new fellowship
   * @param data Fellowship data to create
   * @returns Created fellowship data
   */
  async create(data: CreateFellowshipDTO): Promise<FellowshipDTO> {
    const result = await this.client.create({
      body: data
    });

    return this.handleResponse<FellowshipDTO>(result, 201);
  }

  /**
   * Updates an existing fellowship
   * @param id Fellowship ID
   * @param data Fellowship data to update
   * @returns Updated fellowship data
   */
  async update(id: string, data: UpdateFellowshipDTO): Promise<FellowshipDTO> {
    const result = await this.client.update({
      params: { id },
      body: data
    });

    return this.handleResponse<FellowshipDTO>(result, 200);
  }

  /**
   * Deletes a fellowship
   * @param id Fellowship ID
   * @returns Deleted fellowship data
   */
  async delete(id: string): Promise<FellowshipDTO> {
    const result = await this.client.delete({
      params: { id }
    });

    return this.handleResponse<FellowshipDTO>(result, 200);
  }
}