import { useNavigate } from "react-router-dom";
import { ROUTES } from "./routes.constants";
import { NavigationParams } from "./types";

/**
 * Hook for application navigation
 * Provides strongly-typed navigation methods using route constants
 */
export const useAppNavigation = () => {
    const navigate = useNavigate();

    return {
        toDashboard: () => navigate(ROUTES.DASHBOARD),
        toLogin: () => navigate(ROUTES.LOGIN),
        goBack: () => navigate(-1),

        Members: {
            toList: (params?: NavigationParams["member"]) => {
                if (params?.fellowshipId) {
                    sessionStorage.setItem(
                        "memberList_fellowshipId",
                        params.fellowshipId,
                    );
                }
                navigate(ROUTES.MEMBERS.LIST);
            },
            toDetails: (id: string) =>
                navigate(ROUTES.MEMBERS.DETAILS.replace(":id", id)),
            toCreate: () => navigate(ROUTES.MEMBERS.CREATE),
            toEdit: (id: string) =>
                navigate(ROUTES.MEMBERS.EDIT.replace(":id", id)),
            toAssignEnvelope: (id: string) =>
                navigate(ROUTES.MEMBERS.ASSIGN_ENVELOPE.replace(":id", id)),
        },

        Fellowships: {
            toList: () => navigate(ROUTES.FELLOWSHIPS.LIST),
            toDetails: (id: string) =>
                navigate(ROUTES.FELLOWSHIPS.DETAILS.replace(":id", id)),
            toCreate: () => navigate(ROUTES.FELLOWSHIPS.CREATE),
            toEdit: (id: string) =>
                navigate(ROUTES.FELLOWSHIPS.EDIT.replace(":id", id)),
        },

        Opportunities: {
            toList: () => navigate(ROUTES.OPPORTUNITIES.LIST),
            toDetails: (id: string) =>
                navigate(ROUTES.OPPORTUNITIES.DETAILS.replace(":id", id)),
            toCreate: () => navigate(ROUTES.OPPORTUNITIES.CREATE),
            toEdit: (id: string) =>
                navigate(ROUTES.OPPORTUNITIES.EDIT.replace(":id", id)),
        },

        Roles: {
            toList: () => navigate(ROUTES.ROLES.LIST),
            toDetails: (id: string) =>
                navigate(ROUTES.ROLES.DETAILS.replace(":id", id)),
            toCreate: () => navigate(ROUTES.ROLES.CREATE),
            toEdit: (id: string) =>
                navigate(ROUTES.ROLES.EDIT.replace(":id", id)),
        },

        Users: {
            toList: () => navigate(ROUTES.USERS.LIST),
            toDetails: (id: string) =>
                navigate(ROUTES.USERS.DETAILS.replace(":id", id)),
            toCreate: () => navigate(ROUTES.USERS.CREATE),
            toEdit: (id: string) =>
                navigate(ROUTES.USERS.EDIT.replace(":id", id)),
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
                navigate(ROUTES.ENVELOPES.LIST);
            },
            toDetails: (id: string) =>
                navigate(ROUTES.ENVELOPES.DETAILS.replace(":id", id)),
            toAssign: (id: string) =>
                navigate(ROUTES.ENVELOPES.ASSIGN.replace(":id", id)),
        },
    };
};
