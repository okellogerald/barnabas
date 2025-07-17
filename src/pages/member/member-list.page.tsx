import { FellowshipSelect } from "@/components/form";
import { Gender, MaritalStatus, MemberRole, EducationLevel } from "@/constants";
import { canApplyFilters, memberFilterStore, MemberListSuccessState, useMemberList } from "@/hooks/member/use-member-list";
import { isLoadingState, isErrorState, AsyncStateMatcher } from "@/lib/state";
import { DownOutlined, SortAscendingOutlined, SortDescendingOutlined, FilterOutlined, SearchOutlined, RedoOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Checkbox, Divider, Drawer, Dropdown, Flex, Form, Input, Select, Space, Tag, Tooltip, Typography, Row, Col } from "antd";
import { useState, useEffect } from "react";

// ===============================================================
// ==================== COMPONENT SECTIONS =======================
// ===============================================================

// ------------------- Sort Component ------------------------
// Define available sorting fields
const sortOptions = [
  { label: "First Name", value: "firstName" },
  { label: "Last Name", value: "lastName" },
  { label: "Membership Number", value: "envelopeNumber" },
  { label: "Date Added", value: "createdAt" },
  { label: "Date of Birth", value: "dateOfBirth" },
];

/**
 * Component for controlling the sorting of member list
 */
