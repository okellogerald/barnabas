import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Modal, Table, Input, Space, Alert, Tag, Button, Typography, TableColumnType } from 'antd';
import { UserOutlined, SearchOutlined, CheckOutlined } from '@ant-design/icons';
import { AsyncStateMatcher } from '@/lib/state';
import { Member } from '@/models';
import { MemberQueries } from '@/data/member/member.queries';
import { mapQueryToAsyncState, SuccessState, UI_STATE_TYPE } from '@/lib/state';
import { MemberQueryCriteria } from '@/data/member';

const { Text } = Typography;

// Success state for member selection
class MemberSelectionSuccessState extends SuccessState<{
    members: Member[];
    total: number;
}> {
    readonly members: Member[];
    readonly total: number;
    readonly searchTerm: string;
    readonly loading: boolean;
    readonly selectedMembers: Member[];
    readonly selectionMode: 'single' | 'multiple';

    constructor(args: {
        data: {
            members: Member[];
            total: number;
        };
        searchTerm: string;
        loading: boolean;
        selectedMembers: Member[];
        selectionMode: 'single' | 'multiple';
        actions: {
            refresh: () => void;
            search: (term: string) => void;
            toggleSelection: (member: Member) => void;
            clearSelection: () => void;
        };
    }) {
        super(args.data, { refresh: args.actions.refresh });
        this.members = args.data.members;
        this.total = args.data.total;
        this.searchTerm = args.searchTerm;
        this.loading = args.loading;
        this.selectedMembers = args.selectedMembers;
        this.selectionMode = args.selectionMode;
        this._search = args.actions.search;
        this._toggleSelection = args.actions.toggleSelection;
        this._clearSelection = args.actions.clearSelection;
    }

    private _search: (term: string) => void;
    private _toggleSelection: (member: Member) => void;
    private _clearSelection: () => void;

    search(term: string): void {
        this._search(term);
    }

    toggleSelection(member: Member): void {
        this._toggleSelection(member);
    }

    clearSelection(): void {
        this._clearSelection();
    }

    isSelected(member: Member): boolean {
        return this.selectedMembers.some(selected => selected.id === member.id);
    }

    static is(state: any): state is MemberSelectionSuccessState {
        return (
            state.type === UI_STATE_TYPE.SUCCESS &&
            "members" in state &&
            "total" in state &&
            "selectedMembers" in state
        );
    }
}

// Table columns generator function
const getColumns = (selectionMode: 'single' | 'multiple', selectedMembers: Member[]): TableColumnType<Member>[] => [
    {
        title: 'Name',
        key: 'name',
        render: (member: Member) => {
            try {
                return (
                    <Space>
                        <UserOutlined />
                        <span>{member.getFullName?.() || 'Unknown'}</span>
                    </Space>
                );
            } catch (error) {
                console.warn('Error rendering member name:', error);
                return (
                    <Space>
                        <UserOutlined />
                        <span>Unknown</span>
                    </Space>
                );
            }
        },
    },
    {
        title: 'Phone',
        dataIndex: 'phoneNumber',
        key: 'phone',
        render: (phoneNumber: string) => phoneNumber || 'Not provided',
    },
    {
        title: 'Fellowship',
        key: 'fellowship',
        render: (member: Member) => {
            try {
                return member.fellowship?.name || 'None';
            } catch (error) {
                console.warn('Error rendering fellowship info:', error);
                return 'N/A';
            }
        },
    },
    {
        title: 'Envelope',
        key: 'envelope',
        render: (member: Member) => {
            try {
                return member.envelopeNumber ? (
                    <Tag color="blue">{member.getEnvelopeNumber?.() || 'N/A'}</Tag>
                ) : (
                    <Tag color="default">None</Tag>
                );
            } catch (error) {
                console.warn('Error rendering envelope info:', error);
                return <Tag color="default">N/A</Tag>;
            }
        },
    },
    // Add selection indicator column for multiple mode
    ...(selectionMode === 'multiple' ? [{
        title: '',
        key: 'selected',
        width: 50,
        render: (member: Member) => {
            try {
                const isSelected = selectedMembers.some(selected => selected?.id === member?.id);
                return isSelected ? <CheckOutlined style={{ color: '#52c41a' }} /> : null;
            } catch (error) {
                console.warn('Error rendering selection indicator:', error);
                return null;
            }
        },
    }] : [])
];

