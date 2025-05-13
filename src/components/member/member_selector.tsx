import React, { useCallback } from 'react';
import { Modal, Table, Input, Space, Alert, Tag } from 'antd';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';
import { AsyncStateMatcher } from '@/lib/state';
import { Member } from '@/models';
import { MemberQueries } from '@/data/member/member.queries';
import { mapQueryToAsyncState, SuccessState, UI_STATE_TYPE } from '@/lib/state';
import { useState } from 'react';

// Success state for member selection
class MemberSelectionSuccessState extends SuccessState<{
    members: Member[];
    total: number;
}> {
    readonly members: Member[];
    readonly total: number;
    readonly searchTerm: string;
    readonly loading: boolean;

    constructor(args: {
        data: {
            members: Member[];
            total: number;
        };
        searchTerm: string;
        loading: boolean;
        actions: {
            refresh: () => void;
            search: (term: string) => void;
        };
    }) {
        super(args.data, { refresh: args.actions.refresh });
        this.members = args.data.members;
        this.total = args.data.total;
        this.searchTerm = args.searchTerm;
        this.loading = args.loading;
        this._search = args.actions.search;
    }

    private _search: (term: string) => void;

    search(term: string): void {
        this._search(term);
    }

    static is(state: any): state is MemberSelectionSuccessState {
        return (
            state.type === UI_STATE_TYPE.SUCCESS &&
            "members" in state &&
            "total" in state
        );
    }
}

interface MemberSelectorProps {
    visible: boolean;
    onCancel: () => void;
    onSelect: (member: Member) => void;
    filter?: {
        hasEnvelope?: boolean;
        fellowshipId?: string;
    };
}

export const MemberSelector: React.FC<MemberSelectorProps> = ({
    visible,
    onCancel,
    onSelect,
    filter = {}
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // Build query parameters
    const queryParams = {
        rangeStart: (currentPage - 1) * pageSize,
        rangeEnd: currentPage * pageSize - 1,
        ...(filter.hasEnvelope === false ? { "envelopeNumber:isNull": 1 } : filter.hasEnvelope === true ? { "envelopeNumber:isNotNull": 1 } : {}),
        ...(filter.fellowshipId ? { fellowshipId: filter.fellowshipId } : {}),
        ...(searchTerm ? { "firstName|lastName|phoneNumber:like": searchTerm } : {})
    };

    // Query for members
    const memberQuery = MemberQueries.useList(queryParams);

    // Handle search
    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    }, []);

    // Member selection state
    const selectionState = mapQueryToAsyncState(memberQuery, {
        loadingMessage: "Loading members...",
        onSuccess: (data) => {
            return new MemberSelectionSuccessState({
                data,
                searchTerm,
                loading: memberQuery.isRefetching,
                actions: {
                    refresh: memberQuery.refetch,
                    search: handleSearch
                }
            });
        }
    });

    // Table columns
    const columns = [
        {
            title: 'Name',
            key: 'name',
            render: (member: Member) => (
                <Space>
                    <UserOutlined />
                    <span>{member.getFullName()}</span>
                </Space>
            ),
        },
        {
            title: 'Phone',
            dataIndex: 'phoneNumber',
            key: 'phone',
        },
        {
            title: 'Fellowship',
            key: 'fellowship',
            render: (member: Member) => member.fellowship?.name || 'None',
        },
        {
            title: 'Envelope',
            key: 'envelope',
            render: (member: Member) => member.hasEnvelope() ? (
                <Tag color="blue">{member.getEnvelopeNumber()}</Tag>
            ) : (
                <Tag color="default">None</Tag>
            ),
        }
    ];

    return (
        <Modal
            title="Select Member"
            open={visible}
            onCancel={onCancel}
            footer={null}
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
                                        onSearch={value => state.search(value)}
                                    />
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
                                            onChange: page => setCurrentPage(page),
                                            showSizeChanger: false
                                        }}
                                        loading={state.loading}
                                        onRow={record => ({
                                            onClick: () => onSelect(record),
                                            style: { cursor: 'pointer' }
                                        })}
                                    />
                                )}
                            </div>
                        );
                    }
                }}
            />
        </Modal>
    );
};