import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Typography,
  Descriptions,
  Breadcrumb,
  Divider,
  Skeleton,
  App,
  Tabs
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { AsyncStateMatcher, isErrorState } from '@/lib/state';
import { notifyUtils } from '@/utilities';
import { Link } from 'react-router-dom';
import { OpportunityMembersSuccessState, useOpportunityMembers, useVolunteerDetail, VolunteerDetailSuccessState } from '@/hooks/volunteer';
import { useVolunteerPageUI } from '@/hooks/volunteer/list';
import { ROUTES } from '@/app';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

/**
 * VolunteerOpportunityDetailPage - Component for viewing and managing a single volunteer opportunity
 * 
 * This page displays the details of a volunteer opportunity and provides options to:
 * - Edit the opportunity details
 * - Delete the opportunity
 * - Manage interested members
 */
const VolunteerOpportunityDetailPage: React.FC = () => {
  // Get ID from URL params
  const { id } = useParams<{ id: string }>();

  // Track active tab
  const [activeTab, setActiveTab] = useState<string>('details');

  // Core data handling and state
  const { state, formHelpers } = useVolunteerDetail(id);

  // UI state management (modals, drawers, etc.)
  const ui = useVolunteerPageUI();

  const { modal } = App.useApp();

  // Initialize form when data is loaded
  useEffect(() => {
    if (VolunteerDetailSuccessState.is(state) && ui.isEditModalOpen) {
      formHelpers.initializeForm(state.data);
    }
  }, [state, ui.isEditModalOpen, formHelpers]);

  // Handle form submission for edit
  const handleEditSubmit = async (values: { name: string; description: string }) => {
    if (!VolunteerDetailSuccessState.is(state)) return;

    try {
      await state.update({
        name: values.name,
        description: values.description || null
      });

      ui.closeEditModal();

      // Show success message
      notifyUtils.success('Volunteer opportunity updated successfully');
    } catch (error) {
      notifyUtils.apiError(error);
    }
  };

  // Handle delete confirmation
  const showDeleteConfirm = () => {
    if (!VolunteerDetailSuccessState.is(state)) return;

    modal.confirm({
      title: 'Are you sure you want to delete this volunteer opportunity?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No, Cancel',
      async onOk() {
        try {
          await state.delete();
          notifyUtils.success('Volunteer opportunity deleted successfully');
        } catch (error) {
          notifyUtils.apiError(error);
        }
      },
    });
  };

  // Prepare form for editing
  const handleEdit = () => {
    if (VolunteerDetailSuccessState.is(state)) {
      formHelpers.initializeForm(state.data);
      ui.openEditModal();
    }
  };

  return (
    <div className="volunteer-opportunity-detail-page">
      {/* Breadcrumb Navigation - always show this */}
      <Breadcrumb
        items={[
          {
            title: <Link to={ROUTES.DASHBOARD}>Dashboard</Link>,
          },
          {
            title: <Link to={ROUTES.OPPORTUNITIES.LIST}>Volunteer Opportunities</Link>,
          },
          {
            title: VolunteerDetailSuccessState.is(state) ? state.data.name : 'Loading...',
          },
        ]}
        style={{ marginBottom: 16 }} />

      <AsyncStateMatcher
        state={state}
        views={{
          LoadingView: () => (
            <Card>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => window.history.back()}
                style={{ marginBottom: 16 }}
              >
                Back to List
              </Button>
              <Divider style={{ marginTop: 0 }} />
              <Skeleton active paragraph={{ rows: 4 }} />
            </Card>
          ),

          ErrorView: ({ state }) => (
            <Card>
              <Row justify="space-between" align="middle">
                <Col>
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => window.history.back()}
                    style={{ marginBottom: 16 }}
                  >
                    Back to List
                  </Button>
                </Col>
                <Col>
                  {isErrorState(state) && (
                    <Button
                      type="primary"
                      onClick={() => state.retry()}
                      danger
                    >
                      Try Again
                    </Button>
                  )}
                </Col>
              </Row>
              <Divider style={{ marginTop: 0 }} />
              <Title level={4} type="danger">Error Loading Opportunity</Title>
              <Paragraph>
                {isErrorState(state) ? state.message : 'Failed to load volunteer opportunity details.'}
              </Paragraph>
            </Card>
          ),

          SuccessView: ({ state }) => {
            if (!VolunteerDetailSuccessState.is(state)) {
              return null;
            }

            const opportunity = state.data;

            return (
              <>
                {/* Main Content Card */}
                <Card>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => state.goBack()}
                        style={{ marginBottom: 16 }}
                      >
                        Back to List
                      </Button>
                    </Col>
                    <Col>
                      <Space>
                        <Button
                          icon={<EditOutlined />}
                          onClick={handleEdit}
                        >
                          Edit
                        </Button>
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={showDeleteConfirm}
                        >
                          Delete
                        </Button>
                      </Space>
                    </Col>
                  </Row>

                  <Divider style={{ marginTop: 0 }} />

                  {/* Opportunity Title */}
                  <Title level={3}>{opportunity.name}</Title>

                  {/* Tabs */}
                  <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    {/* Details Tab */}
                    <TabPane
                      tab={<span><InfoCircleOutlined /> Details</span>}
                      key="details"
                    >
                      {/* Opportunity Details */}
                      <Descriptions bordered column={1} size="small">
                        <Descriptions.Item
                          label={<Space><InfoCircleOutlined /> Description</Space>}
                        >
                          {opportunity.description || "No description provided"}
                        </Descriptions.Item>

                        <Descriptions.Item
                          label={<Space><CalendarOutlined /> Created</Space>}
                        >
                          {new Date(opportunity.createdAt).toLocaleString()}
                        </Descriptions.Item>

                        <Descriptions.Item
                          label={<Space><CalendarOutlined /> Last Updated</Space>}
                        >
                          {new Date(opportunity.updatedAt).toLocaleString()}
                        </Descriptions.Item>
                      </Descriptions>

                      {/* Member Summary Card - Clickable to switch to Members tab */}
                      <Divider />
                      <Card
                        type="inner"
                        title={<span><TeamOutlined /> Member Management</span>}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setActiveTab('members')}
                        className="clickable-card"
                      >
                        <Paragraph>
                          This section allows you to manage members who have expressed interest in this volunteer opportunity.
                          Click to view and manage interested members.
                        </Paragraph>
                        <Row justify="end">
                          <Button
                            type="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTab('members');
                            }}
                          >
                            Manage Interested Members
                          </Button>
                        </Row>
                      </Card>
                    </TabPane>

                    {/* Members Tab */}
                    <TabPane
                      tab={<span><TeamOutlined /> Interested Members</span>}
                      key="members"
                    >
                      {id && (
                        <OpportunityMembersTab
                          opportunityId={id}
                          isActive={activeTab === 'members'}
                        />
                      )}
                    </TabPane>
                  </Tabs>
                </Card>

                {/* Edit Opportunity Modal */}
                <Modal
                  title="Edit Volunteer Opportunity"
                  open={ui.isEditModalOpen}
                  onCancel={() => {
                    ui.closeEditModal();
                    formHelpers.resetForm();
                  }}
                  footer={[
                    <Button
                      key="cancel"
                      onClick={() => {
                        ui.closeEditModal();
                        formHelpers.resetForm();
                      }}
                    >
                      Cancel
                    </Button>,
                    <Button
                      key="submit"
                      type="primary"
                      loading={state.isUpdating}
                      onClick={() => formHelpers.submitForm()}
                    >
                      Save Changes
                    </Button>
                  ]}
                  maskClosable={false}
                  destroyOnClose={true}
                >
                  <Form
                    form={formHelpers.form}
                    layout="vertical"
                    onFinish={handleEditSubmit}
                  >
                    <Form.Item
                      name="name"
                      label="Opportunity Name"
                      rules={[
                        { required: true, message: 'Please enter opportunity name' },
                        { max: 100, message: 'Name cannot exceed 100 characters' }
                      ]}
                    >
                      <Input placeholder="Enter opportunity name" />
                    </Form.Item>

                    <Form.Item
                      name="description"
                      label="Description"
                      extra={
                        <Space>
                          <InfoCircleOutlined />
                          <Text type="secondary">Describe requirements, responsibilities, and expectations</Text>
                        </Space>
                      }
                    >
                      <TextArea
                        rows={4}
                        placeholder="Enter opportunity description"
                        maxLength={500}
                        showCount
                      />
                    </Form.Item>
                  </Form>
                </Modal>
              </>
            );
          }
        }}
      />
    </div>
  );
};

