import React, { useState, useEffect } from 'react';
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
  Select,
  Divider,
  Typography,
  Drawer,
  Badge,
  Tooltip,
  Tag
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  FilterOutlined,
  ReloadOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import { EnvelopesListSuccessState, useEnvelopeFilterStore, useEnvelopesList } from '@/features/envelope/envelope-list';
import { useEnvelopeBlock } from '@/features/envelope/envelope-block';
import { AsyncStateMatcher } from '@/lib/state';
import { notifyUtils } from '@/utilities';
import { SortDirection } from '@/lib/query';

const { Option } = Select;
const { Title, Text } = Typography;

/**
 * Page to list and manage envelopes
 */
const EnvelopeListPage: React.FC = () => {
  // State for modal and drawer visibility
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Use our custom hooks
  const state = useEnvelopesList();
  const blockManager = useEnvelopeBlock();
  const filterStore = useEnvelopeFilterStore();

  // Form instance for the filters
  const [form] = Form.useForm();

  // Track active filters count
  useEffect(() => {
    // Count non-empty filter values, ignoring sortBy and sortDirection
    const count = Object.entries(filterStore.filters)
      .filter(([key, value]) => 
        key !== 'sortBy' && 
        key !== 'sortDirection' && 
        value !== undefined && 
        value !== null && 
        value !== ''
      ).length;
      
    setActiveFiltersCount(count);
  }, [filterStore.filters]);

  // Handle create block confirmation
  const handleCreateBlock = async () => {
    try {
      await blockManager.createBlock();
      setCreateModalVisible(false);
      blockManager.reset();

      // Refresh the list
      if (EnvelopesListSuccessState.is(state)) {
        state.refresh();
      }
    } catch (error) {
      notifyUtils.apiError(error)
      console.error("Failed to create envelope block:", error);
    }
  };

  // Handle delete block confirmation
  const handleDeleteBlock = async () => {
    try {
      await blockManager.deleteBlock();
      setDeleteModalVisible(false);
      blockManager.reset();

      // Refresh the list
      if (EnvelopesListSuccessState.is(state)) {
        state.refresh();
      }
    } catch (error) {
      console.error("Failed to delete envelope block:", error);
    }
  };

  // Handle filter application
  const handleApplyFilters = (values: any) => {
    const formattedValues = {
      ...values,
      // Ensure isAssigned is a boolean if it exists and not empty string
      isAssigned: values.isAssigned === '' ? undefined : 
                 values.isAssigned === 'true' ? true : 
                 values.isAssigned === 'false' ? false : values.isAssigned,
      // Parse number if provided
      number: values.number ? parseInt(values.number) : undefined,
    };

    if (EnvelopesListSuccessState.is(state)) {
      state.updateFilters(formattedValues);
    }
    setFilterDrawerOpen(false);
  };

  // Handle filter reset
  const handleFilterReset = () => {
    form.resetFields();
    if (EnvelopesListSuccessState.is(state)) {
      state.clearFilters();
    }
  };

  // Handle sorting change
  const handleSortChange = (field: string) => {
    // Keep the same direction for a new field
    const currentDirection = filterStore.filters.sortDirection || SortDirection.ASC;
    
    filterStore.setFilters({
      ...filterStore.filters,
      sortBy: field,
      sortDirection: currentDirection
    });
  };
  
  // Toggle sort direction
  const toggleSortDirection = () => {
    const currentField = filterStore.filters.sortBy || 'envelopeNumber';
    const newDirection = filterStore.filters.sortDirection === SortDirection.ASC 
      ? SortDirection.DESC 
      : SortDirection.ASC;
    
    filterStore.setFilters({
      ...filterStore.filters,
      sortBy: currentField,
      sortDirection: newDirection
    });
  };

  return (
    <div className="envelope-list-page">
      <AsyncStateMatcher
        state={state}
        views={{
          SuccessView: ({ state }) => {
            if (!EnvelopesListSuccessState.is(state)) {
              return null;
            }

            return (
              <>
                {/* Header Card with Title and Actions */}
                <Card className="page-header-card">
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Title level={3} style={{ margin: 0 }}>
                        Envelopes
                        <Tag color="blue" style={{ marginLeft: 8 }}>
                          {state.pagination.total} total
                        </Tag>
                      </Title>
                      <Text type="secondary">Manage church offering envelopes and assignments</Text>
                    </Col>
                    <Col>
                      <Space>
                        {/* Filter Button with Badge */}
                        <Tooltip title="Filter Envelopes">
                          <Badge count={activeFiltersCount} size="small" offset={[5, -3]}>
                            <Button
                              icon={<FilterOutlined />}
                              onClick={() => setFilterDrawerOpen(true)}
                              type={activeFiltersCount > 0 ? "primary" : "default"}
                            >
                              Filters
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

                        {/* Create Block Button */}
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => {
                            blockManager.reset();
                            setCreateModalVisible(true);
                          }}
                        >
                          Create Block
                        </Button>
                        
                        {/* Delete Block Button */}
                        <Button
                          type="default"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            blockManager.reset();
                            setDeleteModalVisible(true);
                          }}
                        >
                          Delete Block
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Card>

                {/* Main Content Card */}
                <Card style={{ marginTop: 16 }}>
                  {/* Sorting Controls */}
                  <Row justify="end" style={{ marginBottom: 16 }}>
                    <Col>
                      <Space style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#8c8c8c' }}>Sort by:</span>
                        <Select
                          style={{ width: 180 }}
                          value={state.filters.sortBy || 'envelopeNumber'}
                          onChange={handleSortChange}
                        >
                          <Option value="envelopeNumber">Envelope Number</Option>
                          <Option value="assignedAt">Assignment Date</Option>
                          <Option value="releasedAt">Release Date</Option>
                        </Select>

                        <Tooltip title={`Switch to ${filterStore.filters.sortDirection === "asc" ? "descending" : "ascending"} order`}>
                          <Button
                            icon={filterStore.filters.sortDirection === "asc" ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                            onClick={toggleSortDirection}
                          />
                        </Tooltip>
                      </Space>
                    </Col>
                  </Row>

                  {/* Envelopes Table */}
                  <Table
                    {...state.tableProps}
                    dataSource={state.data.envelopes}
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
                        onChange={state.pagination.onChange}
                        showSizeChanger
                        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} envelopes`}
                      />
                    </Col>
                  </Row>
                </Card>

                {/* Filter Drawer */}
                <Drawer
                  title={<span><FilterOutlined /> Filter Envelopes</span>}
                  placement="right"
                  width={320}
                  onClose={() => setFilterDrawerOpen(false)}
                  open={filterDrawerOpen}
                  styles={{
                    body: { paddingBottom: 80 }
                  }}
                >
                  <Form
                    form={form}
                    layout="vertical"
                    initialValues={state.filters}
                    onFinish={handleApplyFilters}
                  >
                    <Form.Item label="Envelope Number" name="number">
                      <Input type="number" placeholder="Filter by number" />
                    </Form.Item>

                    <Form.Item label="Status" name="isAssigned">
                      <Select placeholder="Filter by status" allowClear>
                        <Option value="true">Assigned</Option>
                        <Option value="false">Available</Option>
                      </Select>
                    </Form.Item>

                    <Divider />

                    <Row gutter={16}>
                      <Col span={12}>
                        <Button block onClick={handleFilterReset}>
                          Reset
                        </Button>
                      </Col>
                      <Col span={12}>
                        <Button type="primary" block htmlType="submit">
                          Apply Filters
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Drawer>

                {/* Create Block Modal */}
                <Modal
                  title="Create Envelope Block"
                  open={createModalVisible}
                  onOk={handleCreateBlock}
                  onCancel={() => setCreateModalVisible(false)}
                  confirmLoading={blockManager.isCreating}
                >
                  <Form layout="vertical">
                    <Form.Item
                      label="Start Number"
                      required
                      rules={[{ required: true, message: 'Please enter the start number' }]}
                    >
                      <Input
                        type="number"
                        min={1}
                        value={blockManager.startNumber || undefined}
                        onChange={(e) => blockManager.setStartNumber(parseInt(e.target.value) || null)}
                      />
                    </Form.Item>
                    <Form.Item
                      label="End Number"
                      required
                      rules={[{ required: true, message: 'Please enter the end number' }]}
                    >
                      <Input
                        type="number"
                        min={1}
                        value={blockManager.endNumber || undefined}
                        onChange={(e) => blockManager.setEndNumber(parseInt(e.target.value) || null)}
                      />
                    </Form.Item>

                    {blockManager.startNumber && blockManager.endNumber && blockManager.endNumber <= blockManager.startNumber && (
                      <div style={{ color: 'red' }}>End number must be greater than start number</div>
                    )}
                  </Form>
                </Modal>

                {/* Delete Block Modal */}
                <Modal
                  title="Delete Envelope Block"
                  open={deleteModalVisible}
                  onOk={handleDeleteBlock}
                  onCancel={() => setDeleteModalVisible(false)}
                  confirmLoading={blockManager.isDeleting}
                >
                  <p>This will delete all unused envelopes in the specified range. Envelopes that have been assigned to members cannot be deleted.</p>

                  <Form layout="vertical">
                    <Form.Item
                      label="Start Number"
                      required
                      rules={[{ required: true, message: 'Please enter the start number' }]}
                    >
                      <Input
                        type="number"
                        min={1}
                        value={blockManager.startNumber || undefined}
                        onChange={(e) => blockManager.setStartNumber(parseInt(e.target.value) || null)}
                      />
                    </Form.Item>
                    <Form.Item
                      label="End Number"
                      required
                      rules={[{ required: true, message: 'Please enter the end number' }]}
                    >
                      <Input
                        type="number"
                        min={1}
                        value={blockManager.endNumber || undefined}
                        onChange={(e) => blockManager.setEndNumber(parseInt(e.target.value) || null)}
                      />
                    </Form.Item>

                    {blockManager.startNumber && blockManager.endNumber && blockManager.endNumber <= blockManager.startNumber && (
                      <div style={{ color: 'red' }}>End number must be greater than start number</div>
                    )}
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

export default EnvelopeListPage;