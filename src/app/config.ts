export const AppConfig = {
    API_BASE_URL: import.meta.env.VITE_BASE_URL,
    IS_PRODUCTION: import.meta.env.VITE_MODE === "production",
    DEFAULT_PAGE_SIZE: Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE),
    IS_DEBUG: import.meta.env.VITE_MODE === "development",
};
