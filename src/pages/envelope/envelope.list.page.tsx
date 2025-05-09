import React, { useMemo } from 'react';
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
  Tag,
  InputNumber,
  Alert
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  FilterOutlined,
  ReloadOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import { EnvelopesListSuccessState, useEnvelopesList } from '@/features/envelope/envelope-list';
import { AsyncStateMatcher } from '@/lib/state';
import { notifyUtils } from '@/utilities';
import { useEnvelopePageUI, useEnvelopeBlock, useEnvelopeFiltering } from '@/features/envelope/envelope-list';
import { } from '@/features/envelope/envelope-list';

const { Option } = Select;
const { Title, Text } = Typography;

/**
 * EnvelopeListPage - Main page component for listing and managing church offering envelopes
 * 
 * This page displays a list of church offering envelopes with filtering, sorting,
 * and pagination capabilities. It also provides functionality to create and delete
 * envelope blocks.
 */
const EnvelopeListPage: React.FC = () => {
  // Core data handling and state
  const envelopeState = useEnvelopesList();
  const blockManager = useEnvelopeBlock();

  // UI state management (modals, drawers, etc.)
  const ui = useEnvelopePageUI();

  // Filter handling logic
  const filtering = useEnvelopeFiltering(envelopeState);

  // Memoize handlers to prevent unnecessary re-renders
  const handleCreateBlock = useMemo(() => async (start: number, end: number) => {
    try {
      await blockManager.createBlock(start, end);
      ui.closeCreateModal();

      if (EnvelopesListSuccessState.is(envelopeState)) {
        envelopeState.refresh();
      }
    } catch (error) {
      notifyUtils.apiError(error);
      console.error("Failed to create envelope block:", error);
    }
  }, [blockManager, ui, envelopeState]);

  const handleDeleteBlock = useMemo(() => async (start: number, end: number) => {
    try {
      await blockManager.deleteBlock(start, end);
      ui.closeDeleteModal();

      if (EnvelopesListSuccessState.is(envelopeState)) {
        envelopeState.refresh();
      }
    } catch (error) {
      notifyUtils.apiError(error);
      console.error("Failed to delete envelope block:", error);
    }
  }, [blockManager, ui, envelopeState]);

  return (
    <div className="envelope-list-page">
      <AsyncStateMatcher
        state={envelopeState}
        views={{
          SuccessView: ({ state }) => {
            if (!EnvelopesListSuccessState.is(state)) {
              return null;
            }

            return (
              <>
                {/* Page Header */}
                <PageHeader
                  total={state.pagination.total}
                  activeFiltersCount={filtering.activeFiltersCount}
                  openFilterDrawer={ui.openFilterDrawer}
                  isRefreshing={state.loading}
                  onRefresh={() => state.refresh()}
                  onCreateBlock={() => {
                    ui.openCreateModal();
                  }}
                  onDeleteBlock={() => {
                    ui.openDeleteModal();
                  }}
                />

                {/* Main Content */}
                <MainContent
                  state={state}
                  sorting={filtering.sorting}
                />

                {/* Filter Drawer */}
                <FilterDrawer
                  visible={ui.isFilterDrawerOpen}
                  onClose={ui.closeFilterDrawer}
                  filters={state.filters}
                  form={filtering.form}
                  onApply={filtering.handleApplyFilters}
                  onReset={filtering.handleFilterReset}
                />

                {/* Create Block Modal */}
                <CreateBlockModal
                  visible={ui.isCreateModalOpen}
                  loading={blockManager.isCreating}
                  onCancel={ui.closeCreateModal}
                  onConfirm={handleCreateBlock}
                />

                {/* Delete Block Modal */}
                <DeleteBlockModal
                  visible={ui.isDeleteModalOpen}
                  loading={blockManager.isDeleting}
                  onCancel={ui.closeDeleteModal}
                  onConfirm={handleDeleteBlock}
                />
              </>
            );
          }
        }}
      />
    </div>
  );
};

/**
 * Page Header component with title and action buttons
 */
interface PageHeaderProps {
  total: number;
  activeFiltersCount: number;
  isRefreshing: boolean;
  openFilterDrawer: () => void;
  onRefresh: () => void;
  onCreateBlock: () => void;
  onDeleteBlock: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  total,
  activeFiltersCount,
  isRefreshing,
  openFilterDrawer,
  onRefresh,
  onCreateBlock,
  onDeleteBlock
}) => (
  <Card className="page-header-card">
    <Row justify="space-between" align="middle">
      <Col>
        <Title level={3} style={{ margin: 0 }}>
          Envelopes
          <Tag color="blue" style={{ marginLeft: 8 }}>
            {total} total
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
                onClick={openFilterDrawer}
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
              onClick={onRefresh}
              loading={isRefreshing}
            >
              Refresh
            </Button>
          </Tooltip>

          {/* Create Block Button */}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateBlock}
          >
            Create Block
          </Button>

          {/* Delete Block Button */}
          <Button
            type="default"
            danger
            icon={<DeleteOutlined />}
            onClick={onDeleteBlock}
          >
            Delete Block
          </Button>
        </Space>
      </Col>
    </Row>
  </Card>
);

