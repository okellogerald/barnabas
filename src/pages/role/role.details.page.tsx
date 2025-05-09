import React from 'react';
import {
    Card,
    Typography,
    Button,
    Space,
    Row,
    Col,
    Divider,
    Descriptions,
    Tag,
    Alert,
    Empty
} from 'antd';
import {
    ArrowLeftOutlined,
    ReloadOutlined,
    KeyOutlined,
    LockOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { useRoleDetails, RoleDetailsSuccessState } from '@/features/role/role-details';
import { AsyncStateMatcher } from '@/lib/state/async_state.matcher';

const { Title, Text } = Typography;

/**
 * Role Details Page
 * 
 * Displays details of a specific system role and its associated actions.
 * Note: Roles are predefined and cannot be modified.
 */
const RoleDetailsPage: React.FC = () => {
    // Get data and actions from hook
    const { roleState, uiActions } = useRoleDetails();

    // Render role details when data is loaded
    const renderRoleDetails = () => {
        if (!RoleDetailsSuccessState.is(roleState)) return null;

        const role = roleState.data;
        const roleActions = roleState.roleActions;

        return (
            <div className="role-details-page">
                {/* Main Details Card */}
                <Card>
                    <Row gutter={[0, 16]}>
                        {/* Page Header with Actions */}
                        <Col span={24}>
                            <Row justify="space-between" align="middle">
                                <Col>
                                    <Title level={3}>
                                        {role.name}
                                        <Tag color="blue" style={{ marginLeft: 8 }}>
                                            System Role
                                        </Tag>
                                    </Title>
                                    <Text type="secondary">
                                        Role ID: {role.id}
                                    </Text>
                                </Col>
                                <Col>
                                    <Space>
                                        <Button
                                            icon={<ArrowLeftOutlined />}
                                            onClick={uiActions.back}
                                        >
                                            Back to Roles
                                        </Button>

                                        <Button
                                            icon={<ReloadOutlined />}
                                            onClick={uiActions.refresh}
                                        >
                                            Refresh
                                        </Button>
                                    </Space>
                                </Col>
                            </Row>
                        </Col>

                        {/* Read-only Notice */}
                        <Col span={24}>
                            <Alert
                                message="System Role - Read Only"
                                description="Roles are predefined in the system and cannot be modified. Each role has specific actions that determine what users with that role can do."
                                type="info"
                                showIcon
                                icon={<LockOutlined />}
                            />
                        </Col>

                        {/* Role Information Section */}
                        <Col span={24}>
                            <Divider orientation="left">Role Information</Divider>
                            <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
                                <Descriptions.Item label="Name">{role.name}</Descriptions.Item>
                                <Descriptions.Item label="Church ID">{role.churchId}</Descriptions.Item>
                                <Descriptions.Item label="Description" span={2}>
                                    {role.getDescription ? role.getDescription() : role.description || 'No description available'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Created At">
                                    {role.createdAt.toLocaleString()}
                                </Descriptions.Item>
                                <Descriptions.Item label="Last Updated">
                                    {role.updatedAt.toLocaleString()}
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>

                        {/* Role Actions Section */}
                        <Col span={24}>
                            <Divider orientation="left">Role Actions</Divider>
                            <Card
                                title={<Space><KeyOutlined /> Allowed Actions</Space>}
                                extra={<Text type="secondary">These define what users with this role can do</Text>}
                                variant={"outlined"}
                            >
                                {roleState.isLoading ? (
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <Text>Loading actions...</Text>
                                    </div>
                                ) : roleActions && roleActions.length > 0 ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {roleActions.map(action => (
                                            <Tag key={action.id} color="blue">
                                                {action.action}
                                            </Tag>
                                        ))}
                                    </div>
                                ) : (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description="No specific actions defined for this role"
                                    />
                                )}
                            </Card>

                            <div style={{ marginTop: 16 }}>
                                <Text type="secondary">
                                    <InfoCircleOutlined style={{ marginRight: 8 }} />
                                    Actions determine what operations users with this role can perform in the system.
                                    For example, a user with the "user.create" action can create new users.
                                </Text>
                            </div>
                        </Col>
                    </Row>
                </Card>
            </div>
        );
    };

    // Use AsyncStateMatcher to handle loading, error states
    return (
        <AsyncStateMatcher
            state={roleState}
            views={{
                SuccessView: () => renderRoleDetails()
            }}
        />
    );
};

export default RoleDetailsPage;