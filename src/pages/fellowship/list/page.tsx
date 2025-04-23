import React, { useState } from 'react';
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
  Menu,
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
  SortAscendingOutlined,
  DownOutlined
} from '@ant-design/icons';
import { useFellowshipsList, FellowshipsListSuccessState } from '@/features/fellowship/fellowship-list';
import { AsyncStateMatcher } from '@/lib/state/async_state.matcher';
import { Navigation } from '@/app';
import { AuthManager } from '@/managers/auth';
import { Fellowship } from '@/models';
import { FellowshipFilterState, useFellowshipFilterStore } from '@/features/fellowship/fellowship-list';

const { Title, Text } = Typography;

// Filters component for the drawer
const FellowshipFilters: React.FC<{
  initialValues: Partial<FellowshipFilterState['filters']>,
  onApply: (values: any) => void,
  onReset: () => void
}> = ({ initialValues, onApply, onReset }) => {
  const [form] = Form.useForm();

  // Apply filters
  const handleApply = () => {
    const values = form.getFieldsValue();
    onApply(values);
  };

  // Reset filters
  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
    >
      <Form.Item label="Fellowship Name" name="searchTerm">
        <Input placeholder="Search by name" />
      </Form.Item>

      <Form.Item label="Member Count" name="memberCount">
        <Select placeholder="Filter by members">
          <Select.Option value="empty">No members (0)</Select.Option>
          <Select.Option value="small">Small (1-10)</Select.Option>
          <Select.Option value="medium">Medium (11-30)</Select.Option>
          <Select.Option value="large">Large (31+)</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="Has Leadership" name="hasLeadership">
        <Select placeholder="Leadership status">
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
  );
};

// Sort menu component
const SortMenu: React.FC<{
  currentSort?: string,
  currentDirection?: 'asc' | 'desc',
  onChange: (field: string, direction: 'asc' | 'desc') => void
}> = ({ currentSort, currentDirection, onChange }) => {
  return (
    <Menu
      selectedKeys={currentSort ? [currentSort] : []}
      onClick={({ key }) => onChange(key, currentDirection || 'asc')}
    >
      <Menu.Item key="name">Name</Menu.Item>
      <Menu.Item key="memberCount">Member Count</Menu.Item>
      <Menu.Item key="createdAt">Date Created</Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="direction"
        onClick={(e) => {
          e.domEvent.stopPropagation();
          if (currentSort) {
            onChange(currentSort, currentDirection === 'asc' ? 'desc' : 'asc');
          }
        }}
      >
        {currentDirection === 'desc' ? 'Ascending' : 'Descending'}
      </Menu.Item>
    </Menu>
  );
};

// Expanded row content for fellowship details
const ExpandedRowContent: React.FC<{ fellowship: Fellowship }> = ({ fellowship }) => {
  // Get the member count (from our enhanced property)
  const memberCount = (fellowship as any).memberCount;

  return (
    <Card variant={"outlined"} size="small" className="expanded-row-content">
      <Row gutter={[24, 16]}>
        {/* Leadership Column */}
        <Col xs={24} md={12}>
          <Title level={5}>Leadership</Title>
          {fellowship.hasLeadership() ? (
            <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
              {fellowship.getLeaderContactInfo().map((contact, index) => (
                <li key={index}>{contact}</li>
              ))}
            </ul>
          ) : (
            <Text type="secondary">No leadership assigned to this fellowship</Text>
          )}
        </Col>

        {/* Members Summary Column */}
        <Col xs={24} md={12}>
          <Title level={5}>Members</Title>
          {memberCount !== undefined ? (
            <div>
              <Text>{memberCount} member{memberCount !== 1 ? 's' : ''}</Text>
              {memberCount > 0 && (
                <div style={{ marginTop: 8 }}>
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      Navigation.Members.list({ fellowshipId: fellowship.id });
                    }}
                  >
                    View All Members
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Spin size="small" />
          )}
        </Col>

        {/* Notes Row (Full Width) */}
        {fellowship.notes && (
          <Col span={24}>
            <Divider style={{ margin: '8px 0' }} />
            <Title level={5}>Notes</Title>
            <Text>{fellowship.notes}</Text>
          </Col>
        )}

        {/* Actions */}
        <Col span={24}>
          <Divider style={{ margin: '8px 0' }} />
          <Space>
            <Button
              type="primary"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                Navigation.Fellowships.toDetails(fellowship.id);
              }}
            >
              View Details
            </Button>
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                Navigation.Fellowships.toEdit(fellowship.id);
              }}
            >
              Edit Fellowship
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

