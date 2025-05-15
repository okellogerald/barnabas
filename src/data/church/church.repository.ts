import { BaseRepository } from "@/data/shared/base-repository";
import { churchContract } from "./church.api-contract";
import { ChurchDTO } from "./church.schema";

export class ChurchRepository extends BaseRepository<typeof churchContract> {
  constructor() {
    super("church", churchContract);
  }

  /**
   * Retrieves the church associated with the currently authenticated user
   * @returns Church data
   */
  async getCurrentChurch(): Promise<ChurchDTO> {
    const result = await this.client.getCurrentChurch({});

    return this.handleResponse<ChurchDTO>(result, 200);
  }
}
