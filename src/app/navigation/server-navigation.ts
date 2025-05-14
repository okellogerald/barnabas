import { redirect } from "react-router-dom";
import { ROUTES } from "./routes.constants";
import { NavigationParams } from "./types";

/**
 * Server-side navigation utility
 * Uses window.location.href for hard navigation and handles query parameters
 *
 * Use this navigation utility when:
 * 1. You need a hard page reload
 * 2. You're handling server-side redirects
 * 3. You need to preserve query parameters across navigation
 *
 * For client-side navigation with React Router, use useAppNavigation hook instead.
 */
export const Navigation = {
    toDashboard: () => {
        window.location.href = ROUTES.DASHBOARD;
    },

    toLogin: () => {
        window.location.href = ROUTES.LOGIN;
    },

    Members: {
        toList: (params?: NavigationParams["member"]) => {
            if (params?.fellowshipId) {
                sessionStorage.setItem(
                    "memberList_fellowshipId",
                    params.fellowshipId,
                );
            }
            window.location.href = ROUTES.MEMBERS.LIST;
        },
        toDetails: (id: string) => {
            window.location.href = ROUTES.MEMBERS.DETAILS.replace(":id", id);
        },
        toCreate: (params?: NavigationParams["member"]) => {
            const queryParams = new URLSearchParams();
            if (params?.fellowshipId) {
                queryParams.append("fellowshipId", params.fellowshipId);
            }
            const queryString = queryParams.toString();
            window.location.href = ROUTES.MEMBERS.CREATE +
                (queryString ? "?" + queryString : "");
        },
        toEdit: (id: string) => {
            window.location.href = ROUTES.MEMBERS.EDIT.replace(":id", id);
        },
        toAssignEnvelope: (id: string) => {
            window.location.href = ROUTES.MEMBERS.ASSIGN_ENVELOPE.replace(
                ":id",
                id,
            );
        },
    },

    Fellowships: {
        toList: () => {
            window.location.href = ROUTES.FELLOWSHIPS.LIST;
        },
        toDetails: (id: string) => {
            window.location.href = ROUTES.FELLOWSHIPS.DETAILS.replace(
                ":id",
                id,
            );
        },
        toCreate: () => {
            window.location.href = ROUTES.FELLOWSHIPS.CREATE;
        },
        toEdit: (id: string) => {
            window.location.href = ROUTES.FELLOWSHIPS.EDIT.replace(":id", id);
        },
    },

    Opportunities: {
        toList: () => {
            window.location.href = ROUTES.OPPORTUNITIES.LIST;
        },
        toDetails: (id: string) => {
            window.location.href = ROUTES.OPPORTUNITIES.DETAILS.replace(
                ":id",
                id,
            );
        },
        toCreate: () => {
            window.location.href = ROUTES.OPPORTUNITIES.CREATE;
        },
        toEdit: (id: string) => {
            window.location.href = ROUTES.OPPORTUNITIES.EDIT.replace(":id", id);
        },
    },

    Roles: {
        toList: () => {
            window.location.href = ROUTES.ROLES.LIST;
        },
        toDetails: (id: string) => {
            window.location.href = ROUTES.ROLES.DETAILS.replace(":id", id);
        },
        toCreate: () => {
            window.location.href = ROUTES.ROLES.CREATE;
        },
        toEdit: (id: string) => {
            window.location.href = ROUTES.ROLES.EDIT.replace(":id", id);
        },
    },

    Users: {
        toList: () => {
            window.location.href = ROUTES.USERS.LIST;
        },
        toDetails: (id: string) => {
            window.location.href = ROUTES.USERS.DETAILS.replace(":id", id);
        },
        toCreate: () => {
            window.location.href = ROUTES.USERS.CREATE;
        },
        toEdit: (id: string) => {
            window.location.href = ROUTES.USERS.EDIT.replace(":id", id);
        },
    },

    Envelopes: {
        toList: (params?: NavigationParams["envelope"]) => {
            if (params) {
                if (params.isAssigned !== undefined) {
                    sessionStorage.setItem(
                        "envelopeList_isAssigned",
                        params.isAssigned.toString(),
                    );
                }
                if (params.memberId) {
                    sessionStorage.setItem(
                        "envelopeList_memberId",
                        params.memberId,
                    );
                }
            }
            window.location.href = ROUTES.ENVELOPES.LIST;
        },
        toDetails: (id: string) => {
            window.location.href = ROUTES.ENVELOPES.DETAILS.replace(":id", id);
        },
        toAssign: (id: string) => {
            window.location.href = ROUTES.ENVELOPES.ASSIGN.replace(":id", id);
        },
    },

    /**
     * Server-side redirect helper for React Router
     */
    redirectTo: (path: string) => redirect(path),
};
