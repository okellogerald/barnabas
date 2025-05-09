import { z } from "zod";

export class SchemaFactory {
    private static _instance: SchemaFactory;
    private _schemas: Record<string, z.ZodType<any>> = {};

    private constructor() {}

    /**
     * Gets the singleton instance of SchemaFactory
     */
    public static getInstance(): SchemaFactory {
        if (!SchemaFactory._instance) {
            SchemaFactory._instance = new SchemaFactory();
            // 🧊 Freeze the instance to prevent modifications
            Object.freeze(SchemaFactory._instance);
        }
        return SchemaFactory._instance;
    }

    /**
     * Register a schema with the factory
     */
    public register(schemaName: string, schema: z.ZodType<any>): void {
        this._schemas[schemaName] = schema;
        // console.log("registered schema", schemaName);
    }

    /**
     * Get a schema from the factory
     */
    public getSchema(schemaName: string): z.ZodType<any> | null {
        const schema = this._schemas[schemaName];
        if (!schema) {
            throw new Error(`Schema ${schemaName} not registered`);
        }
        return schema;
    }

    /**
     * Get member schema
     */
    public getMemberSchema(): z.ZodType<any> {
        const schema = this.getSchema("member");
        if (!schema) {
            throw new Error("Member schema not registered");
        }
        return schema;
    }

    /**
     * Get member schema
     */
    public getFellowshipSchema(): z.ZodType<any> {
        const schema = this.getSchema("fellowship");
        if (!schema) {
            throw new Error("Fellowship schema not registered");
        }
        return schema;
    }

    /**
     * Get volunteer opportunity schema
     */
    public getVolunteerOpportunitySchema(): z.ZodType<any> {
        const schema = this.getSchema("volunteer-opportunity");
        if (!schema) {
            throw new Error("Volunteer schema not registered");
        }
        return schema;
    }
}
