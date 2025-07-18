import { useCallback } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { ConfirmResetModal } from '@/components/form/shared';

interface MemberFormResetOptions {
    onReset: () => void | Promise<void>;
    hasUnsavedChanges?: () => boolean;
}

/**
 * Simple hook for member form reset confirmation
 * Shows confirmation dialog and calls your reset callback
 */
export const useMemberFormReset = ({
    onReset,
    hasUnsavedChanges
}: MemberFormResetOptions) => {

    const showResetConfirmation = useCallback(async () => {
        const hasChanges = hasUnsavedChanges ? hasUnsavedChanges() : true;

        try {
            await NiceModal.show(ConfirmResetModal, {
                title: "Reset Member Form",
                formName: "member registration form",
                message: "All member information you've entered will be lost and you'll be redirected to the members list.",
                hasUnsavedChanges: hasChanges,
                onReset: async () => {
                    try {
                        await onReset();
                        return true;
                    } catch (error) {
                        console.error('Reset failed:', error);
                        return false;
                    }
                }
            });
        } catch (error) {
            // Modal was cancelled
            console.log('Reset cancelled');
        }
    }, [onReset, hasUnsavedChanges]);

    return {
        showResetConfirmation
    };
};