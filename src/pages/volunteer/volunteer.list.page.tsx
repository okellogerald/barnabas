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
    EditOutlined,
    DeleteOutlined,
    FilterOutlined,
    ReloadOutlined,
    SortAscendingOutlined,
    SortDescendingOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import { AsyncStateMatcher } from '@/lib/state';
import { notifyUtils } from '@/utilities';
import { useAppNavigation } from '@/app';
import { VolunteerQueries } from '@/features/volunteer/volunteer.queries';
import { useVolunteersList, VolunteersListSuccessState } from '@/features/volunteer/list';

const { Option } = Select;
const { Title, Text } = Typography;
const { confirm } = Modal;

/**
 * Page to list and manage volunteer opportunities
 */
const VolunteerListPage: React.FC = () => {
    // Get all state from the hook
    const state = useVolunteersList();
    const navigate = useAppNavigation();
    const deleteMutation = VolunteerQueries.useDelete();

    // Handle deleting a volunteer opportunity with confirmation
    const handleDeleteOpportunity = (id: string, name: string) => {
        confirm({
            title: 'Are you sure you want to delete this volunteer opportunity?',
            icon: <ExclamationCircleOutlined />,
            content: (
                <div>
                    <p>You are about to delete the volunteer opportunity:</p>
                    <strong>{name}</strong>
                    <p style={{ marginTop: 8 }}>This action cannot be undone.</p>
                </div>
            ),
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await deleteMutation.mutateAsync(id);
                    notifyUtils.success('Volunteer opportunity deleted successfully');

                    // Refresh the list
                    if (VolunteersListSuccessState.is(state)) {
                        state.refresh();
                    }
                } catch (error) {
                    notifyUtils.apiError(error);
                    console.error("Failed to delete volunteer opportunity:", error);
                }
            }
        });
    };

    return (
        <div className="volunteer-list-page">
            <AsyncStateMatcher
                state={state}
                views={{
                    SuccessView: ({ state }) => {
                        if (!VolunteersListSuccessState.is(state)) {
                            return null;
                        }

                        return (
                            <>
                                {/* Header Card with Title and Actions */}
                                <Card className="page-header-card">
                                    <Row justify="space-between" align="middle">
                                        <Col>
                                            <Title level={3} style={{ margin: 0 }}>
                                                Volunteer Opportunities
                                                <Tag color="blue" style={{ marginLeft: 8 }}>
                                                    {state.pagination.total} total
                                                </Tag>
                                            </Title>
                                            <Text type="secondary">Manage volunteer opportunities and member interests</Text>
                                        </Col>
                                        <Col>
                                            <Space>
                                                {/* Filter Button with Badge */}
                                                <Tooltip title="Filter Opportunities">
                                                    <Badge count={state.filters && Object.keys(state.filters).length > 0 ? Object.keys(state.filters).length : 0} size="small" offset={[5, -3]}>
                                                        <Button
                                                            icon={<FilterOutlined />}
                                                            onClick={() => state.setFilterDrawerOpen(true)}
                                                            type={state.filters && Object.keys(state.filters).length > 0 ? "primary" : "default"}
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

                                                {/* Create Opportunity Button */}
                                                <Button
                                                    type="primary"
                                                    icon={<PlusOutlined />}
                                                    onClick={() => navigate.Opportunities.toCreate()}
                                                >
                                                    Create Opportunity
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
                                                    value={state.filters.sortBy || 'name'}
                                                    onChange={(value) => state.updateSortBy(value)}
                                                >
                                                    <Option value="name">Name</Option>
                                                    <Option value="memberCount">Member Count</Option>
                                                    <Option value="createdAt">Creation Date</Option>
                                                </Select>

                                                <Tooltip title={`Switch to ${state.filters.sortDirection === "asc" ? "descending" : "ascending"} order`}>
                                                    <Button
                                                        icon={state.filters.sortDirection === "asc" ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                                                        onClick={() => state.toggleSortDirection()}
                                                    />
                                                </Tooltip>
                                            </Space>
                                        </Col>
                                    </Row>

                                    {/* Opportunities Table */}
                                    <Table
                                        {...state.tableProps}
                                        dataSource={state.data.opportunities}
                                        columns={[
                                            ...(state.tableProps.columns || []),
                                            {
                                                title: 'Actions',
                                                key: 'actions',
                                                width: 120,
                                                render: (_, record) => (
                                                    <Space size="small">
                                                        <Button
                                                            type="text"
                                                            icon={<EditOutlined />}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate.Opportunities.toEdit(record.id);
                                                            }}
                                                        />
                                                        <Button
                                                            type="text"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteOpportunity(record.id, record.name);
                                                            }}
                                                        />
                                                    </Space>
                                                ),
                                            },
                                        ]}
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
                                                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} opportunities`}
                                            />
                                        </Col>
                                    </Row>
                                </Card>

                                {/* Filter Drawer */}
                                <Drawer
                                    title={<span><FilterOutlined /> Filter Opportunities</span>}
                                    placement="right"
                                    width={320}
                                    onClose={() => state.setFilterDrawerOpen(false)}
                                    open={state.filterDrawerOpen}
                                    styles={{
                                        body: { paddingBottom: 80 }
                                    }}
                                >
                                    <Form
                                        form={state.filterForm}
                                        layout="vertical"
                                        initialValues={state.filters}
                                        onFinish={state.applyFilters}
                                    >
                                        <Form.Item label="Name" name="name">
                                            <Input placeholder="Filter by name" />
                                        </Form.Item>

                                        <Form.Item label="Description" name="description">
                                            <Input placeholder="Filter by description" />
                                        </Form.Item>

                                        <Form.Item label="Member Status" name="hasMembers">
                                            <Select placeholder="Filter by member interest" allowClear>
                                                <Option value="true">Has Interested Members</Option>
                                                <Option value="false">No Interested Members</Option>
                                            </Select>
                                        </Form.Item>

                                        <Divider />

                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Button block onClick={state.clearFilters}>
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
                            </>
                        );
                    }
                }}
            />
        </div>
    );
};

export default VolunteerListPage;