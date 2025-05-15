import { ModelFactory } from "./model.factory";
import { SchemaFactory } from "./schema.factory";

const schemaFactory = SchemaFactory.getInstance();
const modelFactory = ModelFactory.getInstance();

// ✅ Lazy-load models to prevent circular dependencies
export const initializeModels = async () => {
    const {
        Envelope,
        EnvelopeHistory,
        Fellowship,
        Interest,
        Member,
        Role,
        RoleAction,
        User,
        VolunteerOpportunity,
        Church,
    } = await import("@/models");

    modelFactory.register("Church", Church);
    modelFactory.register("Fellowship", Fellowship);
    modelFactory.register("VolunteerOpportunity", VolunteerOpportunity);
    modelFactory.register("Member", Member);
    modelFactory.register("Role", Role);
    modelFactory.register("User", User);
    modelFactory.register("RoleAction", RoleAction);
    modelFactory.register("Interest", Interest);
    modelFactory.register("Envelope", Envelope);
    modelFactory.register("EnvelopeHistory", EnvelopeHistory);
};

// ✅ Lazy-load schemas to prevent circular dependencies
export const initializeSchemas = async () => {
    const { MemberSchemas } = await import("@/data/member");
    const { InterestSchemas } = await import("@/data/interest");
    const { VolunteerOpportunitySchemas } = await import("@/data/volunteer");
    const { churchSchema } = await import("@/data/church");

    schemaFactory.register("member", MemberSchemas.memberSchema);
    schemaFactory.register("interest", InterestSchemas.interestSchema);
    schemaFactory.register(
        "volunteer-opportunity",
        VolunteerOpportunitySchemas.volunteerOpportunity,
    );
    schemaFactory.register("church", churchSchema);
};

// ✅ Unified initialization
export const initializeFactories = async () => {
    await initializeModels();
    await initializeSchemas();
};

export { modelFactory, schemaFactory };
