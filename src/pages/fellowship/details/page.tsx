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
  Tooltip,
  Spin,
  Modal,
  Empty
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserAddOutlined, 
  TeamOutlined,
  CalendarOutlined,
  PhoneOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useFellowshipDetails } from '@/features/fellowship/fellowship-details';
import { AsyncStateMatcher } from '@/lib/state/async_state.matcher';
import { isSuccessState } from '@/lib/state';
import { AuthManager } from '@/managers/auth';
import { Actions } from '@/managers/auth/permission';

const { Title, Text, Paragraph } = Typography;

/**
 * Fellowship Details Page
 * 
 * Displays details of a specific fellowship and provides actions to manage it
 */
const FellowshipDetailsPage: React.FC = () => {
  // Get data and actions from hook
  const { 
    fellowshipState, 
    membersCount, 
    membersCountLoading,
    isDeleting,
    deleteModalVisible,
    actions
  } = useFellowshipDetails();

  // Check permissions
  const canEdit = AuthManager.instance.hasPermission(Actions.FELLOWSHIP_UPDATE);
  const canDelete = AuthManager.instance.hasPermission(Actions.FELLOWSHIP_DELETE_BY_ID);
  const canAddMembers = AuthManager.instance.hasPermission(Actions.MEMBER_CREATE);
  
  // Render fellowship details when data is loaded
  const renderFellowshipDetails = () => {
    if (!isSuccessState(fellowshipState)) return null;

    const fellowship = fellowshipState.data;
    
    return (
      <div className="fellowship-details-page">
        {/* Main Details Card */}
        <Card>
          <Row gutter={[0, 16]}>
            {/* Page Header with Actions */}
            <Col span={24}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={3}>{fellowship.name}</Title>
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
                    
                    {canEdit && (
                      <Button 
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={actions.edit}
                      >
                        Edit Fellowship
                      </Button>
                    )}
                    
                    {canDelete && (
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
            
            {/* Basic Details Section */}
            <Col span={24}>
              <Divider orientation="left">Details</Divider>
              <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
                <Descriptions.Item label="Name">{fellowship.name}</Descriptions.Item>
                <Descriptions.Item label="Leadership Status">
                  {fellowship.hasLeadership() ? (
                    <Tag color="green">Has Leadership</Tag>
                  ) : (
                    <Tag color="orange">No Leadership</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Members">
                  {membersCountLoading ? (
                    <Spin size="small" />
                  ) : (
                    <>{membersCount} member{membersCount !== 1 ? 's' : ''}</>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  <Space>
                    <CalendarOutlined />
                    {fellowship.createdAt.toLocaleDateString()}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated">
                  <Space>
                    <CalendarOutlined />
                    {fellowship.updatedAt.toLocaleDateString()}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Col>
            
            {/* Notes Section */}
            {fellowship.notes && (
              <Col span={24}>
                <Divider orientation="left">Notes</Divider>
                <Paragraph>{fellowship.notes}</Paragraph>
              </Col>
            )}
            
            {/* Leadership Section */}
            <Col span={24}>
              <Divider orientation="left">
                <Space>
                  <TeamOutlined />
                  Leadership
                </Space>
              </Divider>
              
              {!fellowship.hasLeadership() ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span>
                      No leadership roles assigned yet
                      {canEdit && (
                        <div style={{ marginTop: 8 }}>
                          <Button type="primary" size="small" onClick={actions.edit}>
                            Assign Leadership
                          </Button>
                        </div>
                      )}
                    </span>
                  }
                />
              ) : (
                <Row gutter={[16, 16]}>
                  {/* Chairman */}
                  {fellowship.chairman && (
                    <Col xs={24} sm={12} md={6}>
                      <Card size="small" title="Chairman" bordered>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Text strong>{fellowship.chairman.getFullName()}</Text>
                          {fellowship.chairman.phoneNumber && (
                            <Space>
                              <PhoneOutlined />
                              <Text>{fellowship.chairman.phoneNumber}</Text>
                            </Space>
                          )}
                        </Space>
                      </Card>
                    </Col>
                  )}
                  
                  {/* Deputy Chairman */}
                  {fellowship.deputyChairman && (
                    <Col xs={24} sm={12} md={6}>
                      <Card size="small" title="Deputy Chairman" bordered>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Text strong>{fellowship.deputyChairman.getFullName()}</Text>
                          {fellowship.deputyChairman.phoneNumber && (
                            <Space>
                              <PhoneOutlined />
                              <Text>{fellowship.deputyChairman.phoneNumber}</Text>
                            </Space>
                          )}
                        </Space>
                      </Card>
                    </Col>
                  )}
                  
                  {/* Secretary */}
                  {fellowship.secretary && (
                    <Col xs={24} sm={12} md={6}>
                      <Card size="small" title="Secretary" bordered>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Text strong>{fellowship.secretary.getFullName()}</Text>
                          {fellowship.secretary.phoneNumber && (
                            <Space>
                              <PhoneOutlined />
                              <Text>{fellowship.secretary.phoneNumber}</Text>
                            </Space>
                          )}
                        </Space>
                      </Card>
                    </Col>
                  )}
                  
                  {/* Treasurer */}
                  {fellowship.treasurer && (
                    <Col xs={24} sm={12} md={6}>
                      <Card size="small" title="Treasurer" bordered>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Text strong>{fellowship.treasurer.getFullName()}</Text>
                          {fellowship.treasurer.phoneNumber && (
                            <Space>
                              <PhoneOutlined />
                              <Text>{fellowship.treasurer.phoneNumber}</Text>
                            </Space>
                          )}
                        </Space>
                      </Card>
                    </Col>
                  )}
                </Row>
              )}
            </Col>
            
            {/* Members Section */}
            <Col span={24}>
              <Divider orientation="left">
                <Space>
                  <TeamOutlined />
                  Members
                </Space>
              </Divider>
              
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card bordered={false} className="stats-card">
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Space direction="vertical" size="small">
                          <Text>Total Members</Text>
                          <Title level={2}>
                            {membersCountLoading ? <Spin size="small" /> : membersCount}
                          </Title>
                        </Space>
                      </Col>
                      <Col>
                        <Space>
                          {canAddMembers && (
                            <Tooltip title="Add a new member to this fellowship">
                              <Button 
                                type="primary"
                                icon={<UserAddOutlined />}
                                onClick={actions.addMember}
                              >
                                Add Member
                              </Button>
                            </Tooltip>
                          )}
                          
                          <Tooltip title="View all members in this fellowship">
                            <Button
                              icon={<TeamOutlined />}
                              onClick={actions.viewMembers}
                            >
                              View All Members
                            </Button>
                          </Tooltip>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
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
              Are you sure you want to delete the fellowship <Text strong>{fellowship.name}</Text>?
            </Paragraph>
            
            <Paragraph type="warning">
              <InfoCircleOutlined /> This action cannot be undone. Members will remain in the system but will no longer be associated with this fellowship.
            </Paragraph>
          </Space>
        </Modal>
      </div>
    );
  };

  // Use AsyncStateMatcher to handle loading, error states
  return (
    <AsyncStateMatcher
      state={fellowshipState}
      views={{
        SuccessView: () => renderFellowshipDetails()
      }}
    />
  );
};

export default FellowshipDetailsPage;