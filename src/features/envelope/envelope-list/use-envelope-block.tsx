import { useCallback } from 'react';
import { EnvelopeQueries } from '@/features/envelope/envelope.queries';

/**
 * Custom hook to manage envelope block creation and deletion
 * 
 * This hook handles the state and operations related to:
 * - Creating new blocks of envelope numbers
 * - Deleting blocks of envelope numbers
 * - Managing the form state for these operations
 */
export function useEnvelopeBlock() {
  // Mutations for block operations
  const createBlockMutation = EnvelopeQueries.useCreateBlock();
  const deleteBlockMutation = EnvelopeQueries.useDeleteBlock();

  // Create block operation
  const createBlock = useCallback(async (startNumber: number, endNumber: number) => {
    if (startNumber === null || endNumber === null) {
      throw new Error('Start and end numbers are required');
    }

    if (endNumber <= startNumber) {
      throw new Error('End number must be greater than start number');
    }

    return await createBlockMutation.mutateAsync({
      startNumber,
      endNumber,
    });
  }, [createBlockMutation]);

  // Delete block operation
  const deleteBlock = useCallback(async (startNumber: number, endNumber: number) => {
    if (startNumber === null || endNumber === null) {
      throw new Error('Start and end numbers are required');
    }

    if (endNumber <= startNumber) {
      throw new Error('End number must be greater than start number');
    }

    return await deleteBlockMutation.mutateAsync({
      startNumber,
      endNumber,
    });
  }, [deleteBlockMutation]);

  return {
    // Loading state
    isCreating: createBlockMutation.isPending,
    isDeleting: deleteBlockMutation.isPending,

    // Operations
    createBlock,
    deleteBlock,
  };
}