import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { message, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { mapQueryToAsyncState, SuccessState, UI_STATE_TYPE } from "@/lib/state";
import { Fellowship } from "@/models";
import { FellowshipQueries } from "../queries";
import { Navigation } from "@/app";
import { MemberManager } from "@/managers/member";

/**
 * Custom success state for the fellowship details
 */
export class FellowshipDetailSuccessState extends SuccessState<Fellowship> {
    readonly memberCount: number | null;
    readonly deleteLoading: boolean;
    readonly isDeleteModalVisible: boolean;

    constructor(args: {
        data: Fellowship;
        memberCount: number | null;
        deleteLoading: boolean;
        isDeleteModalVisible: boolean;
        actions: {
            refresh: () => void;
            editFellowship: () => void;
            showDeleteConfirm: () => void;
            cancelDelete: () => void;
            confirmDelete: () => Promise<void>;
            viewMembers: () => void;
        };
    }) {
        super(args.data, { refresh: args.actions.refresh });
        this.memberCount = args.memberCount;
        this.deleteLoading = args.deleteLoading;
        this.isDeleteModalVisible = args.isDeleteModalVisible;
        this._editFellowship = args.actions.editFellowship;
        this._showDeleteConfirm = args.actions.showDeleteConfirm;
        this._cancelDelete = args.actions.cancelDelete;
        this._confirmDelete = args.actions.confirmDelete;
        this._viewMembers = args.actions.viewMembers;
    }

    private _editFellowship: () => void;
    private _showDeleteConfirm: () => void;
    private _cancelDelete: () => void;
    private _confirmDelete: () => Promise<void>;
    private _viewMembers: () => void;

    // Action methods
    editFellowship(): void {
        this._editFellowship();
    }

    showDeleteConfirm(): void {
        this._showDeleteConfirm();
    }

    cancelDelete(): void {
        this._cancelDelete();
    }

    async confirmDelete(): Promise<void> {
        return this._confirmDelete();
    }

    viewMembers(): void {
        this._viewMembers();
    }

    static is(state: any): state is FellowshipDetailSuccessState {
        return (
            state.type === UI_STATE_TYPE.SUCCESS &&
            'memberCount' in state &&
            'deleteLoading' in state &&
            'isDeleteModalVisible' in state
        );
    }
}

/**
 * Custom hook for fellowship details page
 */
export const useFellowshipDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [memberCount, setMemberCount] = useState<number | null>(null);

    // Fetch fellowship details
    const fellowshipDetailQuery = FellowshipQueries.useDetail(id || "");

    // Delete mutation
    const deleteMutation = FellowshipQueries.useDelete();

    // Fetch member count for this fellowship
    useEffect(() => {
        const fetchMemberCount = async () => {
            if (!id) return;

            try {
                const count = await MemberManager.instance.getMembersCount({ fellowshipId: id });
                setMemberCount(count);
            } catch (error) {
                console.error("Error fetching member count:", error);
                setMemberCount(0); // Fallback to 0 if there's an error
            }
        };

        fetchMemberCount();
    }, [id]);

    // Navigation actions
    const editFellowship = useCallback(() => {
        if (id) {
            Navigation.Fellowships.toEdit(id);
        }
    }, [id]);

    const viewMembers = useCallback(() => {
        if (id) {
            Navigation.Members.toList({ fellowshipId: id });
        }
    }, [id]);

    // Delete actions
    // const showDeleteConfirm = useCallback(() => {
    //     setIsDeleteModalVisible(true);
    // }, []);

    const cancelDelete = useCallback(() => {
        setIsDeleteModalVisible(false);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!id) return;

        setDeleteLoading(true);
        try {
            await deleteMutation.mutateAsync(id);
            message.success("Fellowship deleted successfully");
            Navigation.Fellowships.toList();
        } catch (error) {
            console.error("Error deleting fellowship:", error);
            message.error("Failed to delete fellowship");
        } finally {
            setDeleteLoading(false);
            setIsDeleteModalVisible(false);
        }
    }, [id, deleteMutation]);

    // Get confirmation from modal
    const showDeleteModal = useCallback(() => {
        Modal.confirm({
            title: 'Are you sure you want to delete this fellowship?',
            icon: <ExclamationCircleOutlined />,
            content: 'This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: confirmDelete,
        });
    }, [confirmDelete]);

    // Return the async state
    return mapQueryToAsyncState(fellowshipDetailQuery, {
        loadingMessage: "Loading fellowship details...",
        resourceType: "Fellowship",
        resourceId: id,
        onSuccess: (fellowship) => new FellowshipDetailSuccessState({
            data: fellowship,
            memberCount,
            deleteLoading,
            isDeleteModalVisible,
            actions: {
                refresh: fellowshipDetailQuery.refetch,
                editFellowship,
                showDeleteConfirm: showDeleteModal,
                cancelDelete,
                confirmDelete,
                viewMembers,
            },
        }),
    });
};