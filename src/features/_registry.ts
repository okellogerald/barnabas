/**
 * Service Registry
 *
 * A simple service locator pattern to break circular dependencies.
 * This allows lazy loading of manager instances and avoids direct
 * imports between query files and manager files.
 */

// Type for factory functions that create manager instances
type ManagerFactory<T> = () => T;

/**
 * Service Registry singleton that manages access to managers and services
 */
export class ServiceRegistry {
    private static instance: ServiceRegistry;
    private managers: Map<string, any> = new Map();
    private factories: Map<string, ManagerFactory<any>> = new Map();

    private constructor() {}

    /**
     * Get the singleton instance of the registry
     */
    public static getInstance(): ServiceRegistry {
        if (!ServiceRegistry.instance) {
            ServiceRegistry.instance = new ServiceRegistry();
        }
        return ServiceRegistry.instance;
    }

    /**
     * Register a factory function for a manager
     *
     * @param managerName The name of the manager
     * @param factory Function that creates an instance of the manager
     */
    public registerFactory<T>(
        managerName: string,
        factory: ManagerFactory<T>,
    ): void {
        this.factories.set(managerName, factory);
    }

    /**
     * Get a manager instance, creating it if needed
     *
     * @param managerName The name of the manager to get
     * @returns The manager instance
     */
    public getManager<T>(managerName: string): T {
        // Return existing instance if available
        if (this.managers.has(managerName)) {
            return this.managers.get(managerName) as T;
        }

        // Create new instance if we have a factory
        if (this.factories.has(managerName)) {
            const factory = this.factories.get(managerName)!;
            const instance = factory();
            this.managers.set(managerName, instance);
            return instance as T;
        }

        throw new Error(
            `Manager "${managerName}" not registered in ServiceRegistry`,
        );
    }

    /**
     * Clear all registered managers (mainly for testing)
     */
    public clear(): void {
        this.managers.clear();
    }
}

// Export singleton instance
export const registry = ServiceRegistry.getInstance();
