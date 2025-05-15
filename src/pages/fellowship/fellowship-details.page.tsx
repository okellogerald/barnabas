import React, { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Row,
  Col,
  Tag,
  Tooltip,
  Empty,
  Tabs,
  Flex,
  Table
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
  ReloadOutlined,
  FileTextOutlined,
  FormOutlined,
  UserOutlined
} from '@ant-design/icons';
import { AsyncStateMatcher } from '@/lib/state';
import { useFellowshipDetails, FellowshipDetailsSuccessState } from '@/hooks/fellowship';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

/**
 * Fellowship Details Page
 * 
 * Displays details of a specific fellowship and provides actions to manage it
 */
const FellowshipDetailsPage: React.FC = () => {
  // Track the active tab
  const [activeTab, setActiveTab] = useState<string>('details');

  // Get state from hook
  const state = useFellowshipDetails();

  // Render fellowship details when data is loaded
  const renderFellowshipDetails = ({ state }: { state: FellowshipDetailsSuccessState }) => {
    const {
      fellowship,
      membersCount,
      isDeleting,
      canEdit,
      canDelete,
      canAddMembers
    } = state;

    return (
      <div className="fellowship-details-page">
        {/* Main Card */}
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
                    {membersCount} member{membersCount !== 1 ? 's' : ''}
                  </Text>
                </Flex>
              </Flex>
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => state.back()}
                >
                  Back to List
                </Button>

                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => state.refresh()}
                >
                  Refresh
                </Button>

                {canEdit && (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => state.edit()}
                  >
                    Edit Fellowship
                  </Button>
                )}

                {canDelete && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => state.showDeleteConfirm()}
                    loading={isDeleting}
                  >
                    Delete
                  </Button>
                )}
              </Space>
            </Col>
          </Row>

          {/* Tabs */}
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            {/* Details Tab */}
            <TabPane
              tab={<span><InfoCircleOutlined /> Details</span>}
              key="details"
            >
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
                      <Text>{membersCount} member{membersCount !== 1 ? 's' : ''}</Text>
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
                  <Button type="primary" icon={<EditOutlined />} onClick={() => state.edit()}>
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

              {/* Summary Card */}
              <Card
                title={<Flex align="center" gap={8}><TeamOutlined /> Members Summary</Flex>}
                variant="outlined"
                onClick={() => setActiveTab('members')}
                style={{ cursor: 'pointer' }}
                className="clickable-card"
              >
                <Row justify="space-between" align="middle">
                  <Col>
                    <Flex vertical gap={4}>
                      <Text type="secondary">Total Members</Text>
                      <Title level={2} style={{ margin: 0 }}>
                        {membersCount}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              state.addMember();
                            }}
                          >
                            Add Member
                          </Button>
                        </Tooltip>
                      )}

                      <Tooltip title="View all members in this fellowship">
                        <Button
                          icon={<TeamOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab('members');
                          }}
                        >
                          View All Members
                        </Button>
                      </Tooltip>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </TabPane>

            {/* Members Tab */}
            <TabPane
              tab={<span><TeamOutlined /> Members</span>}
              key="members"
            >
              <FellowshipMembersTab
                fellowshipId={fellowship.id}
                isActive={activeTab === 'members'}
              />
            </TabPane>
          </Tabs>
        </Card>
      </div>
    );
  };

  // Use AsyncStateMatcher to handle loading, error states
  return (
    <AsyncStateMatcher
      state={state}
      views={{
        SuccessView: ({ state }) => {
          if (FellowshipDetailsSuccessState.is(state)) {
            return renderFellowshipDetails({ state });
          }
          return null;
        }
      }}
    />
  );
};

import { useFellowshipMembers, FellowshipMembersSuccessState } from '@/hooks/fellowship';

interface FellowshipMembersTabProps {
  fellowshipId: string;
  isActive: boolean;
}

/**
 * Fellowship Members Tab Component
 * 
 * Displays a table of members in a fellowship with actions to add/remove members
 */
const FellowshipMembersTab: React.FC<FellowshipMembersTabProps> = ({
  fellowshipId,
  isActive
}) => {
  // Get members data from hook
  const state = useFellowshipMembers(fellowshipId, isActive);

  // Render members table when data is loaded
  const renderMembersTable = ({ state }: { state: FellowshipMembersSuccessState }) => {
    const { tableProps, total, canAddMembers } = state;

    return (
      <Card>
        <Flex vertical gap={16}>
          {/* Header with title and actions */}
          <Flex justify="space-between" align="center">
            <Title level={4}>
              <TeamOutlined /> Fellowship Members ({total})
            </Title>

            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => state.refresh()}
              >
                Refresh
              </Button>

              {canAddMembers && (
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => state.addMember()}
                >
                  Add Member
                </Button>
              )}
            </Space>
          </Flex>

          {/* Members table */}
          {total > 0 ? (
            <Table {...tableProps} />
          ) : (
            <Empty
              description="No members in this fellowship yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              {canAddMembers && (
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => state.addMember()}
                >
                  Add Member
                </Button>
              )}
            </Empty>
          )}
        </Flex>
      </Card>
    );
  };

  // Use AsyncStateMatcher to handle loading, error states
  return (
    <AsyncStateMatcher
      state={state}
      views={{
        SuccessView: ({ state }) => {
          if (FellowshipMembersSuccessState.is(state)) {
            return renderMembersTable({ state });
          }
          return null;
        }
      }}
    />
  );
};

export default FellowshipDetailsPage;