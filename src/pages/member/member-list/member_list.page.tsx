import React from "react";
import { Button, Typography, Flex, Tag, Space, Divider } from "antd";
import { PlusOutlined, RedoOutlined } from "@ant-design/icons";
import { AsyncPageContentLayout } from "@/components/layouts";
import { MemberListPageUIState, MemberListSuccessState } from "@/interactors/member-list/types";
import { useMemberList } from "@/interactors/member-list/hook";
import {
    LazyMemberFilters,
    LazyFilterToggle,
    LazyMemberSorting,
} from "./lazy_components";
import { LazyLoadErrorBoundary } from "@/components";
import { UI_STATE_TYPE } from "@/interactors/_state";

const { Title } = Typography;

const MembersHeader: React.FC<{ state: MemberListPageUIState }> = ({ state }) => {
    if (state.type !== UI_STATE_TYPE.success) return null;

    const { actions } = state;

    const handleApplyFilters = () => {
        actions.table.refresh();
    };

    return (
        <Flex vertical gap="middle" style={{ width: '100%' }}>
            {/* Title and primary actions */}
            <Flex justify="space-between" align="center">
                <Title level={4} style={{ margin: 0 }}>
                    Church Members
                    {state.table.memberCount > 0 && (
                        <Tag color="blue" style={{ marginLeft: 8 }}>
                            {state.table.memberCount} total
                        </Tag>
                    )}
                </Title>

                <Space size="middle">
                    <LazyLoadErrorBoundary>
                        <LazyFilterToggle />
                    </LazyLoadErrorBoundary>

                    <Button
                        onClick={actions.table.refresh}
                        icon={<RedoOutlined />}
                    >
                        Refresh
                    </Button>

                    <Button
                        onClick={actions.addNew}
                        type="primary"
                        icon={<PlusOutlined />}
                    >
                        Add Member
                    </Button>
                </Space>
            </Flex>

            {/* Filter panel - only shown when toggled */}
            {state.table.filters.filtersVisible && (
                <LazyLoadErrorBoundary>
                    <LazyMemberFilters onApplyFilters={handleApplyFilters} />
                </LazyLoadErrorBoundary>
            )}

            {/* Always show sorting */}
            <Flex justify="flex-end" align="center">
                <LazyLoadErrorBoundary>
                    <LazyMemberSorting />
                </LazyLoadErrorBoundary>
            </Flex>

            <Divider style={{ margin: '0 0 12px 0' }} />
        </Flex>
    );
};

const SuccessView: React.FC<{ state: MemberListSuccessState }> = ({ state }) => {
    return state.table.render()
};

export const MemberListPage: React.FC = () => {
    const state = useMemberList();

    return (
        <AsyncPageContentLayout
            state={state}
            SuccessView={SuccessView}
            header={<MembersHeader state={state} />}
        />
    );
};

export default MemberListPage;