/**
 * Main content component with table and pagination
 */
interface MainContentProps {
  state: EnvelopesListSuccessState;
  sorting: {
    sortBy: string;
    sortDirection: string;
    handleSortChange: (field: string) => void;
    toggleSortDirection: () => void;
  };
}

const MainContent: React.FC<MainContentProps> = ({ state, sorting }) => (
  <Card style={{ marginTop: 16 }}>
    {/* Sorting Controls */}
    <Row justify="end" style={{ marginBottom: 16 }}>
      <Col>
        <Space style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#8c8c8c' }}>Sort by:</span>
          <Select
            style={{ width: 180 }}
            value={sorting.sortBy}
            onChange={sorting.handleSortChange}
          >
            <Option value="envelopeNumber">Envelope Number</Option>
            <Option value="assignedAt">Assignment Date</Option>
            <Option value="releasedAt">Release Date</Option>
          </Select>

          <Tooltip title={`Switch to ${sorting.sortDirection === "asc" ? "descending" : "ascending"} order`}>
            <Button
              icon={sorting.sortDirection === "asc" ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
              onClick={sorting.toggleSortDirection}
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
);

/**
 * Filter drawer component
 */
interface FilterDrawerProps {
  visible: boolean;
  onClose: () => void;
  filters: any;
  form: any;
  onApply: (values: any) => void;
  onReset: () => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  visible,
  onClose,
  filters,
  form,
  onApply,
  onReset
}) => (
  <Drawer
    title={<span><FilterOutlined /> Filter Envelopes</span>}
    placement="right"
    width={320}
    onClose={onClose}
    open={visible}
    styles={{
      body: { paddingBottom: 80 }
    }}
  >
    <Form
      form={form}
      layout="vertical"
      initialValues={filters}
      onFinish={onApply}
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
          <Button block onClick={onReset}>
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
);

/**
 * Create block modal component
 * Memoized to prevent unnecessary re-renders when parent components change
 */
interface BlockModalProps {
  visible: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: (start: number, end: number) => void;
}

const CreateBlockModal = React.memo<BlockModalProps>(({
  visible,
  loading,
  onCancel,
  onConfirm
}) => {
  // Use local form state to prevent flickering from parent re-renders
  const [form] = Form.useForm();

  const handleOnOk = () => {
    form.validateFields()
      .then(values => {
        onConfirm(values.startNumber, values.endNumber);
      })
      .catch(info => {
        console.error('Validation Failed:', info);
      });
  }

  return (
    <Modal
      title="Create Envelope Block"
      open={visible}
      onOk={handleOnOk}
      onCancel={onCancel}
      confirmLoading={loading}
      maskClosable={false}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="startNumber"
          label="Start Number"
          required
          rules={[{ required: true, message: 'Please enter the start number' }]}
        >
          <InputNumber
            type="number"
            style={{ width: '100%' }}
            placeholder="Enter start number"
            autoFocus
            min={1}
          />
        </Form.Item>
        <Form.Item
          name="endNumber"
          label="End Number"
          required
          rules={[{ required: true, message: 'Please enter the end number' }]}
        >
          <InputNumber
            type="number"
            style={{ width: '100%' }}
            placeholder="Enter end number"
            min={1}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
});

/**
 * Delete block modal component
 * Memoized to prevent unnecessary re-renders when parent components change
 */
const DeleteBlockModal = React.memo<BlockModalProps>(({
  visible,
  loading,
  onCancel,
  onConfirm
}) => {
  // Use local form state to prevent flickering from parent re-renders
  const [form] = Form.useForm();

  const handleOnOk = () => {
    form.validateFields()
      .then(values => {
        onConfirm(values.startNumber, values.endNumber);
      })
      .catch(info => {
        console.error('Validation Failed:', info);
      });
  }


  return (
    <Modal
      title="Delete Envelope Block"
      open={visible}
      onOk={handleOnOk}
      onCancel={onCancel}
      confirmLoading={loading}
      maskClosable={false}
    >
      <Space direction="vertical">
        <Alert type='warning' message="This will delete all unused envelopes in the specified range. Envelopes that have been assigned to members cannot be deleted."></Alert>

        <Form form={form} layout="vertical">
          <Form.Item
            name="startNumber"
            label="Start Number"
            required
            rules={[{ required: true, message: 'Please enter the start number' }]}
          >
            <InputNumber
              type="number"
              min={1}
              style={{ width: '100%' }}
              placeholder="Enter start number"
              autoFocus
            />
          </Form.Item>
          <Form.Item
            name="endNumber"
            label="End Number"
            required
            rules={[{ required: true, message: 'Please enter the end number' }]}
          >
            <InputNumber
              type="number"
              style={{ width: '100%' }}
              placeholder="Enter end number"
              min={1}
            />
          </Form.Item>
        </Form>
      </Space>
    </Modal>
  );
});

export default EnvelopeListPage;