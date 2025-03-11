export const AppConfig = {
    API_BASE_URL: import.meta.env.VITE_BASE_URL,
    IS_PRODUCTION: import.meta.env.VITE_MODE === "production",
    IS_DEBUG: import.meta.env.VITE_MODE === "development",
};
