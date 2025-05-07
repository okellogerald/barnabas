import { OpportunityRepository } from "@/data/volunteer";
import { VolunteerOpportunity } from "@/models";

/**
 * Member Manager
 *
 * Handles member-related operations, including retrieving member data and enforcing permissions.
 */
export class VolunteerOpportunityManager {
    private static _instance: VolunteerOpportunityManager;
    private _repo: OpportunityRepository;

    /**
     * Private constructor to enforce singleton pattern.
     * @param repo The VolunteerOpportunityRepository instance.
     * @param permissionsManager The PermissionsManager instance.
     */
    private constructor(
        repo: OpportunityRepository,
    ) {
        this._repo = repo;
    }

    /**
     * Gets the singleton instance of MemberManager.
     * @returns The MemberManager instance.
     */
    public static get instance(): VolunteerOpportunityManager {
        if (!VolunteerOpportunityManager._instance) {
            VolunteerOpportunityManager._instance =
                new VolunteerOpportunityManager(
                    new OpportunityRepository(),
                );
        }
        return VolunteerOpportunityManager._instance;
    }

    /**
     * Retrieves all members, enforcing the MEMBER_FIND_ALL permission.
     * @returns A promise that resolves to an array of Member objects.
     * @throws PermissionError if the user does not have the required permission.
     * @throws Error if there is an error retrieving members from the repository.
     */
    public async getOpportunities(): Promise<VolunteerOpportunity[]> {
        const opportunities = await this._repo.getAll();
        return opportunities.map(VolunteerOpportunity.fromDTO);
    }
}
