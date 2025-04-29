import { redirect } from "react-router-dom";
import { ROUTES } from "./constants";

/**
 * Navigation utility for programmatic navigation
 * Provides type-safe methods for navigating to different routes
 */
export const Navigation = {
  /**
   * Navigate to dashboard
   */
  toDashboard: () => {
    window.location.href = ROUTES.DASHBOARD;
  },

  /**
   * Navigate to login page
   */
  toLogin: () => {
    window.location.href = ROUTES.LOGIN;
  },

  /**
   * Member-related navigation
   */
  Members: {
    /**
     * Navigate to the members list page with optional filter parameters
     *
     * @param params Optional filter parameters like fellowshipId
     */
    toList: (params?: { fellowshipId?: string }) => {
      // If we have params, pre-set them in the filter store before navigation
      if (params) {
        if (params.fellowshipId) {
          sessionStorage.setItem(
            "memberList_fellowshipId",
            params.fellowshipId,
          );
        }
      }
      // Navigate to the members list page
      window.location.href = ROUTES.MEMBERS.LIST;
    },
    toDetails: (id: string) => {
      window.location.href = ROUTES.MEMBERS.DETAILS.replace(":id", id);
    },
    toCreate: (params?: { fellowshipId?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.fellowshipId) {
        queryParams.append("fellowshipId", params.fellowshipId);
      }
      const queryString = queryParams.toString();
      window.location.href = ROUTES.MEMBERS.CREATE + "?" + queryString;
    },
    toEdit: (id: string) => {
      window.location.href = ROUTES.MEMBERS.EDIT.replace(":id", id);
    },
  },

  /**
   * Fellowship-related navigation
   */
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

  /**
   * Opportunity-related navigation
   */
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

  /**
   * Role-related navigation
   */
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

  /**
   * User-related navigation
   */
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

  /**
   * Server-side redirect helper
   */
  redirectTo: (path: string) => redirect(path),
};