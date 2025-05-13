import { BaseRepository } from "@/data/shared";
import { authContract } from "./auth.contract";
import { AuthResponse, CurrentUserResponse, LoginRequest } from "./auth.schema";

export class AuthRepository extends BaseRepository<typeof authContract> {
    constructor() {
        super("auth", authContract);
    }

    /**
     * Authenticates a user with the provided credentials
     * @param credentials User credentials (username, password)
     * @returns Authentication response with token, user data, and allowed actions
     */
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const result = await this.client.login({
            body: credentials,
        });

        return this.handleResponse<AuthResponse>(result, 201);
    }

    /**
     * Retrieves the currently authenticated user
     * @returns Current user data and allowed actions
     */
    async getCurrentUser(): Promise<CurrentUserResponse> {
        const result = await this.client.getCurrentUser({});

        return this.handleResponse<CurrentUserResponse>(result, 200);
    }

    /**
     * Logs out the current user
     */
    async logout(): Promise<void> {
        const result = await this.client.logout({});

        this.handleResponse<null>(result, 201);
    }
}