const MemberSorting: React.FC<{ state: MemberListSuccessState }> = ({ state }) => {
  const filterState = memberFilterStore();

  // Determine current sort field and direction
  const currentSortField = filterState.orderBy || filterState.orderByDesc || "lastName";
  const currentSortDirection = filterState.orderBy ? "asc" : "desc";

  // Find the current sort option label
  const currentSortOption = sortOptions.find(option => option.value === currentSortField);

  const handleSortChange = (field: string) => {
    // Keep the same direction, just change the field
    state.actions.table.setSorting(field, currentSortDirection);
  };

  const toggleSortDirection = () => {
    // Toggle direction for current field
    const newDirection = currentSortDirection === "asc" ? "desc" : "asc";
    state.actions.table.setSorting(currentSortField, newDirection);
  };

  // Create menu items for dropdown
  const items = sortOptions.map(option => ({
    key: option.value,
    label: option.label,
    onClick: () => handleSortChange(option.value),
  }));

  return (
    <Space>
      <span style={{ color: '#8c8c8c' }}>Sort by:</span>
      <Dropdown menu={{ items }} placement="bottomRight">
        <Button style={{ minWidth: '130px' }}>
          <Space>
            {currentSortOption?.label || "Last Name"}
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>

      <Tooltip title={`Switch to ${currentSortDirection === "asc" ? "descending" : "ascending"} order`}>
        <Button
          icon={currentSortDirection === "asc" ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
          onClick={toggleSortDirection}
        />
      </Tooltip>
    </Space>
  );
};

// ----------------- Filter Component -----------------------
/**
 * Enhanced filter drawer with improved layout and new filters
 */
const MemberFiltersDrawer: React.FC<{
  state: MemberListSuccessState;
  visible: boolean;
  onClose: () => void;
}> = ({ state, visible, onClose }) => {
  const [form] = Form.useForm();
  const filterState = memberFilterStore();
  const filters = filterState.filters;

  // Extended local state for filter values
  const [localFilters, setLocalFilters] = useState({
    search: filters.search || '',
    firstName: filters.firstName || '',
    lastName: filters.lastName || '',
    fellowshipId: filters.fellowshipId,
    gender: filters.gender,
    maritalStatus: filters.maritalStatus,
    memberRole: filters.memberRole,
    educationLevel: filters.educationLevel,
    profession: filters.profession || '',
    hasEnvelope: filters.hasEnvelope,
    isBaptized: filters.isBaptized,
    isConfirmed: filters.isConfirmed,
    attendsFellowship: filters.attendsFellowship
  });

  // Initialize form with current filters
  useEffect(() => {
    form.setFieldsValue(localFilters);
  }, [form, localFilters]);

  // Handle filter changes
  const handleFilterChange = (_: any, allValues: any) => {
    setLocalFilters(allValues);
  };

  // Apply filters
  const handleApplyFilters = () => {
    state.actions.table.applyFilters(localFilters);
    onClose();
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      firstName: '',
      lastName: '',
      fellowshipId: undefined,
      gender: undefined,
      maritalStatus: undefined,
      memberRole: undefined,
      educationLevel: undefined,
      profession: '',
      hasEnvelope: undefined,
      isBaptized: undefined,
      isConfirmed: undefined,
      attendsFellowship: undefined
    };
    setLocalFilters(clearedFilters);
    form.resetFields();
    state.actions.table.clearFilters();
    onClose();
  };

  return (
    <Drawer
      title={
        <Space>
          <FilterOutlined />
          <span>Filter Members</span>
        </Space>
      }
      width={450} // Increased width for better layout
      placement="right"
      onClose={onClose}
      open={visible}
      bodyStyle={{ paddingBottom: 80 }}
      footer={
        <Space>
          <Button onClick={handleClearFilters}>
            Clear All
          </Button>
          <Button
            type="primary"
            onClick={handleApplyFilters}
            disabled={!canApplyFilters(localFilters)}
          >
            Apply Filters
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFilterChange}
        initialValues={localFilters}
      >
        {/* Search & Quick Filters Section */}
        <div style={{ marginBottom: 16 }}>
          <Form.Item name="search" label="Search" style={{ marginBottom: 12 }}>
            <Input
              placeholder="Search members..."
              prefix={<SearchOutlined />}
            />
          </Form.Item>

          <Form.Item name="hasEnvelope" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Checkbox>Has Envelope Number</Checkbox>
          </Form.Item>
        </div>

        <Divider orientation="left" style={{ margin: '16px 0 12px 0' }}>Personal Information</Divider>

        {/* Personal Info - Two Column Layout */}
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="firstName" label="First Name">
              <Input placeholder="First name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="lastName" label="Last Name">
              <Input placeholder="Last name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="gender" label="Gender">
              <Select allowClear placeholder="Select gender">
                {Object.values(Gender).map(gender => (
                  <Select.Option key={gender} value={gender}>{gender}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="maritalStatus" label="Marital Status">
              <Select allowClear placeholder="Select status">
                {Object.values(MaritalStatus).map(status => (
                  <Select.Option key={status} value={status}>{status}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" style={{ margin: '16px 0 12px 0' }}>Church Information</Divider>

        {/* Church Info - Two Column Layout */}
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="fellowshipId" label="Fellowship">
              <FellowshipSelect 
                value={localFilters.fellowshipId}
                onChange={(value) => setLocalFilters(prev => ({ ...prev, fellowshipId: value }))}
                placeholder="Select fellowship"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="memberRole" label="Member Role">
              <Select allowClear placeholder="Select role">
                {Object.values(MemberRole).map(role => (
                  <Select.Option key={role} value={role}>{role}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="educationLevel" label="Education Level">
              <Select allowClear placeholder="Select education">
                {Object.values(EducationLevel).map(level => (
                  <Select.Option key={level} value={level}>{level}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="profession" label="Profession">
              <Input placeholder="Enter profession" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" style={{ margin: '16px 0 12px 0' }}>Church Status</Divider>

        {/* Status - Checkbox Grid */}
        <Row gutter={[12, 8]}>
          <Col span={12}>
            <Form.Item name="isBaptized" valuePropName="checked" style={{ marginBottom: 8 }}>
              <Checkbox>Baptized</Checkbox>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="isConfirmed" valuePropName="checked" style={{ marginBottom: 8 }}>
              <Checkbox>Confirmed</Checkbox>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="attendsFellowship" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Checkbox>Attends Fellowship</Checkbox>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
};

// -------------------- Page Components ------------------------

/**
 * Header section of the member list page
 */
const MembersHeader: React.FC<{ state: MemberListSuccessState }> = ({ state }) => {
  return (
    <Flex vertical gap="middle" style={{ width: '100%' }}>
      {/* Title and primary actions */}
      <Flex justify="space-between" align="center">
        <Typography.Title level={4} style={{ margin: 0 }}>
          Church Members
          {state.table.memberCount > 0 && (
            <Tag color="blue" style={{ marginLeft: 8 }}>
              {state.table.memberCount} total
            </Tag>
          )}
        </Typography.Title>

        <Space size="middle">
          <Button
            onClick={() => state.actions.table.toggleFiltersVisible()}
            type={state.table.filters.filtersApplied ? "primary" : "default"}
            icon={<FilterOutlined />}
          >
            Filters
          </Button>

          <Button
            onClick={() => state.actions.table.refresh()}
            icon={<RedoOutlined />}
          >
            Refresh
          </Button>

          <Button
            onClick={() => state.actions.addNew()}
            type="primary"
            icon={<PlusOutlined />}
          >
            Add Member
          </Button>
        </Space>
      </Flex>

      {/* Sorting options, always visible */}
      <Flex justify="flex-end" align="center">
        <MemberSorting state={state} />
      </Flex>

      <Divider style={{ margin: '0 0 12px 0' }} />
    </Flex>
  );
};

/**
 * Success view for the member list page
 */
const SuccessView: React.FC<{ state: any }> = ({ state }) => {
  if (MemberListSuccessState.is(state))
    return (
      <>
        {state.table.render()}

        <MemberFiltersDrawer
          state={state}
          visible={state.table.filters.filtersVisible}
          onClose={() => state.actions.table.toggleFiltersVisible()}
        />
      </>
    );
};

/**
 * Loading view for the member list page
 */
const LoadingView: React.FC<{ state: any }> = ({ state }) => (
  <div style={{ textAlign: 'center', padding: 100 }}>
    {isLoadingState(state) && <div>{state.message}</div>}
  </div>
);

/**
 * Error view for the member list page
 */
const ErrorView: React.FC<{ state: any }> = ({ state }) => (
  <div style={{ textAlign: 'center', padding: 100 }}>
    {isErrorState(state) && (
      <>
        <div>{state.message}</div>
        <Button
          onClick={() => state.retry()}
          style={{ marginTop: 16 }}
        >
          Try Again
        </Button>
      </>
    )}
  </div>
);

// ===============================================================
// ====================== MAIN COMPONENT =========================
// ===============================================================

/**
 * Enhanced Member list page component
 * 
 * This component displays a list of church members with enhanced filtering capabilities:
 * - Wider filter drawer (450px) for better layout
 * - Two-column layout within drawer for efficient space usage
 * - AsyncSelect for fellowship selection with search
 * - Education level and profession filters
 * - Envelope status filter
 * - Logical grouping with clear sections
 * - Improved typography and spacing
 */
const MemberListPage: React.FC = () => {
  const state = useMemberList();

  return (
    <div style={{ padding: 24 }}>
      {MemberListSuccessState.is(state) && <MembersHeader state={state} />}

      <AsyncStateMatcher
        state={state}
        views={{
          SuccessView,
          LoadingView,
          ErrorView
        }}
      />
    </div>
  );
};

export default MemberListPage;