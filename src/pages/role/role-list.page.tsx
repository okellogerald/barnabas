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
  Badge,
  Tag,
  Tooltip,
  Alert,
} from 'antd';
import {
  KeyOutlined,
  FilterOutlined,
  ReloadOutlined,
  DownOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { AsyncStateMatcher } from '@/lib/state';
import { RoleFilterState, RolesListSuccessState, useRoleFilterStore, useRolesList } from '@/hooks/role/role-list';
import { SortDirection } from '@/lib/query';

const { Title, Text } = Typography;

/**
 * Component: RolesListPage
 * 
 * A page to display system roles with filtering, sorting, and pagination.
 * Note: Roles are predefined and cannot be created, edited, or deleted.
 */
const RolesListPage: React.FC = () => {
  // ======== STATE MANAGEMENT ========
  // Get the role list state
  const rolesState = useRolesList();

  // Filter and sort state from store
  const filterStore = useRoleFilterStore();

  // Local state for UI controls
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

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
    filterStore.setFilters(values);
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
    <div className="role-list-page">
      <AsyncStateMatcher
        state={rolesState}
        views={{
          SuccessView: ({ state }) => {
            if (RolesListSuccessState.is(state)) {
              return (
                <>
                  {/* Header Card with Title and Actions */}
                  <Card className="page-header-card">
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Title level={3} style={{ margin: 0 }}>
                          System Roles
                          <Tag color="blue" style={{ marginLeft: 8 }}>
                            {state.pagination.total} total
                          </Tag>
                        </Title>
                        <Text type="secondary">
                          View predefined system roles and their actions
                        </Text>
                      </Col>
                      <Col>
                        <Space>
                          {/* Filter Button with Badge */}
                          <Tooltip title="Filter Roles">
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
                        </Space>
                      </Col>
                    </Row>
                  </Card>

                  {/* Main Content Card */}
                  <Card style={{ marginTop: 16 }}>
                    {/* Additional Info Banner */}
                    <Alert
                      banner
                      type="info"
                      message="System roles are predefined and cannot be modified. Each role has specific actions that determine what users with that role can do."
                      icon={<InfoCircleOutlined />}
                      style={{ marginBottom: 16, padding: 16 }}
                    />

                    {/* Sorting Controls */}
                    <Row justify="end" style={{ marginBottom: 16 }}>
                      <Col>
                        <Space style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ color: '#8c8c8c' }}>Sort by:</span>
                          <Dropdown
                            menu={{
                              items: [
                                { key: 'name', label: 'Name', onClick: () => handleSortChange('name') },
                                { key: 'description', label: 'Description', onClick: () => handleSortChange('description') },
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
                                    case 'description': return 'Description';
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

                    {/* Roles Table */}
                    <Table
                      {...state.tableProps}
                      dataSource={state.data.roles}
                      pagination={{
                        current: state.pagination.current,
                        pageSize: state.pagination.pageSize,
                        total: state.pagination.total,
                        onChange: state.pagination.onChange,
                        showSizeChanger: false,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} of ${total} roles`,
                        position: ['bottomRight']
                      }}
                      loading={state.loading}
                      size="middle"
                      className="roles-table"
                    />

                    {/* Empty State */}
                    {state.data.roles.length === 0 && !state.loading && (
                      <div className="empty-state" style={{ textAlign: 'center', padding: '40px 0' }}>
                        <KeyOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
                        <Title level={4}>No Roles Found</Title>
                        <Text type="secondary">
                          {activeFiltersCount > 0
                            ? `No results found with the current filters. Try different filters or clear them.`
                            : 'There are no roles defined in the system.'}
                        </Text>
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
 * Drawer component that contains role filter form
 */
interface FilterDrawerProps {
  open: boolean;
  initialValues: Partial<RoleFilterState['filters']>;
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
        <span><FilterOutlined /> Filter Roles</span>
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
        <Form.Item label="Role Name" name="name">
          <Input placeholder="Search by name" />
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

export default RolesListPage;