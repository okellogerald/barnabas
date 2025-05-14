import React from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Row,
  Col,
  Tag,
  Tooltip,
  Spin,
  Modal,
  Empty,
  Flex
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
  ReloadOutlined,
  FileTextOutlined,
  FormOutlined,
  UserOutlined
} from '@ant-design/icons';
import { AsyncStateMatcher } from '@/lib/state';
import { isSuccessState } from '@/lib/state';
import { AuthenticationManager } from '@/data/authentication';
import { Actions } from '@/data/authorization';
import { useFellowshipDetails } from '@/hooks/fellowship';

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
  const canEdit = AuthenticationManager.instance.hasPermission(Actions.FELLOWSHIP_UPDATE);
  const canDelete = AuthenticationManager.instance.hasPermission(Actions.FELLOWSHIP_DELETE_BY_ID);
  const canAddMembers = AuthenticationManager.instance.hasPermission(Actions.MEMBER_CREATE);

  // Render fellowship details when data is loaded
  const renderFellowshipDetails = () => {
    if (!isSuccessState(fellowshipState)) return null;

    const fellowship = fellowshipState.data;

    return (
      <div className="fellowship-details-page">
        {/* Main Details Card */}
        <Card>
          {/* Page Header with Actions */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <Flex vertical gap={4}>
                <Title level={3} style={{ margin: 0 }}>{fellowship.name}</Title>
                <Flex align="center" gap={8}>
                  <Text type="secondary">
                    {fellowship.hasLeadership() ? (
                      <Tag color="green">Has Leadership</Tag>
                    ) : (
                      <Tag color="orange">No Leadership</Tag>
                    )}
                  </Text>
                  <Text type="secondary">
                    {membersCountLoading ? (
                      <Spin size="small" />
                    ) : (
                      <>{membersCount} member{membersCount !== 1 ? 's' : ''}</>
                    )}
                  </Text>
                </Flex>
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

          {/* Basic Details Section */}
          <Card
            title={<Flex align="center" gap={8}><FileTextOutlined /> Fellowship Details</Flex>}
            style={{ marginBottom: 24 }}
            variant="outlined"
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} md={8}>
                <Flex vertical gap={4}>
                  <Text type="secondary">Name</Text>
                  <Text strong>{fellowship.name}</Text>
                </Flex>
              </Col>

              <Col xs={24} md={8}>
                <Flex vertical gap={4}>
                  <Text type="secondary">Leadership Status</Text>
                  <div>
                    {fellowship.hasLeadership() ? (
                      <Tag color="green">Has Leadership</Tag>
                    ) : (
                      <Tag color="orange">No Leadership</Tag>
                    )}
                  </div>
                </Flex>
              </Col>

              <Col xs={24} md={8}>
                <Flex vertical gap={4}>
                  <Text type="secondary">Members</Text>
                  {membersCountLoading ? (
                    <Spin size="small" />
                  ) : (
                    <Text>{membersCount} member{membersCount !== 1 ? 's' : ''}</Text>
                  )}
                </Flex>
              </Col>

              <Col xs={24} md={8}>
                <Flex vertical gap={4}>
                  <Text type="secondary"><CalendarOutlined /> Created</Text>
                  <Text>{fellowship.createdAt.toLocaleDateString()}</Text>
                </Flex>
              </Col>

              <Col xs={24} md={8}>
                <Flex vertical gap={4}>
                  <Text type="secondary"><CalendarOutlined /> Last Updated</Text>
                  <Text>{fellowship.updatedAt.toLocaleDateString()}</Text>
                </Flex>
              </Col>

              {/* Notes Section */}
              {fellowship.notes && (
                <Col span={24}>
                  <Flex vertical gap={4} style={{ marginTop: 8 }}>
                    <Text type="secondary"><FormOutlined /> Notes</Text>
                    <Paragraph style={{ margin: 0 }}>{fellowship.notes}</Paragraph>
                  </Flex>
                </Col>
              )}
            </Row>
          </Card>

          {/* Leadership Section */}
          <Card
            title={<Flex align="center" gap={8}><TeamOutlined /> Leadership</Flex>}
            extra={canEdit && !fellowship.hasLeadership() && (
              <Button type="primary" icon={<EditOutlined />} onClick={actions.edit}>
                Assign Leadership
              </Button>
            )}
            style={{ marginBottom: 24 }}
            variant="outlined"
          >
            {!fellowship.hasLeadership() ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No leadership roles assigned yet"
              />
            ) : (
              <Row gutter={[16, 16]}>
                {/* Chairman */}
                {fellowship.chairman && (
                  <Col xs={24} sm={12} md={6}>
                    <Card
                      title={<Flex align="center" gap={8}><UserOutlined /> Chairman</Flex>}
                      variant="outlined"
                      size="small"
                      className="leadership-card"
                    >
                      <Flex vertical gap={8}>
                        <Text strong>{fellowship.chairman.getFullName()}</Text>
                        {fellowship.chairman.phoneNumber && (
                          <Flex align="center" gap={8}>
                            <PhoneOutlined />
                            <Text>{fellowship.chairman.phoneNumber}</Text>
                          </Flex>
                        )}
                      </Flex>
                    </Card>
                  </Col>
                )}

                {/* Deputy Chairman */}
                {fellowship.deputyChairman && (
                  <Col xs={24} sm={12} md={6}>
                    <Card
                      title={<Flex align="center" gap={8}><UserOutlined /> Deputy Chairman</Flex>}
                      variant="outlined"
                      size="small"
                      className="leadership-card"
                    >
                      <Flex vertical gap={8}>
                        <Text strong>{fellowship.deputyChairman.getFullName()}</Text>
                        {fellowship.deputyChairman.phoneNumber && (
                          <Flex align="center" gap={8}>
                            <PhoneOutlined />
                            <Text>{fellowship.deputyChairman.phoneNumber}</Text>
                          </Flex>
                        )}
                      </Flex>
                    </Card>
                  </Col>
                )}

                {/* Secretary */}
                {fellowship.secretary && (
                  <Col xs={24} sm={12} md={6}>
                    <Card
                      title={<Flex align="center" gap={8}><UserOutlined /> Secretary</Flex>}
                      variant="outlined"
                      size="small"
                      className="leadership-card"
                    >
                      <Flex vertical gap={8}>
                        <Text strong>{fellowship.secretary.getFullName()}</Text>
                        {fellowship.secretary.phoneNumber && (
                          <Flex align="center" gap={8}>
                            <PhoneOutlined />
                            <Text>{fellowship.secretary.phoneNumber}</Text>
                          </Flex>
                        )}
                      </Flex>
                    </Card>
                  </Col>
                )}

                {/* Treasurer */}
                {fellowship.treasurer && (
                  <Col xs={24} sm={12} md={6}>
                    <Card
                      title={<Flex align="center" gap={8}><UserOutlined /> Treasurer</Flex>}
                      variant="outlined"
                      size="small"
                      className="leadership-card"
                    >
                      <Flex vertical gap={8}>
                        <Text strong>{fellowship.treasurer.getFullName()}</Text>
                        {fellowship.treasurer.phoneNumber && (
                          <Flex align="center" gap={8}>
                            <PhoneOutlined />
                            <Text>{fellowship.treasurer.phoneNumber}</Text>
                          </Flex>
                        )}
                      </Flex>
                    </Card>
                  </Col>
                )}
              </Row>
            )}
          </Card>

          {/* Members Section */}
          <Card
            title={<Flex align="center" gap={8}><TeamOutlined /> Members</Flex>}
            variant="outlined"
          >
            <Row justify="space-between" align="middle">
              <Col>
                <Flex vertical gap={4}>
                  <Text type="secondary">Total Members</Text>
                  <Title level={2} style={{ margin: 0 }}>
                    {membersCountLoading ? <Spin size="small" /> : membersCount}
                  </Title>
                </Flex>
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