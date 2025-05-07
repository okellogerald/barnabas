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
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  FilterOutlined,
  ReloadOutlined,
  DownOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  LockOutlined,
  UnlockOutlined,
  MailOutlined
} from '@ant-design/icons';
import { AsyncStateMatcher } from '@/lib/state/async_state.matcher';
import { Navigation } from '@/app';
import { AuthManager } from '@/features/auth';
import { User } from '@/models';
import { Actions } from '@/features/auth/permission';
import { UserFilterState, UsersListSuccessState, useUserFilterStore, useUsersList } from '@/features/user';
import { SORT_DIRECTION } from '@/constants';

const { Title, Text } = Typography;

/**
 * Component: UserListPage
 * 
 * A page to display and manage system users with filtering, sorting, and pagination
 */
const UserListPage: React.FC = () => {
  // ======== STATE MANAGEMENT ========
  // Get the user list state
  const usersState = useUsersList();

  // Filter and sort state from store
  const filterStore = useUserFilterStore();

  // Local state for UI controls
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // ======== PERMISSIONS ========
  // Check if user has permission to create users
  const canCreateUser = AuthManager.instance.hasPermission(Actions.USER_CREATE);

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
      // Ensure isActive is a boolean if it exists
      isActive: values.isActive !== undefined
        ? values.isActive === true || values.isActive === 'true'
        : undefined
    };

    filterStore.setFilters(formattedValues);
    setFilterDrawerOpen(false);
  };

  // Handle sorting change
  const handleSortChange = (field: string) => {
    // Keep the same direction for a new field
    const currentDirection = filterStore.filters.sortDirection || SORT_DIRECTION.ASC;

    filterStore.setFilters({
      ...filterStore.filters,
      sortBy: field,
      sortDirection: currentDirection
    });
  };

  // Toggle sort direction
  const toggleSortDirection = () => {
    const currentField = filterStore.filters.sortBy || 'name';
    const newDirection = filterStore.filters.sortDirection === SORT_DIRECTION.ASC ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC;

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
    <div className="user-list-page">
      <AsyncStateMatcher
        state={usersState}
        views={{
          SuccessView: ({ state }) => {
            if (UsersListSuccessState.is(state)) {
              return (
                <>
                  {/* Header Card with Title and Actions */}
                  <Card className="page-header-card">
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Title level={3} style={{ margin: 0 }}>
                          System Users
                          <Tag color="blue" style={{ marginLeft: 8 }}>
                            {state.pagination.total} total
                          </Tag>
                        </Title>
                        <Text type="secondary">Manage system users and their roles</Text>
                      </Col>
                      <Col>
                        <Space>
                          {/* Filter Button with Badge */}
                          <Tooltip title="Filter Users">
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

                          {/* Create New User Button */}
                          {canCreateUser && (
                            <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              onClick={() => Navigation.Users.toCreate()}
                            >
                              New User
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
                                { key: 'email', label: 'Email', onClick: () => handleSortChange('email') },
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
                                    case 'email': return 'Email';
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

                    {/* Users Table */}
                    <Table
                      {...state.tableProps}
                      dataSource={state.data.users}
                      pagination={{
                        current: state.pagination.current,
                        pageSize: state.pagination.pageSize,
                        total: state.pagination.total,
                        onChange: state.pagination.onChange,
                        showSizeChanger: false,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} of ${total} users`,
                        position: ['bottomRight']
                      }}
                      loading={state.loading}
                      size="middle"
                      className="users-table"
                      expandable={{
                        expandedRowRender: (record) => <ExpandedRowContent user={record} />,
                        rowExpandable: () => true,
                      }}
                      columns={[
                        {
                          title: "Name",
                          dataIndex: "name",
                          key: "name",
                          render: (_, user) => (
                            <Space>
                              <Text strong>{user.displayName}</Text>
                              {!user.isActive && (
                                <Tag color="orange">Inactive</Tag>
                              )}
                              {user.isDeleted && (
                                <Tag color="red">Deleted</Tag>
                              )}
                            </Space>
                          ),
                        },
                        {
                          title: "Email",
                          dataIndex: "email",
                          key: "email",
                          render: (email) => (
                            <Space>
                              <MailOutlined />
                              <Text>{email}</Text>
                            </Space>
                          ),
                        },
                        {
                          title: "Role",
                          key: "role",
                          render: (_, user) => {
                            const roleName = user.role?.getDisplayName();
                            return (
                              <Tag color="blue">{roleName}</Tag>
                            );
                          },
                        },
                        {
                          title: "Status",
                          key: "status",
                          render: (_, user) => {
                            if (user.isDeleted) {
                              return <Tag color="red" icon={<LockOutlined />}>Deleted</Tag>;
                            }
                            return user.isActive ?
                              <Tag color="green" icon={<UnlockOutlined />}>Active</Tag> :
                              <Tag color="orange" icon={<LockOutlined />}>Inactive</Tag>;
                          },
                        },
                        {
                          title: "Created",
                          key: "createdAt",
                          render: (_, user) => {
                            return user.createdAt.toLocaleDateString();
                          },
                        },
                      ]}
                    />

                    {/* Empty State */}
                    {state.data.users.length === 0 && !state.loading && (
                      <div className="empty-state" style={{ textAlign: 'center', padding: '40px 0' }}>
                        <UserOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
                        <Title level={4}>No Users Found</Title>
                        <Text type="secondary">
                          {activeFiltersCount > 0
                            ? `No results found with the current filters. Try different filters or clear them.`
                            : 'There are no users in the system yet.'}
                        </Text>
                        {canCreateUser && (
                          <div style={{ marginTop: 16 }}>
                            <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              onClick={() => Navigation.Users.toCreate()}
                            >
                              Create User
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
                    roles={state.roles}
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
 * Drawer component that contains user filter form
 */
interface FilterDrawerProps {
  open: boolean;
  initialValues: Partial<UserFilterState['filters']>;
  onClose: () => void;
  onApply: (values: any) => void;
  onReset: () => void;
  roles: { id: string; name: string }[];
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  open,
  initialValues,
  onClose,
  onApply,
  onReset,
  roles
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
        <span><FilterOutlined /> Filter Users</span>
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
        <Form.Item label="Name" name="name">
          <Input placeholder="Search by name" />
        </Form.Item>

        <Form.Item label="Email" name="email">
          <Input placeholder="Search by email" />
        </Form.Item>

        <Form.Item label="Role" name="roleId">
          <Select placeholder="Select role" allowClear>
            {roles.map(role => (
              <Select.Option key={role.id} value={role.id}>
                {role.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Status" name="isActive">
          <Select placeholder="Select status" allowClear>
            <Select.Option value={true}>Active</Select.Option>
            <Select.Option value={false}>Inactive</Select.Option>
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

/**
 * Component: ExpandedRowContent
 * 
 * Renders the expanded row content with details about the user
 */
const ExpandedRowContent: React.FC<{ user: User }> = ({ user }) => {
  return (
    <Card size="small" className="expanded-row-content">
      <Row gutter={[24, 16]}>
        {/* Contact Details */}
        <Col xs={24} md={12}>
          <Title level={5}>Contact Information</Title>
          <div>
            <Space direction="vertical" size="small">
              <div>
                <Text type="secondary">Email:</Text> {user.email}
              </div>
              {user.phoneNumber && (
                <div>
                  <Text type="secondary">Phone:</Text> {user.phoneNumber}
                </div>
              )}
            </Space>
          </div>
        </Col>

        {/* System Information */}
        <Col xs={24} md={12}>
          <Title level={5}>System Information</Title>
          <Space direction="vertical" size="small">
            <div>
              <Text type="secondary">Created:</Text> {user.createdAt.toLocaleString()}
            </div>
            <div>
              <Text type="secondary">Last Updated:</Text> {user.updatedAt.toLocaleString()}
            </div>
            <div>
              <Text type="secondary">Status:</Text> {user.email}
            </div>
            <div>
              <Text type="secondary">Role:</Text> {user.getRoleName()}
            </div>
          </Space>
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
                Navigation.Users.toDetails(user.id);
              }}
            >
              View Details
            </Button>
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                Navigation.Users.toEdit(user.id);
              }}
            >
              Edit User
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default UserListPage;