// Main Fellowship List Page component
const FellowshipListPage: React.FC = () => {
  // Get the fellowship list state
  const fellowshipsState = useFellowshipsList();

  // Filter and sort state from store
  const filterStore = useFellowshipFilterStore();

  // Local state for UI controls
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Check if user has permission to create fellowships
  const canCreateFellowship = AuthManager.instance.hasPermission('FELLOWSHIP_CREATE');

  // Count active filters
  React.useEffect(() => {
    // Count non-empty filter values
    const count = Object.values(filterStore.filters).filter(
      value => value !== undefined && value !== null && value !== ''
    ).length;
    setActiveFiltersCount(count);
  }, [filterStore.filters]);

  // Handle filter application
  const handleApplyFilters = (values: any) => {
    // Format values for our enhanced filtering system
    // This is the appropriate place to transform filter values
    const formattedValues = {
      ...values,
      // Ensure memberCount is passed correctly
      memberCount: values.memberCount || undefined,
      // Ensure hasLeadership is a boolean if it exists
      hasLeadership: values.hasLeadership !== undefined
        ? values.hasLeadership === true || values.hasLeadership === 'true'
        : undefined
    };

    filterStore.setFilters(formattedValues);
    setFilterDrawerOpen(false);
  };

  // Handle sorting change
  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    if (field === 'direction') return;
    filterStore.setFilters({
      sortBy: field,
      sortDirection: direction
    });
  };

  return (
    <div className="fellowship-list-page">
      <AsyncStateMatcher
        state={fellowshipsState}
        views={{
          SuccessView: ({ state }) => {
            if (FellowshipsListSuccessState.is(state)) {
              return (
                <>
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
                          <Tooltip title="Filter Fellowships">
                            <Badge count={activeFiltersCount} size="small">
                              <Button
                                icon={<FilterOutlined />}
                                onClick={() => setFilterDrawerOpen(true)}
                              >
                                Filters
                              </Button>
                            </Badge>
                          </Tooltip>

                          <Tooltip title="Refresh List">
                            <Button
                              icon={<ReloadOutlined />}
                              onClick={() => state.refresh()}
                              loading={state.loading}
                            >
                              Refresh
                            </Button>
                          </Tooltip>

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

                  <Card style={{ marginTop: 16 }}>
                    <Row justify="end" style={{ marginBottom: 16 }}>
                      <Col>
                        <Dropdown
                          overlay={
                            <SortMenu
                              currentSort={filterStore.filters.sortBy}
                              currentDirection={filterStore.filters.sortDirection}
                              onChange={handleSortChange}
                            />
                          }
                          trigger={['click']}
                        >
                          <Button>
                            <Space>
                              <SortAscendingOutlined />
                              Sort by {filterStore.filters.sortBy ? filterStore.filters.sortBy : 'Default'}
                              <DownOutlined />
                            </Space>
                          </Button>
                        </Dropdown>
                      </Col>
                    </Row>

                    <Table
                      {...state.tableProps}
                      dataSource={state.data.fellowships}
                      pagination={{
                        current: state.pagination.current,
                        pageSize: state.pagination.pageSize,
                        total: state.pagination.total,
                        onChange: state.pagination.onChange,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        onShowSizeChange: (_, size) => filterStore.setPageSize(size),
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} of ${total} fellowships`,
                        position: ['bottomRight']
                      }}
                      loading={state.loading}
                      size="middle"
                      className="fellowships-table"
                      expandable={{
                        expandedRowRender: (record) => <ExpandedRowContent fellowship={record} />,
                        rowExpandable: () => true,
                      }}
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
                          title: "Members",
                          key: "memberCount",
                          render: (_, fellowship) => {
                            // Check if we have a memberCount property (added by our hook)
                            if ((fellowship as any).memberCount !== undefined) {
                              const count = (fellowship as any).memberCount;
                              return `${count} member${count !== 1 ? 's' : ''}`;
                            }

                            // Gracefully handle undefined memberCount
                            return <span><Spin size="small" style={{ marginRight: 8 }} />Loading count...</span>;
                          },
                        },
                        {
                          title: "Actions",
                          key: "actions",
                          width: 180,
                          render: (_, fellowship) => (
                            <Space>
                              <Button
                                type="link"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  Navigation.Fellowships.toDetails(fellowship.id);
                                }}
                              >
                                View
                              </Button>
                              <Button
                                type="link"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  Navigation.Fellowships.toEdit(fellowship.id);
                                }}
                              >
                                Edit
                              </Button>
                            </Space>
                          ),
                        }
                      ]}
                    />

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
                  <Drawer
                    title="Filter Fellowships"
                    placement="right"
                    width={320}
                    onClose={() => setFilterDrawerOpen(false)}
                    open={filterDrawerOpen}
                    styles={{
                      body: { paddingBottom: 80 }
                    }}
                  >
                    <FellowshipFilters
                      initialValues={filterStore.filters}
                      onApply={handleApplyFilters}
                      onReset={() => {
                        filterStore.resetFilters();
                        setFilterDrawerOpen(false);
                      }}
                    />
                  </Drawer>
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

export default FellowshipListPage;