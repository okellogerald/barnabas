import React from 'react';
import {
    Card,
    Typography,
    Button,
    Space,
    Row,
    Col,
    Tag,
    Alert,
    Empty,
    Flex
} from 'antd';
import {
    ArrowLeftOutlined,
    ReloadOutlined,
    KeyOutlined,
    LockOutlined,
    InfoCircleOutlined,
    CalendarOutlined,
    FileTextOutlined
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
                    {/* Page Header with Actions */}
                    <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                        <Col>
                            <Flex align="center" gap={8}>
                                <Title level={3} style={{ margin: 0 }}>
                                    {role.name}
                                </Title>
                                <Tag color="blue">System Role</Tag>
                            </Flex>
                            <Text type="secondary">ID: {role.id}</Text>
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

                    {/* Read-only Notice */}
                    <Alert
                        message="System Role - Read Only"
                        description="Roles are predefined in the system and cannot be modified. Each role has specific actions that determine what users with that role can do."
                        type="info"
                        showIcon
                        banner
                        icon={<LockOutlined />}
                        style={{ marginBottom: 24 }}
                    />

                    {/* Role Information Section - Refined */}
                    <Card 
                        title={<Flex align="center" gap={8}><FileTextOutlined /> Role Information</Flex>}
                        style={{ marginBottom: 24 }}
                        variant='outlined'
                        className="inner-card"
                    >
                        <Row gutter={[24, 16]}>
                            <Col xs={24} md={12}>
                                <Flex vertical gap={4}>
                                    <Text type="secondary">Name</Text>
                                    <Text strong>{role.name}</Text>
                                </Flex>
                            </Col>
                            <Col xs={24} md={12}>
                                <Flex vertical gap={4}>
                                    <Text type="secondary">Church ID</Text>
                                    <Text copyable>{role.churchId}</Text>
                                </Flex>
                            </Col>
                            <Col span={24}>
                                <Flex vertical gap={4}>
                                    <Text type="secondary">Description</Text>
                                    <Text>
                                        {role.getDescription ? role.getDescription() : role.description || 'No description available'}
                                    </Text>
                                </Flex>
                            </Col>
                            
                            <Col xs={24} md={12}>
                                <Flex vertical gap={4}>
                                    <Text type="secondary"><CalendarOutlined /> Created At</Text>
                                    <Text>{role.createdAt.toLocaleString()}</Text>
                                </Flex>
                            </Col>
                            <Col xs={24} md={12}>
                                <Flex vertical gap={4}>
                                    <Text type="secondary"><CalendarOutlined /> Last Updated</Text>
                                    <Text>{role.updatedAt.toLocaleString()}</Text>
                                </Flex>
                            </Col>
                        </Row>
                    </Card>

                    {/* Role Actions Section - Refined */}
                    <Card 
                        title={<Flex align="center" gap={8}><KeyOutlined /> Allowed Actions</Flex>}
                        extra={<Text type="secondary">These define what users with this role can do</Text>}
                        variant='outlined'
                        className="inner-card"
                    >
                        {roleState.isLoading ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <Text>Loading actions...</Text>
                            </div>
                        ) : roleActions && roleActions.length > 0 ? (
                            <Flex gap={8} wrap="wrap">
                                {roleActions.map(action => (
                                    <Tag key={action.id} color="blue">
                                        {action.action}
                                    </Tag>
                                ))}
                            </Flex>
                        ) : (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="No specific actions defined for this role"
                            />
                        )}
                        
                        <Flex align="center" gap={8} style={{ marginTop: 16 }}>
                            <InfoCircleOutlined style={{ color: '#1890ff' }} />
                            <Text type="secondary">
                                Actions determine what operations users with this role can perform in the system.
                                For example, a user with the "user.create" action can create new users.
                            </Text>
                        </Flex>
                    </Card>
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