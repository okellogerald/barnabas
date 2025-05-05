import { useState, useCallback } from "react";
import { EnvelopeQueries } from "../queries";

export const useEnvelopeBlock = () => {
    const [startNumber, setStartNumber] = useState<number | null>(null);
    const [endNumber, setEndNumber] = useState<number | null>(null);

    // Mutations
    const createBlockMutation = EnvelopeQueries.useCreateBlock();
    const deleteBlockMutation = EnvelopeQueries.useDeleteBlock();

    // Handle create block
    const createBlock = useCallback(async () => {
        if (startNumber === null || endNumber === null || startNumber >= endNumber) {
            throw new Error("Invalid envelope range");
        }

        try {
            return await createBlockMutation.mutateAsync({
                startNumber,
                endNumber,
            });
        } catch (error) {
            console.error('Failed to create envelope block:', error);
            throw error;
        }
    }, [startNumber, endNumber, createBlockMutation]);

    // Handle delete block
    const deleteBlock = useCallback(async () => {
        if (startNumber === null || endNumber === null || startNumber >= endNumber) {
            throw new Error("Invalid envelope range");
        }

        try {
            return await deleteBlockMutation.mutateAsync({
                startNumber,
                endNumber,
            });
        } catch (error) {
            console.error('Failed to delete envelope block:', error);
            throw error;
        }
    }, [startNumber, endNumber, deleteBlockMutation]);

    // Reset the form
    const reset = useCallback(() => {
        setStartNumber(null);
        setEndNumber(null);
    }, []);

    return {
        startNumber,
        endNumber,
        setStartNumber,
        setEndNumber,
        createBlock,
        deleteBlock,
        reset,
        isCreating: createBlockMutation.isPending,
        isDeleting: deleteBlockMutation.isPending,
    };
};