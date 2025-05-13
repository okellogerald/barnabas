import React from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Pagination,
  Row,
  Col,
  Typography,
  Drawer,
  Badge,
  Tooltip,
  Tag,
  Empty
} from 'antd';
import {
  PlusOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { VolunteerListSuccessState, useVolunteerList } from '@/hooks/volunteer/list';
import { AsyncStateMatcher } from '@/lib/state';
import { notifyUtils } from '@/utilities';
import { useVolunteerPageUI } from '@/hooks/volunteer/list';
import { useCreateVolunteerOpportunity } from '@/hooks/volunteer';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/**
 * VolunteerOpportunityListPage - Main page component for listing and managing volunteer opportunities
 * 
 * This page displays a list of volunteer opportunities with the count of interested members.
 * It provides functionality to:
 * - View and filter opportunities
 * - Create new opportunities
 * - Navigate to detail views for each opportunity
 */
const VolunteerOpportunityListPage: React.FC = () => {
  // Core data handling and state
  const opportunitiesState = useVolunteerList();
  const createOpportunity = useCreateVolunteerOpportunity();

  // UI state management (modals, drawers, etc.)
  const ui = useVolunteerPageUI();

  // Form for creating new opportunities
  const [createForm] = Form.useForm();

  // Handle creation form submission
  const handleCreateSubmit = async (values: { name: string; description: string }) => {
    try {
      await createOpportunity.create({
        name: values.name,
        description: values.description
      });

      ui.closeCreateModal();
      createForm.resetFields();

      // Display success message
      notifyUtils.success('Volunteer opportunity created successfully');
    } catch (error) {
      notifyUtils.apiError(error);
    }
  };

  // Filter form
  const [filterForm] = Form.useForm();

  // Handle filter submission
  const handleFilterSubmit = (values: { searchTerm: string }) => {
    if (VolunteerListSuccessState.is(opportunitiesState)) {
      opportunitiesState.updateFilters({ name: values.searchTerm });
    }
    ui.closeFilterDrawer();
  };

  // Handle filter reset
  const handleFilterReset = () => {
    filterForm.resetFields();
    if (VolunteerListSuccessState.is(opportunitiesState)) {
      opportunitiesState.clearFilters();
    }
    ui.closeFilterDrawer();
  };

  return (
    <div className="volunteer-opportunity-list-page">
      <AsyncStateMatcher
        state={opportunitiesState}
        views={{
          SuccessView: ({ state }) => {
            if (!VolunteerListSuccessState.is(state)) {
              return null;
            }

            // Show empty state if no opportunities exist
            const isEmpty = state.data.opportunities.length === 0 && !state.filters.name;

            return (
              <>
                {/* Page Header */}
                <Card className="page-header-card">
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Title level={3} style={{ margin: 0 }}>
                        Volunteer Opportunities
                        <Tag color="blue" style={{ marginLeft: 8 }}>
                          {state.pagination.total} total
                        </Tag>
                      </Title>
                      <Text type="secondary">Manage church volunteer opportunities</Text>
                    </Col>
                    <Col>
                      <Space>
                        {/* Search Button with Badge */}
                        <Tooltip title="Search Opportunities">
                          <Badge count={state.filters.name ? 1 : 0} size="small" offset={[5, -3]}>
                            <Button
                              icon={<FilterOutlined />}
                              onClick={ui.openFilterDrawer}
                              type={state.filters.name ? "primary" : "default"}
                            >
                              Search
                            </Button>
                          </Badge>
                        </Tooltip>

                        {/* Refresh Button */}
                        <Tooltip title="Refresh List">
                          <Button
                            icon={<ReloadOutlined />}
                            onClick={() => state.refresh()}
                            loading={state.loading}
                          >
                            Refresh
                          </Button>
                        </Tooltip>

                        {/* Create Button */}
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={ui.openCreateModal}
                        >
                          New Opportunity
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Card>

                {/* Main Content Card */}
                <Card style={{ marginTop: 16 }}>
                  {isEmpty ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <Space direction="vertical" align="center">
                          <Text strong>No Volunteer Opportunities Found</Text>
                          <Paragraph type="secondary">
                            Create volunteer opportunities to track member interests and skills
                          </Paragraph>
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={ui.openCreateModal}
                          >
                            Create First Opportunity
                          </Button>
                        </Space>
                      }
                    />
                  ) : (
                    <>
                      {/* Volunteer Opportunities Table */}
                      <Table
                        {...state.tableProps}
                        dataSource={state.data.opportunities}
                        pagination={false}
                        loading={state.loading}
                      />

                      {/* Pagination */}
                      <Row justify="end" style={{ marginTop: 16 }}>
                        <Col>
                          <Pagination
                            current={state.pagination.current}
                            pageSize={state.pagination.pageSize}
                            total={state.pagination.total}
                            onChange={(page, pageSize) => state.pagination.onChange(page, pageSize)}
                            showSizeChanger
                            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} opportunities`}
                          />
                        </Col>
                      </Row>
                    </>
                  )}
                </Card>

                {/* Filter Drawer */}
                <Drawer
                  title={<span><SearchOutlined /> Search Opportunities</span>}
                  placement="right"
                  width={320}
                  onClose={ui.closeFilterDrawer}
                  open={ui.isFilterDrawerOpen}
                  styles={{ body: { paddingBottom: 80 } }}
                >
                  <Form
                    form={filterForm}
                    layout="vertical"
                    initialValues={{ searchTerm: state.filters.name }}
                    onFinish={handleFilterSubmit}
                  >
                    <Form.Item
                      name="searchTerm"
                      label="Search Term"
                      extra="Search by opportunity name"
                    >
                      <Input
                        placeholder="Enter search term"
                        prefix={<SearchOutlined />}
                        allowClear
                      />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Button block onClick={handleFilterReset}>
                          Reset
                        </Button>
                      </Col>
                      <Col span={12}>
                        <Button type="primary" block htmlType="submit">
                          Search
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Drawer>

                {/* Create Opportunity Modal */}
                <Modal
                  title="Create New Volunteer Opportunity"
                  open={ui.isCreateModalOpen}
                  onCancel={ui.closeCreateModal}
                  footer={null}
                  maskClosable={false}
                >
                  <Form
                    form={createForm}
                    layout="vertical"
                    onFinish={handleCreateSubmit}
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

                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                      <Row gutter={16} justify="end">
                        <Col>
                          <Button onClick={ui.closeCreateModal}>
                            Cancel
                          </Button>
                        </Col>
                        <Col>
                          <Button
                            type="primary"
                            htmlType="submit"
                            loading={createOpportunity.isCreating}
                          >
                            Create
                          </Button>
                        </Col>
                      </Row>
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

export default VolunteerOpportunityListPage;