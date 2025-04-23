import React from 'react';
import {
  Card,
  Descriptions,
  Button,
  Typography,
  Divider,
  Space,
  Tag,
  Avatar,
  List,
  Row,
  Col,
  Statistic,
  Tabs,
  Spin
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useFellowshipDetail, FellowshipDetailSuccessState } from '@/features/fellowship/fellowship-details';
import { AsyncStateMatcher } from '@/lib/state/async_state.matcher';
import { Navigation } from '@/app';
import { AuthManager } from '@/managers/auth';
import { dateUtils } from '@/utilities/date.utils';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

/**
 * Fellowship Details Page
 */
const FellowshipDetailPage: React.FC = () => {
  // Get fellowship details state from custom hook
  const fellowshipState = useFellowshipDetail();
  
  // Check permissions
  const canEditFellowship = AuthManager.instance.hasPermission('FELLOWSHIP_UPDATE');
  const canDeleteFellowship = AuthManager.instance.hasPermission('FELLOWSHIP_DELETE_BY_ID');

  return (
    <div className="fellowship-detail-page">
      <AsyncStateMatcher
        state={fellowshipState}
        views={{
          SuccessView: ({ state }) => {
            if (FellowshipDetailSuccessState.is(state)) {
              const fellowship = state.data;
              
              return (
                <>
                  {/* Header Section */}
                  <Card className="page-header-card" style={{ marginBottom: 16 }}>
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Button 
                          icon={<ArrowLeftOutlined />} 
                          onClick={() => Navigation.Fellowships.toList()}
                          style={{ marginBottom: 16 }}
                        >
                          Back to Fellowships
                        </Button>
                        <Title level={3} style={{ margin: 0 }}>
                          {fellowship.getDisplayName()}
                        </Title>
                        <Text type="secondary">Fellowship Details</Text>
                      </Col>
                      <Col>
                        <Space>
                          {canEditFellowship && (
                            <Button
                              icon={<EditOutlined />}
                              onClick={() => state.editFellowship()}
                            >
                              Edit
                            </Button>
                          )}
                          {canDeleteFellowship && (
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => state.showDeleteConfirm()}
                              loading={state.deleteLoading}
                            >
                              Delete
                            </Button>
                          )}
                        </Space>
                      </Col>
                    </Row>
                  </Card>

                  {/* Key Information and Stats */}
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={8}>
                      <Card>
                        <Statistic
                          title="Members"
                          value={state.memberCount !== null ? state.memberCount : "Loading..."}
                          prefix={<TeamOutlined />}
                          suffix={
                            state.memberCount !== null && state.memberCount > 0 ? (
                              <Button 
                                type="link" 
                                size="small" 
                                onClick={() => state.viewMembers()}
                                style={{ fontSize: 12 }}
                              >
                                View All
                              </Button>
                            ) : null
                          }
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card>
                        <Statistic
                          title="Created"
                          value={dateUtils.formatDate(fellowship.createdAt)}
                          prefix={<CalendarOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card>
                        <Statistic
                          title="Last Updated"
                          value={dateUtils.formatDate(fellowship.updatedAt)}
                          prefix={<ClockCircleOutlined />}
                        />
                      </Card>
                    </Col>
                  </Row>

                  {/* Main Content */}
                  <Tabs defaultActiveKey="details" className="fellowship-tabs">
                    <TabPane tab="Details" key="details">
                      <Card>
                        {fellowship.notes && (
                          <>
                            <Title level={5}>Notes</Title>
                            <Paragraph>{fellowship.notes}</Paragraph>
                            <Divider />
                          </>
                        )}

                        {/* Fellowship Information */}
                        <Descriptions title="Fellowship Information" bordered column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}>
                          <Descriptions.Item label="Name">{fellowship.name}</Descriptions.Item>
                          <Descriptions.Item label="Status">
                            <Tag color="green">Active</Tag>
                          </Descriptions.Item>
                          <Descriptions.Item label="ID" span={2}>
                            <Text code copyable>{fellowship.id}</Text>
                          </Descriptions.Item>
                          <Descriptions.Item label="Created At">
                            {dateUtils.formatDate(fellowship.createdAt, true)}
                          </Descriptions.Item>
                          <Descriptions.Item label="Last Updated">
                            {dateUtils.formatDate(fellowship.updatedAt, true)}
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                    </TabPane>

                    <TabPane tab="Leadership" key="leadership">
                      <Card>
                        {fellowship.hasLeadership() ? (
                          <List
                            itemLayout="horizontal"
                            dataSource={[
                              { role: 'Chairman', user: fellowship.chairman },
                              { role: 'Deputy Chairman', user: fellowship.deputyChairman },
                              { role: 'Secretary', user: fellowship.secretary },
                              { role: 'Treasurer', user: fellowship.treasurer },
                            ].filter(item => item.user)}
                            renderItem={item => (
                              <List.Item>
                                <List.Item.Meta
                                  avatar={<Avatar icon={<UserOutlined />} />}
                                  title={item.user?.getDisplayName()}
                                  description={
                                    <Space direction="vertical">
                                      <Text type="secondary">{item.role}</Text>
                                      {item.user?.phoneNumber && (
                                        <Text type="secondary">
                                          <PhoneOutlined style={{ marginRight: 4 }} />
                                          {item.user.phoneNumber}
                                        </Text>
                                      )}
                                      {item.user?.email && (
                                        <Text type="secondary">
                                          <MailOutlined style={{ marginRight: 4 }} />
                                          {item.user.email}
                                        </Text>
                                      )}
                                    </Space>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        ) : (
                          <div style={{ textAlign: 'center', padding: '32px 0' }}>
                            <TeamOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
                            <Title level={4}>No Leadership Assigned</Title>
                            <Text type="secondary">
                              This fellowship does not have any leadership roles assigned yet.
                            </Text>
                            {canEditFellowship && (
                              <div style={{ marginTop: 16 }}>
                                <Button
                                  type="primary"
                                  icon={<EditOutlined />}
                                  onClick={() => state.editFellowship()}
                                >
                                  Assign Leadership
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                    </TabPane>

                    <TabPane tab="Members" key="members">
                      <Card>
                        {state.memberCount === null ? (
                          <div style={{ textAlign: 'center', padding: 24 }}>
                            <Spin />
                            <div style={{ marginTop: 16 }}>
                              <Text type="secondary">Loading member information...</Text>
                            </div>
                          </div>
                        ) : state.memberCount > 0 ? (
                          <div>
                            <Title level={5}>Fellowship Members ({state.memberCount})</Title>
                            <Paragraph>
                              This fellowship has {state.memberCount} member{state.memberCount !== 1 ? 's' : ''}.
                            </Paragraph>
                            <Button 
                              type="primary" 
                              icon={<TeamOutlined />}
                              onClick={() => state.viewMembers()}
                            >
                              View All Members
                            </Button>
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '32px 0' }}>
                            <TeamOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
                            <Title level={4}>No Members</Title>
                            <Text type="secondary">
                              This fellowship does not have any members assigned yet.
                            </Text>
                          </div>
                        )}
                      </Card>
                    </TabPane>
                  </Tabs>
                </>
              );
            }
            return null;
          }
        }}
      />
    </div>
  );
};

export default FellowshipDetailPage;