import React from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Row,
  Col,
  Tag,
  Modal,
  Flex
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  UnlockOutlined,
  InfoCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined,
  KeyOutlined
} from '@ant-design/icons';
import { AsyncStateMatcher } from '@/lib/state';
import { UserDetailsSuccessState, useUserDetails } from '@/hooks/user';

const { Title, Text, Paragraph } = Typography;

/**
 * User Details Page
 * 
 * Displays details of a specific system user and provides actions to manage it
 */
const UserDetailsPage: React.FC = () => {
  // Get data and actions from hook
  const {
    userState,
    roleState,
    isDeleting,
    deleteModalVisible,
    actions
  } = useUserDetails();

  // Render user details when data is loaded
  const renderUserDetails = () => {
    if (!UserDetailsSuccessState.is(userState)) return null;

    const user = userState.data;

    return (
      <div className="user-details-page">
        {/* Main Details Card */}
        <Card>
          {/* Page Header with Actions */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <Flex vertical gap={4}>
                <Flex align="center" gap={8}>
                  <Title level={3} style={{ margin: 0 }}>
                    {user.name}
                  </Title>
                  {!user.isActive && (
                    <Tag color="orange">Inactive</Tag>
                  )}
                  {user.isDeleted && (
                    <Tag color="red">Deleted</Tag>
                  )}
                </Flex>
                <Text type="secondary">
                  {user.getRoleName()}
                </Text>
              </Flex>
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={actions.back}
                >
                  Back to List
                </Button>

                <Button
                  icon={<ReloadOutlined />}
                  onClick={actions.refresh}
                >
                  Refresh
                </Button>

                {userState.canEditUser && !user.isDeleted && (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={actions.edit}
                  >
                    Edit User
                  </Button>
                )}

                {userState.canDeleteUser && !user.isDeleted && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={actions.confirmDelete}
                    loading={isDeleting}
                  >
                    Delete
                  </Button>
                )}
              </Space>
            </Col>
          </Row>

          {/* User Information Section */}
          <Card
            title={<Flex align="center" gap={8}><UserOutlined /> User Information</Flex>}
            style={{ marginBottom: 24 }}
            variant="outlined"
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} md={8}>
                <Flex vertical gap={4}>
                  <Text type="secondary">Name</Text>
                  <Text strong>{user.name}</Text>
                </Flex>
              </Col>

              <Col xs={24} md={8}>
                <Flex vertical gap={4}>
                  <Text type="secondary">Email</Text>
                  <Flex align="center" gap={8}>
                    <MailOutlined />
                    <Text copyable>{user.email}</Text>
                  </Flex>
                </Flex>
              </Col>

              <Col xs={24} md={8}>
                <Flex vertical gap={4}>
                  <Text type="secondary">Phone Number</Text>
                  {user.phoneNumber ? (
                    <Flex align="center" gap={8}>
                      <PhoneOutlined />
                      <Text>{user.phoneNumber}</Text>
                    </Flex>
                  ) : (
                    <Text type="secondary">Not provided</Text>
                  )}
                </Flex>
              </Col>

              <Col xs={24} md={8}>
                <Flex vertical gap={4}>
                  <Text type="secondary">Status</Text>
                  <div>
                    {user.isDeleted ? (
                      <Tag color="red" icon={<LockOutlined />}>Deleted</Tag>
                    ) : (
                      user.isActive ?
                        <Tag color="green" icon={<UnlockOutlined />}>Active</Tag> :
                        <Tag color="orange" icon={<LockOutlined />}>Inactive</Tag>
                    )}
                  </div>
                </Flex>
              </Col>

              <Col xs={24} md={8}>
                <Flex vertical gap={4}>
                  <Text type="secondary">Role</Text>
                  <Flex align="center" gap={8}>
                    <Tag color="blue">{user.getRoleName()}</Tag>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      (Predefined system role)
                    </Text>
                  </Flex>
                </Flex>
              </Col>

              <Col xs={24} md={8}>
                <Flex vertical gap={4}>
                  <Text type="secondary">Church ID</Text>
                  <Text copyable>{user.churchId}</Text>
                </Flex>
              </Col>

              <Col xs={24} md={8}>
                <Flex vertical gap={4}>
                  <Text type="secondary"><CalendarOutlined /> Created At</Text>
                  <Text>{user.createdAt.toLocaleString()}</Text>
                </Flex>
              </Col>

              <Col xs={24} md={8}>
                <Flex vertical gap={4}>
                  <Text type="secondary"><CalendarOutlined /> Last Updated</Text>
                  <Text>{user.updatedAt.toLocaleString()}</Text>
                </Flex>
              </Col>
            </Row>
          </Card>

          {/* Role Information Section */}
          <Card
            title={<Flex align="center" gap={8}><KeyOutlined /> Role & Permissions</Flex>}
            variant="outlined"
          >
            {roleState.loading ? (
              <Text>Loading role information...</Text>
            ) : roleState.role ? (
              <Row gutter={[16, 24]}>
                <Col span={24}>
                  <Flex vertical gap={8}>
                    <Flex align="center" gap={8}>
                      <FileTextOutlined />
                      <Text strong>Role Description</Text>
                    </Flex>
                    <Paragraph style={{ marginBottom: 0 }}>
                      {roleState.role.getDescription ? roleState.role.getDescription() : 'No description available'}
                    </Paragraph>
                    <Text type="secondary" italic style={{ fontSize: '12px' }}>
                      (Roles are predefined and cannot be modified)
                    </Text>
                  </Flex>
                </Col>

                <Col span={24}>
                  <Flex vertical gap={12}>
                    <Flex align="center" gap={8}>
                      <KeyOutlined />
                      <Text strong>Allowed Actions</Text>
                    </Flex>

                    {roleState.actions && roleState.actions.length > 0 ? (
                      <Flex gap={8} wrap="wrap">
                        {roleState.actions.map((action) => (
                          <Tag key={action.id} color="blue">
                            {action.action}
                          </Tag>
                        ))}
                      </Flex>
                    ) : (
                      <Text italic>No specific actions defined for this role</Text>
                    )}
                  </Flex>
                </Col>
              </Row>
            ) : (
              <Text type="secondary">No detailed role information available</Text>
            )}
          </Card>
        </Card>

        {/* Delete Confirmation Modal */}
        <Modal
          title={
            <Space>
              <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
              Confirm Deletion
            </Space>
          }
          open={deleteModalVisible}
          onOk={actions.delete}
          onCancel={actions.hideDeleteConfirm}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true, loading: isDeleting }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Paragraph>
              Are you sure you want to delete the user <Text strong>{user.name}</Text>?
            </Paragraph>

            <Paragraph type="warning">
              <InfoCircleOutlined /> This action will deactivate the user account and prevent them from accessing the system.
            </Paragraph>
          </Space>
        </Modal>
      </div>
    );
  };

  // Use AsyncStateMatcher to handle loading, error states
  return (
    <AsyncStateMatcher
      state={userState}
      views={{
        SuccessView: () => renderUserDetails()
      }}
    />
  );
};

export default UserDetailsPage;