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
  Modal,
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
  InfoCircleOutlined
} from '@ant-design/icons';
import { AsyncStateMatcher } from '@/lib/state/async_state.matcher';
import { isSuccessState } from '@/lib/state';
import { AuthManager } from '@/managers/auth';
import { Actions } from '@/managers/auth/permission';
import { useUserDetails } from '@/features/user/user-details';

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

  // Check permissions
  const canEditUser = AuthManager.instance.hasPermission(Actions.USER_UPDATE);
  const canDeleteUser = AuthManager.instance.hasPermission(Actions.USER_DELETE);
  
  // Render user details when data is loaded
  const renderUserDetails = () => {
    if (!isSuccessState(userState)) return null;

    const user = userState.data;
    
    return (
      <div className="user-details-page">
        {/* Main Details Card */}
        <Card>
          <Row gutter={[0, 16]}>
            {/* Page Header with Actions */}
            <Col span={24}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={3}>
                    {user.name}
                    {!user.isActive && (
                      <Tag color="orange" style={{ marginLeft: 8 }}>Inactive</Tag>
                    )}
                    {user.isDeleted && (
                      <Tag color="red" style={{ marginLeft: 8 }}>Deleted</Tag>
                    )}
                  </Title>
                  <Text type="secondary">
                    {user.getRoleName()}
                  </Text>
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
                    
                    {canEditUser && !user.isDeleted && (
                      <Button 
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={actions.edit}
                      >
                        Edit User
                      </Button>
                    )}
                    
                    {canDeleteUser && !user.isDeleted && (
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
            </Col>
            
            {/* User Information Section */}
            <Col span={24}>
              <Divider orientation="left">User Information</Divider>
              <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
                <Descriptions.Item label="Name">{user.name}</Descriptions.Item>
                <Descriptions.Item label="Email">
                  <Space>
                    <MailOutlined />
                    {user.email}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Phone Number">
                  {user.phoneNumber ? (
                    <Space>
                      <PhoneOutlined />
                      {user.phoneNumber}
                    </Space>
                  ) : (
                    <Text type="secondary">Not provided</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {user.isDeleted ? (
                    <Tag color="red" icon={<LockOutlined />}>Deleted</Tag>
                  ) : (
                    user.isActive ? 
                      <Tag color="green" icon={<UnlockOutlined />}>Active</Tag> : 
                      <Tag color="orange" icon={<LockOutlined />}>Inactive</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Role">
                  <Tag color="blue">{user.getRoleName()}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  {user.createdAt.toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated">
                  {user.updatedAt.toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            
            {/* Role Information Section */}
            <Col span={24}>
              <Divider orientation="left">Role & Permissions</Divider>
              <Card title={user.getRoleName()} bordered={false}>
                {roleState.isLoading ? (
                  <Text>Loading role information...</Text>
                ) : roleState.data ? (
                  <div>
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <Text type="secondary">Role Description:</Text>
                        <Paragraph>{roleState.data.getDescription()}</Paragraph>
                      </Col>
                      
                      {roleState.data.permissions && roleState.data.permissions.length > 0 && (
                        <Col span={24}>
                          <Text type="secondary">Permissions:</Text>
                          <div style={{ marginTop: 8 }}>
                            {roleState.data.permissions.map((permission: string) => (
                              <Tag key={permission} style={{ margin: '0 8px 8px 0' }}>
                                {permission}
                              </Tag>
                            ))}
                          </div>
                        </Col>
                      )}
                    </Row>
                  </div>
                ) : (
                  <Text type="secondary">No detailed role information available</Text>
                )}
              </Card>
            </Col>
          </Row>
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