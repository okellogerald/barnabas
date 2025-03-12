import React from "react";
import { Button, Input, Space, Typography, Card, Flex, Dropdown, Tag } from "antd";
import { PlusOutlined, FilterOutlined, SearchOutlined, DownOutlined, RedoOutlined } from "@ant-design/icons";
import { UI_STATE_TYPE } from "../../interactors/_state";
import { AsyncListLayout } from "@/components/layout";
import { MemberListPageUIState, MemberListPageUISuccessState } from "@/interactors/members/types";
import { useMemberList } from "@/interactors/members/hook";

const { Title, Text } = Typography;

const MembersHeader: React.FC<{ state: MemberListPageUIState }> = ({ state }) => {
    if (state.type !== UI_STATE_TYPE.success) return null;

    const { actions } = state;

    const filterMenu = {
        items: [
            {
                key: '1',
                label: 'All Members',
            },
            {
                key: '2',
                label: 'Baptized Members',
            },
            {
                key: '3',
                label: 'Fellowship Leaders',
            },
            {
                key: '4',
                label: 'New Members (Last 3 months)',
            },
        ],
    };

    return (
        <Flex vertical gap="middle" style={{ width: '100%' }}>
            <Flex justify="space-between" align="middle">
                <Title level={4}>Church Members <Tag color="blue">{130} total</Tag></Title>
                <Space>
                    <Button
                        onClick={actions.refresh}
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

            <Flex justify="space-between" align="middle">
                <Space>
                    <Dropdown menu={filterMenu}>
                        <Button icon={<FilterOutlined />}>
                            Filter <DownOutlined />
                        </Button>
                    </Dropdown>
                    <Input
                        placeholder="Search members..."
                        prefix={<SearchOutlined />}
                        style={{ width: 250 }}
                    //onChange={(e) => actions.search(e.target.value)}
                    />
                </Space>

                <Space>
                    <Text type="secondary">Fellowship:</Text>
                    <Dropdown menu={{
                        items: [
                            { key: 'all', label: 'All Fellowships' },
                            { key: 'tumaini', label: 'TUMAINI' },
                            // Add more fellowships dynamically
                        ]
                    }}>
                        <Button>
                            All Fellowships <DownOutlined />
                        </Button>
                    </Dropdown>
                </Space>
            </Flex>
        </Flex>
    );
};

const SuccessView: React.FC<{ state: MemberListPageUISuccessState }> = ({ state }) => {
    return (
        <Card>
            {state.renderTable()}
        </Card>
    );
};

export const MemberListPage: React.FC = () => {
    const state = useMemberList();

    return (
        <AsyncListLayout
            state={state}
            SuccessView={SuccessView}
            header={<MembersHeader state={state} />}
        />
    );
};

export default MemberListPage;