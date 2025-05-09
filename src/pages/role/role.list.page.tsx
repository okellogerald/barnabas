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
import { AsyncStateMatcher } from '@/lib/state/async_state.matcher';
import { Navigation } from '@/app';
import { Role } from '@/models';
import { RoleQueries } from '@/features/role';
import { RoleFilterState, RolesListSuccessState, useRoleFilterStore, useRolesList } from '@/features/role/role-list';
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
                    <div style={{ marginBottom: 16, background: '#f0f5ff', padding: 16, borderRadius: 2, display: 'flex', alignItems: 'center' }}>
                      <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 16, marginRight: 8 }} />
                      <Text type="secondary">
                        System roles are predefined and cannot be modified. Each role has specific actions that determine what users with that role can do.
                      </Text>
                    </div>

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
                                  switch(sortBy) {
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
                      expandable={{
                        expandedRowRender: (record) => <ExpandedRowContent role={record} />,
                        rowExpandable: () => true,
                      }}
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

/**
 * Component: ExpandedRowContent
 * 
 * Renders the expanded row content with details about the role and its actions
 */
const ExpandedRowContent: React.FC<{ role: Role }> = ({ role }) => {
  // We need to fetch the role actions when the row is expanded
  const roleActionsQuery = React.useMemo(() => {
    return RoleQueries.useActions(role.id);
  }, [role.id]);

  return (
    <Card size="small" className="expanded-row-content">
      <Row gutter={[24, 16]}>
        {/* Role Description */}
        <Col xs={24} md={12}>
          <Title level={5}>Description</Title>
          <Text>
            {role.getDescription ? role.getDescription() : role.description || 'No description available'}
          </Text>
        </Col>

        {/* Role Actions */}
        <Col xs={24} md={12}>
          <Title level={5}>Role Actions</Title>
          <div>
            {roleActionsQuery.isLoading ? (
              <Text>Loading actions...</Text>
            ) : roleActionsQuery.isError ? (
              <Text type="danger">Error loading actions</Text>
            ) : (roleActionsQuery.data?.length || 0) > 0 ? (
              <div style={{ marginTop: 8 }}>
                {roleActionsQuery.data?.map((action) => (
                  <Tag key={action.id} style={{ margin: '0 8px 8px 0' }}>
                    {action.action}
                  </Tag>
                ))}
              </div>
            ) : (
              <Text type="secondary">No specific actions defined for this role</Text>
            )}
          </div>
        </Col>

        {/* Actions */}
        <Col span={24}>
          <Divider style={{ margin: '8px 0' }} />
          <Space>
            <Button
              type="primary"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                Navigation.Roles.toDetails(role.id);
              }}
            >
              View Details
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default RolesListPage;