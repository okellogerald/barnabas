export { default as AppProvider } from "./app-provider";
export * from "./navigation";
export * from "./config";
export * from "./theme";

import { initializeFactories } from "@/factories";

(async () => {
    try {
        await initializeFactories();
        console.log("Factories initialized successfully!");
    } catch (error) {
        console.error("Failed to initialize factories:", error);
    }
})();
