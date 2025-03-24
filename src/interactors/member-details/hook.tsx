import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { MemberManager } from '@/managers/member';
import { MemberDetailsUIState, LoadingState, SuccessState, ErrorState } from './types';

/**
 * Custom hook for managing member details
 */
export const useMemberDetails = (memberId?: string): MemberDetailsUIState => {
    const [state, setState] = useState<MemberDetailsUIState>(new LoadingState());
    const navigate = useNavigate();

    // Load member data
    const loadMember = async (id?: string) => {
        console.log("member id: ", memberId)
        try {
            setState(new LoadingState());
            const targetId = id || memberId;

            if (!targetId) {
                throw new Error('Member ID is required');
            }

            const response = await MemberManager.instance.getMemberByID(targetId);

            if (!response) {
                throw new Error('Member not found');
            }

            setState(new SuccessState(response, {
                loadMember,
                deleteMember
            }));
        } catch (error) {
            console.error('Error loading member:', error);
            setState(new ErrorState((error as Error).message || 'Failed to load member details'));
        }
    };

    // Delete member
    const deleteMember = async () => {
        try {
            if (!memberId) {
                throw new Error('Member ID is required');
            }

            await MemberManager.instance.deleteMember(memberId);
            message.success('Member has been deleted');
            navigate('/members');
        } catch (error) {
            console.error('Error deleting member:', error);
            message.error('Failed to delete member: ' + ((error as Error).message || 'Unknown error'));
        }
    };

    // Initialize state with actions on first render
    useEffect(() => {
        if (!state) {
            setState(new LoadingState());
        }
    }, [loadMember, deleteMember]);

    // Load member data when memberId changes or on initial render
    useEffect(() => {
        if (memberId && state) {
            loadMember(memberId);
        }
    }, [memberId, state]);

    // Return loading state with actions if state is not yet initialized
    return state || new LoadingState();
};