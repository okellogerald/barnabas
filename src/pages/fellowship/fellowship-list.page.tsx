import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Typography,
  Divider,
  Row,
  Col,
  Space,
  Dropdown,
  Drawer,
  Form,
  Input,
  Select,
  Badge,
  Tag,
  Tooltip,
  Spin
} from 'antd';
import {
  PlusOutlined,
  TeamOutlined,
  FilterOutlined,
  ReloadOutlined,
  DownOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import { useFellowshipsList, FellowshipsListSuccessState } from '@/hooks/fellowship/fellowship-list';
import { AsyncStateMatcher } from '@/lib/state';
import { Navigation } from '@/app';
import { AuthenticationManager } from '@/data/authentication';
import { FellowshipFilterState, useFellowshipFilterStore } from '@/hooks/fellowship/fellowship-list';
import { Actions } from '@/data/authorization';
import { SortDirection } from '@/lib/query';

const { Title, Text } = Typography;

/**
 * Component: FellowshipListPage
 * 
 * A page to display and manage fellowships with filtering, sorting, and pagination
 */
const FellowshipListPage: React.FC = () => {
  // ======== STATE MANAGEMENT ========
  // Get the fellowship list state
  const fellowshipsState = useFellowshipsList();

  // Filter and sort state from store
  const filterStore = useFellowshipFilterStore();

  // Local state for UI controls
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // ======== PERMISSIONS ========
  // Check if user has permission to create fellowships
  const canCreateFellowship = AuthenticationManager.instance.hasPermission(Actions.FELLOWSHIP_CREATE);

  // ======== FILTER COUNT TRACKING ========
  // Count active filters (excluding sort options)
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

  // ======== HANDLERS ========
  // Handle filter application
  const handleApplyFilters = (values: any) => {
    // Format values for our filtering system
    const formattedValues = {
      ...values,
      // Ensure hasLeadership is a boolean if it exists
      hasLeadership: values.hasLeadership !== undefined
        ? values.hasLeadership === true || values.hasLeadership === 'true'
        : undefined
    };

    filterStore.setFilters(formattedValues);
    setFilterDrawerOpen(false);
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
    const currentField = filterStore.filters.sortBy || 'name';
    const newDirection = filterStore.filters.sortDirection === 'asc' ? SortDirection.DESC : SortDirection.ASC;

    filterStore.setFilters({
      ...filterStore.filters,
      sortBy: currentField,
      sortDirection: newDirection
    });
  };

  // Reset filters
  const handleResetFilters = () => {
    filterStore.resetFilters();
    setFilterDrawerOpen(false);
  };

  // ======== RENDER COMPONENTS ========
  return (
    <div className="fellowship-list-page">
      <AsyncStateMatcher
        state={fellowshipsState}
        views={{
          SuccessView: ({ state }) => {
            if (FellowshipsListSuccessState.is(state)) {
              return (
                <>
                  {/* Header Card with Title and Actions */}
                  <Card className="page-header-card">
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Title level={3} style={{ margin: 0 }}>
                          Fellowships
                          <Tag color="blue" style={{ marginLeft: 8 }}>
                            {state.pagination.total} total
                          </Tag>
                        </Title>
                        <Text type="secondary">Manage church fellowships and their leadership</Text>
                      </Col>
                      <Col>
                        <Space>
                          {/* Filter Button with Badge */}
                          <Tooltip title="Filter Fellowships">
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

                          {/* Create New Fellowship Button */}
                          {canCreateFellowship && (
                            <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              onClick={() => Navigation.Fellowships.toCreate()}
                            >
                              New Fellowship
                            </Button>
                          )}
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
                          <Dropdown
                            menu={{
                              items: [
                                { key: 'name', label: 'Name', onClick: () => handleSortChange('name') },
                                { key: 'createdAt', label: 'Date Created', onClick: () => handleSortChange('createdAt') },
                                { key: 'updatedAt', label: 'Last Updated', onClick: () => handleSortChange('updatedAt') },
                              ]
                            }}
                            placement="bottomRight"
                          >
                            <Button style={{ minWidth: '130px' }}>
                              <Space>
                                {(() => {
                                  const sortBy = filterStore.filters.sortBy || 'name';
                                  switch (sortBy) {
                                    case 'name': return 'Name';
                                    case 'createdAt': return 'Date Created';
                                    case 'updatedAt': return 'Last Updated';
                                    default: return 'Name';
                                  }
                                })()}
                                <DownOutlined />
                              </Space>
                            </Button>
                          </Dropdown>

                          <Tooltip title={`Switch to ${filterStore.filters.sortDirection === "asc" ? "descending" : "ascending"} order`}>
                            <Button
                              icon={filterStore.filters.sortDirection === "asc" ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                              onClick={toggleSortDirection}
                            />
                          </Tooltip>
                        </Space>
                      </Col>
                    </Row>

                    {/* Fellowships Table */}
                    <Table
                      {...state.tableProps}
                      dataSource={state.data.fellowships}
                      pagination={{
                        current: state.pagination.current,
                        pageSize: state.pagination.pageSize,
                        total: state.pagination.total,
                        onChange: state.pagination.onChange,
                        showSizeChanger: false,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} of ${total} fellowships`,
                        position: ['bottomRight']
                      }}
                      loading={state.loading}
                      size="middle"
                      className="fellowships-table"
                      columns={[
                        {
                          title: "Name",
                          dataIndex: "name",
                          key: "name",
                          render: (_, fellowship) => (
                            <Space>
                              <Text strong>{fellowship.getDisplayName()}</Text>
                              {!fellowship.hasLeadership() && (
                                <Tag color="orange">No Leadership</Tag>
                              )}
                            </Space>
                          ),
                        },
                        {
                          title: "Leadership",
                          key: "leadership",
                          render: (_, fellowship) => {
                            if (!fellowship.hasLeadership()) {
                              return <Text type="secondary">Not assigned</Text>;
                            }

                            const chairmanName = fellowship.chairman?.getFullName?.() || "N/A";
                            return (
                              <Space direction="vertical" size="small">
                                <Text>Chairman: {chairmanName}</Text>
                              </Space>
                            );
                          },
                        },
                        {
                          title: "Members",
                          key: "memberCount",
                          render: (_, fellowship) => {
                            // Check if we have a memberCount property (added by hook)
                            if ((fellowship as any).memberCount !== undefined) {
                              const count = (fellowship as any).memberCount;
                              return `${count} member${count !== 1 ? 's' : ''}`;
                            }

                            if (!state.loadingCounts) {
                              const count = state.memberCounts[fellowship.id] || 0;
                              return `${count} member${count !== 1 ? 's' : ''}`;
                            }

                            // Gracefully handle undefined memberCount
                            return <span><Spin size="small" style={{ marginRight: 8 }} />Loading count...</span>;
                          },
                        },
                        {
                          title: "Created",
                          key: "createdAt",
                          render: (_, fellowship) => {
                            return fellowship.createdAt.toLocaleDateString();
                          },
                        },
                      ]}
                    />

                    {/* Empty State */}
                    {state.data.fellowships.length === 0 && !state.loading && (
                      <div className="empty-state" style={{ textAlign: 'center', padding: '40px 0' }}>
                        <TeamOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
                        <Title level={4}>No Fellowships Found</Title>
                        <Text type="secondary">
                          {activeFiltersCount > 0
                            ? `No results found with the current filters. Try different filters or clear them.`
                            : 'There are no fellowships in the system yet.'}
                        </Text>
                        {canCreateFellowship && (
                          <div style={{ marginTop: 16 }}>
                            <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              onClick={() => Navigation.Fellowships.toCreate()}
                            >
                              Create Fellowship
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>

                  {/* Filter Drawer */}
                  <FilterDrawer
                    open={filterDrawerOpen}
                    initialValues={filterStore.filters}
                    onClose={() => setFilterDrawerOpen(false)}
                    onApply={handleApplyFilters}
                    onReset={handleResetFilters}
                  />
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

/**
 * Component: FilterDrawer
 * 
 * Drawer component that contains fellowship filter form
 */
interface FilterDrawerProps {
  open: boolean;
  initialValues: Partial<FellowshipFilterState['filters']>;
  onClose: () => void;
  onApply: (values: any) => void;
  onReset: () => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  open,
  initialValues,
  onClose,
  onApply,
  onReset
}) => {
  const [form] = Form.useForm();

  // Apply filters
  const handleApply = () => {
    const values = form.getFieldsValue();
    onApply(values);
  };

  // Reset form and call parent reset handler
  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  return (
    <Drawer
      title={
        <span><FilterOutlined /> Filter Fellowships</span>
      }
      placement="right"
      width={320}
      onClose={onClose}
      open={open}
      styles={{
        body: { paddingBottom: 80 }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
      >
        <Form.Item label="Fellowship Name" name="name">
          <Input placeholder="Search by name" />
        </Form.Item>

        <Form.Item label="Has Leadership" name="hasLeadership">
          <Select placeholder="Leadership status" allowClear>
            <Select.Option value={true}>Has leadership</Select.Option>
            <Select.Option value={false}>Missing leadership</Select.Option>
          </Select>
        </Form.Item>

        <Divider />

        <Row gutter={16}>
          <Col span={12}>
            <Button block onClick={handleReset}>
              Reset
            </Button>
          </Col>
          <Col span={12}>
            <Button type="primary" block onClick={handleApply}>
              Apply Filters
            </Button>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
};

export default FellowshipListPage;