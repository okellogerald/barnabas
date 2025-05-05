import React, { useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Pagination, Row, Col, Select, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined, FilterOutlined, UndoOutlined } from '@ant-design/icons';
import { EnvelopesListSuccessState, useEnvelopesList } from '@/features/envelope/envelope-list';
import { useEnvelopeBlock } from '@/features/envelope/envelope-block';
import { AsyncStateMatcher } from '@/lib/state';

const { Option } = Select;

/**
 * Page to list and manage envelopes
 */
const EnvelopeListPage: React.FC = () => {
  // State for modal visibility
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Use our custom hooks
  const state = useEnvelopesList();
  const blockManager = useEnvelopeBlock();

  // Form instance for the filters
  const [form] = Form.useForm();

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

  // Handle filter submission
  const handleFilterSubmit = (values: any) => {
    if (EnvelopesListSuccessState.is(state)) {
      state.updateFilters({
        number: values.number ? parseInt(values.number) : undefined,
        isAssigned: values.isAssigned,
        sortBy: values.sortBy,
        sortDirection: values.sortDirection,
      });
    }
  };

  // Handle filter reset
  const handleFilterReset = () => {
    form.resetFields();
    if (EnvelopesListSuccessState.is(state)) {
      state.clearFilters();
    }
  };

  return (
    <Card
      title="Envelopes Management"
      extra={
        <Space>
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
      }
    >
      {/* Filters */}
      <Form
        form={form}
        layout="inline"
        onFinish={handleFilterSubmit}
        style={{ marginBottom: '1rem' }}
      >
        <Form.Item name="number" label="Envelope Number">
          <Input type="number" placeholder="Filter by number" />
        </Form.Item>

        <Form.Item name="isAssigned" label="Status">
          <Select placeholder="Filter by status" allowClear style={{ width: 150 }}>
            <Option value="true">Assigned</Option>
            <Option value="false">Available</Option>
          </Select>
        </Form.Item>

        <Form.Item name="sortBy" label="Sort by">
          <Select placeholder="Sort by" allowClear style={{ width: 150 }}>
            <Option value="envelopeNumber">Envelope Number</Option>
            <Option value="assignedAt">Assignment Date</Option>
            <Option value="releasedAt">Release Date</Option>
          </Select>
        </Form.Item>

        <Form.Item name="sortDirection" label="Direction">
          <Select placeholder="Sort direction" allowClear style={{ width: 120 }}>
            <Option value="asc">Ascending</Option>
            <Option value="desc">Descending</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<FilterOutlined />}>
              Apply Filters
            </Button>
            <Button onClick={handleFilterReset} icon={<UndoOutlined />}>
              Reset
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <Divider />

      {/* Main content */}
      <AsyncStateMatcher
        state={state}
        views={{
          SuccessView: ({ state }) => {
            if (!EnvelopesListSuccessState.is(state)) {
              return null;
            }

            // Get data from our success state
            const { tableProps, pagination, loading } = state;

            return (
              <>
                <Table
                  {...tableProps}
                  dataSource={state.data.envelopes}
                  pagination={false}
                  loading={loading}
                />

                <Row justify="end" style={{ marginTop: 16 }}>
                  <Col>
                    <Pagination
                      current={pagination.current}
                      pageSize={pagination.pageSize}
                      total={pagination.total}
                      onChange={pagination.onChange}
                      showSizeChanger
                      showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} envelopes`}
                    />
                  </Col>
                </Row>
              </>
            );
          }
        }}
      />

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
    </Card>
  );
};

export default EnvelopeListPage;