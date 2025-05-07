import { User } from "@/models";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Type definition for auth store state
interface AuthState {
    user: string | null;
    token: string | null;
    allowedActions: string[];

    // Actions
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setAllowedActions: (actions: string[]) => void;
    clearAuth: () => void;
}

/**
 * Zustand store for authentication state
 * Uses persist middleware to save auth data in sessionStorage
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            allowedActions: [],

            setUser: (user) => set({ user: user ? user.toJson() : null }),
            setToken: (token) => set({ token }),
            setAllowedActions: (actions) => set({ allowedActions: actions }),
            clearAuth: () =>
                set({ user: null, token: null, allowedActions: [] }),
        }),
        {
            name: "church-management-auth-store",
            storage: createJSONStorage(() => sessionStorage),
        },
    ),
);
