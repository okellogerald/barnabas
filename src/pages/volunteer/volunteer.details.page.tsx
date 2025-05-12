import React, { useEffect } from 'react';
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
  App
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { AsyncStateMatcher, isErrorState } from '@/lib/state';
import { notifyUtils } from '@/utilities';
import { Link } from 'react-router-dom';
import { useVolunteerDetail, VolunteerDetailSuccessState } from '@/features/volunteer/hooks';
import { useVolunteerPageUI } from '@/features/volunteer/list';
import { ROUTES } from '@/app';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/**
 * VolunteerOpportunityDetailPage - Component for viewing and managing a single volunteer opportunity
 * 
 * This page displays the details of a volunteer opportunity and provides options to:
 * - Edit the opportunity details
 * - Delete the opportunity
 */
const VolunteerOpportunityDetailPage: React.FC = () => {
  // Get ID from URL params
  const { id } = useParams<{ id: string }>();

  // Core data handling and state
  const { state, formHelpers } = useVolunteerDetail(id);

  // UI state management (modals, drawers, etc.)
  const ui = useVolunteerPageUI();

  const { modal } = App.useApp()

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

                  {/* Opportunity Details */}
                  <Title level={3}>{opportunity.name}</Title>

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

                  <Divider />

                  <Card type="inner" title="Member Management">
                    <Paragraph>
                      To manage members for this volunteer opportunity, please use the Members section
                      where you can assign or remove this opportunity from specific members.
                    </Paragraph>
                    <Row justify="end">
                      <Button type="primary">
                        <Link to="/members">Go to Members</Link>
                      </Button>
                    </Row>
                  </Card>
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

export default VolunteerOpportunityDetailPage;