interface MemberSelectorProps {
    visible: boolean;
    onCancel: () => void;
    // For single selection
    onSelect?: (member: Member) => void;
    // For multiple selection
    onSelectMultiple?: (members: Member[]) => void;
    // Selection mode
    mode?: 'single' | 'multiple';
    // Pre-selected members (for multiple mode)
    selectedMembers?: Member[];
    // Filter options
    filter?: {
        hasEnvelope?: boolean;
        fellowshipId?: string;
    };
    // UI customization
    title?: string;
    maxSelections?: number;
}

export const MemberSelector: React.FC<MemberSelectorProps> = ({
    visible,
    onCancel,
    onSelect,
    onSelectMultiple,
    mode = 'single',
    selectedMembers: initialSelectedMembers = [],
    filter = {},
    title = 'Select Member',
    maxSelections
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
    const pageSize = 5;

    // Reset selected members when modal opens/closes or initial selection changes
    // Use a ref to track if we should update to prevent infinite loops
    const shouldUpdateSelection = useMemo(() => {
        if (!visible) return false;
        if (initialSelectedMembers.length !== selectedMembers.length) return true;
        return !initialSelectedMembers.every(initial => 
            selectedMembers.some(selected => selected.id === initial.id)
        );
    }, [visible, initialSelectedMembers, selectedMembers]);

    useEffect(() => {
        if (shouldUpdateSelection) {
            setSelectedMembers([...initialSelectedMembers]);
        }
    }, [shouldUpdateSelection, initialSelectedMembers]);

    // Memoize query parameters to prevent unnecessary re-renders
    const queryParams = useMemo((): MemberQueryCriteria => ({
        page: currentPage,
        pageSize,
        ...(filter.hasEnvelope === false ? { hasEnvelope: false } : filter.hasEnvelope === true ? { hasEnvelope: true } : {}),
        ...(filter.fellowshipId ? { fellowshipId: filter.fellowshipId } : {}),
        ...(searchTerm ? { searchTerm } : {})
    }), [currentPage, pageSize, filter.hasEnvelope, filter.fellowshipId, searchTerm]);

    // Query for members
    const memberQuery = MemberQueries.usePaginatedList(queryParams);

    // Memoized callbacks to prevent re-renders
    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    }, []);

    const toggleMemberSelection = useCallback((member: Member) => {
        if (mode === 'single') {
            // Single selection - immediately call onSelect
            if (onSelect) {
                onSelect(member);
            }
            return;
        }

        // Multiple selection logic
        setSelectedMembers(prev => {
            const isAlreadySelected = prev.some(selected => selected.id === member.id);
            
            if (isAlreadySelected) {
                // Remove from selection
                return prev.filter(selected => selected.id !== member.id);
            } else {
                // Add to selection (check max limit)
                if (maxSelections && prev.length >= maxSelections) {
                    return prev; // Don't add if max reached
                }
                return [...prev, member];
            }
        });
    }, [mode, onSelect, maxSelections]);

    const clearSelection = useCallback(() => {
        setSelectedMembers([]);
    }, []);

    const handleConfirmSelection = useCallback(() => {
        if (mode === 'multiple' && onSelectMultiple) {
            onSelectMultiple([...selectedMembers]);
        }
    }, [mode, onSelectMultiple, selectedMembers]);

    // Memoize columns to prevent re-creation on every render
    const columns = useMemo(() => getColumns(mode, selectedMembers), [mode, selectedMembers]);

    // Member selection state
    const selectionState = useMemo(() => mapQueryToAsyncState(memberQuery, {
        loadingMessage: "Loading members...",
        onSuccess: (data) => {
            // Ensure data structure is correct
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid member data received');
            }
            
            const members = data.members;
            
            const total = data.total;

            return new MemberSelectionSuccessState({
                data: { members, total },
                searchTerm,
                loading: memberQuery.isRefetching,
                selectedMembers,
                selectionMode: mode,
                actions: {
                    refresh: memberQuery.refetch,
                    search: handleSearch,
                    toggleSelection: toggleMemberSelection,
                    clearSelection
                }
            });
        }
    }), [memberQuery, searchTerm, selectedMembers, mode, handleSearch, toggleMemberSelection, clearSelection]);

    // Memoize modal title
    const modalTitle = useMemo(() => {
        if (mode === 'multiple' && selectedMembers.length > 0) {
            const maxText = maxSelections ? ` (max ${maxSelections})` : '';
            return `${title} - ${selectedMembers.length} selected${maxText}`;
        }
        return title;
    }, [mode, selectedMembers.length, maxSelections, title]);

    // Memoize footer
    const modalFooter = useMemo(() => {
        if (mode === 'single') {
            return null; // No footer for single selection
        }

        return [
            <Button key="clear" onClick={clearSelection} disabled={selectedMembers.length === 0}>
                Clear Selection
            </Button>,
            <Button key="cancel" onClick={onCancel}>
                Cancel
            </Button>,
            <Button 
                key="confirm" 
                type="primary" 
                onClick={handleConfirmSelection}
                disabled={selectedMembers.length === 0}
            >
                Select ({selectedMembers.length})
            </Button>
        ];
    }, [mode, selectedMembers.length, clearSelection, onCancel, handleConfirmSelection]);

    // Memoize row event handlers
    const getRowProps = useCallback((record: Member) => {
        // Safety check for record
        if (!record || !record.id) {
            return {};
        }
        
        return {
            onClick: () => {
                try {
                    // Check if we can select (for multiple mode with max limit)
                    if (mode === 'multiple' && maxSelections) {
                        const isAlreadySelected = selectedMembers.some(selected => selected.id === record.id);
                        const wouldExceedLimit = !isAlreadySelected && selectedMembers.length >= maxSelections;
                        if (wouldExceedLimit) {
                            return; // Don't allow selection
                        }
                    }
                    toggleMemberSelection(record);
                } catch (error) {
                    console.error('Error handling member selection:', error);
                }
            },
            style: { 
                cursor: 'pointer',
                backgroundColor: selectedMembers.some(selected => selected.id === record.id) ? '#f6ffed' : undefined
            }
        };
    }, [mode, maxSelections, selectedMembers, toggleMemberSelection]);

    const getRowClassName = useCallback((record: Member) => {
        try {
            return selectedMembers.some(selected => selected.id === record.id) ? 'selected-row' : '';
        } catch (error) {
            console.warn('Error determining row selection state:', error);
            return '';
        }
    }, [selectedMembers]);

    return (
        <Modal
            title={modalTitle}
            open={visible}
            onCancel={onCancel}
            footer={modalFooter}
            width={800}
        >
            <AsyncStateMatcher
                state={selectionState}
                views={{
                    SuccessView: ({ state }) => {
                        if (!MemberSelectionSuccessState.is(state)) {
                            return null;
                        }

                        const { members, total } = state;

                        return (
                            <div>
                                <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                                    <Input.Search
                                        placeholder="Search by name or phone number"
                                        allowClear
                                        enterButton={<SearchOutlined />}
                                        onSearch={handleSearch}
                                    />
                                    
                                    {/* Show selection info for multiple mode */}
                                    {mode === 'multiple' && (
                                        <div>
                                            <Text type="secondary">
                                                {selectedMembers.length === 0 
                                                    ? "No members selected" 
                                                    : `${selectedMembers.length} member${selectedMembers.length !== 1 ? 's' : ''} selected`
                                                }
                                                {maxSelections && ` (max ${maxSelections})`}
                                            </Text>
                                        </div>
                                    )}
                                </Space>

                                {members.length === 0 ? (
                                    <Alert
                                        type="info"
                                        message="No members found"
                                        description="Try changing your search criteria"
                                        showIcon
                                    />
                                ) : (
                                    <Table
                                        columns={columns}
                                        dataSource={members}
                                        rowKey="id"
                                        pagination={{
                                            current: currentPage,
                                            pageSize,
                                            total,
                                            onChange: setCurrentPage,
                                            showSizeChanger: false
                                        }}
                                        loading={state.loading}
                                        onRow={getRowProps}
                                        rowClassName={getRowClassName}
                                    />
                                )}
                            </div>
                        );
                    }
                }}
            />
            
            <style>{`
                .selected-row {
                    background-color: #f6ffed !important;
                }
                .selected-row:hover {
                    background-color: #d9f7be !important;
                }
            `}</style>
        </Modal>
    );
};