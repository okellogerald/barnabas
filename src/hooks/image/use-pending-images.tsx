import { useRef, useCallback } from 'react';

// Interface for components that can have pending changes
interface PendingImageComponent {
    hasPendingChanges: () => boolean;
    getPendingMessage: () => string;
}

/**
 * Hook to manage and check for pending image uploads across multiple components
 */
export const usePendingImages = () => {
    const pendingComponentsRef = useRef<Map<string, PendingImageComponent>>(new Map());

    // Register a component that might have pending images
    const registerComponent = useCallback((id: string, component: PendingImageComponent) => {
        pendingComponentsRef.current.set(id, component);
    }, []);

    // Unregister a component
    const unregisterComponent = useCallback((id: string) => {
        pendingComponentsRef.current.delete(id);
    }, []);

    // Check if any registered components have pending changes
    const hasPendingChanges = useCallback((): boolean => {
        for (const component of pendingComponentsRef.current.values()) {
            if (component.hasPendingChanges()) {
                return true;
            }
        }
        return false;
    }, []);

    // Get all pending messages
    const getPendingMessages = useCallback((): string[] => {
        const messages: string[] = [];
        for (const component of pendingComponentsRef.current.values()) {
            if (component.hasPendingChanges()) {
                messages.push(component.getPendingMessage());
            }
        }
        return messages;
    }, []);

    // Get a combined pending message
    const getCombinedPendingMessage = useCallback((): string => {
        const messages = getPendingMessages();
        if (messages.length === 0) return '';
        if (messages.length === 1) return messages[0];
        return `You have ${messages.length} unsaved images. Please save or cancel them before proceeding.`;
    }, [getPendingMessages]);

    return {
        registerComponent,
        unregisterComponent,
        hasPendingChanges,
        getPendingMessages,
        getCombinedPendingMessage,
    };
};