import { Table, Empty, Flex } from 'antd';
import { UserAddOutlined, ReloadOutlined } from '@ant-design/icons';
import { MemberSelector } from '@/components/member/member_selector';

interface OpportunityMembersTabProps {
  opportunityId: string;
  isActive: boolean;
}

/**
 * Opportunity Members Tab Component
 * 
 * Displays a table of members interested in a volunteer opportunity with actions to add/remove members
 */
const OpportunityMembersTab: React.FC<OpportunityMembersTabProps> = ({
  opportunityId,
  isActive
}) => {
  // Get members data from hook
  const state = useOpportunityMembers(opportunityId, isActive);

  // Render members table when data is loaded
  const renderMembersTable = ({ state }: { state: OpportunityMembersSuccessState }) => {
    const { tableProps, total, canAddMembers } = state;

    return (
      <Card>
        <Flex vertical gap={16}>
          {/* Header with title and actions */}
          <Flex justify="space-between" align="center">
            <Title level={4}>
              <TeamOutlined /> Interested Members ({total})
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
                  onClick={() => state.actions.openMemberSelector()}
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
              description="No members interested in this opportunity yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              {canAddMembers && (
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => state.actions.openMemberSelector()}
                >
                  Add Interested Member
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
          if (!OpportunityMembersSuccessState.is(state)) return null;

          return (<>
            {renderMembersTable({ state })}
            {/* Member selector modal */}
            <MemberSelector
              visible={state.memberSelectorVisible}
              onCancel={() => state.actions.closeMemberSelector()}
              onSelect={(member) => {
                state.actions.addMember(member.id);
                state.actions.closeMemberSelector()
              }}
            />
          </>)
        }
      }}
    />
  );
};


export default VolunteerOpportunityDetailPage;