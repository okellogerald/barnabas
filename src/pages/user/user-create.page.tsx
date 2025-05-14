import React from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Divider,
  Row,
  Col,
  Select,
  Spin,
  Alert
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Rule } from 'antd/es/form';
import { useUserCreate } from '@/hooks/user';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * User Create Page
 * 
 * Page for creating a new system user with form validation and role selection
 */
const UserCreatePage: React.FC = () => {
  // Get form instance, data, and handlers from hook
  const {
    form,
    isSubmitting,
    rolesData,
    churchData,
    handleSubmit,
    handleCancel,
    handleReset
  } = useUserCreate();

  // Validation rules
  const validationRules: Record<string, Rule[]> = {
    name: [
      { required: true, message: 'Please enter a name' },
      { min: 3, message: 'Name must be at least 3 characters' }
    ],
    email: [
      { required: true, message: 'Please enter an email address' },
      { type: 'email' as const, message: 'Please enter a valid email address' }
    ],
    password: [
      { required: true, message: 'Please enter a password' },
      { min: 8, message: 'Password must be at least 8 characters' }
    ],
    phoneNumber: [
      { required: true, message: 'Please enter a phone number' },
      { min: 9, message: 'Password must be at least 9 characters' }
    ],
    confirmPassword: [
      { required: true, message: 'Please confirm your password' },
      ({ getFieldValue }: any) => ({
        validator(_: any, value: string) {
          if (!value || getFieldValue('password') === value) {
            return Promise.resolve();
          }
          return Promise.reject(new Error('Passwords do not match'));
        }
      })
    ],
    roleId: [
      { required: true, message: 'Please select a role' }
    ]
  };

  return (
    <div className="user-create-page">
      <Card>
        {/* Header */}
        <Title level={3}>Create New User</Title>
        <Text type="secondary">
          Create a new system user with access to {churchData.church?.name || 'the church management system'}
        </Text>

        <Divider />

        {/* Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          {/* Personal Information Section */}
          <Title level={5}>User Information</Title>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={validationRules.name}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Full name"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email Address"
                rules={validationRules.email}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Email address"
                  type="email"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={validationRules.password}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                rules={validationRules.confirmPassword}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirm password"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="phoneNumber"
                label="Phone Number"
                rules={validationRules.phoneNumber}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Phone number"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* System Role Section */}
          <Title level={5}>System Role</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Select a predefined role to determine the user's permissions in the system
          </Text>

          {rolesData.loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin />
            </div>
          ) : rolesData.roles.length === 0 ? (
            <Alert
              message="No roles available"
              description="There are no predefined roles available in the system."
              type="warning"
            />
          ) : (
            <Form.Item
              name="roleId"
              label="Role"
              rules={validationRules.roleId}
              extra="The role determines what actions the user will be allowed to perform in the system"
            >
              <Select placeholder="Select a role">
                {rolesData.roles.map(role => (
                  <Option key={role.id} value={role.id}>
                    {role.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Divider />

          {/* Form Actions */}
          <Row justify="end">
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleCancel}
              >
                Cancel
              </Button>

              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                Reset
              </Button>

              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={isSubmitting}
                htmlType="submit"
                disabled={rolesData.roles.length === 0}
              >
                Create User
              </Button>
            </Space>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default UserCreatePage;