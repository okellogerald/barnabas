// Import all models to ensure proper initialization order
import { modelFactory } from './model.factory';

// These imports will register each model with the factory
import './role.model';
import './volunteer.model';
import './fellowship.model';
import './member.model';

// Export everything for convenient access
export * from './model.factory';
export * from './role.model';
export * from './volunteer.model';
export * from './fellowship.model';
export * from './member.model';
export * from "./auth_user.model";
export * from "./church.model";
export * from "./dependant.model";

// Re-export the factory instance
export { modelFactory };