import React from 'react';
import { Form, Typography, Alert, Button, Space } from 'antd';
import { FormFieldBuilder } from '@/components';
import { LoginRequest } from '@/data/auth';
import { AuthLayout } from '@/components/layout';
import { UseLogin } from '@/interactors/login';

const { Title, Text } = Typography;

// Create form fields
const fieldBuilder = new FormFieldBuilder<LoginRequest>();

const formFields = {
  username: fieldBuilder.createEmailField({
    label: 'Email',
    name: 'username',
    required: true,
    placeholder: 'Enter your email'
  }),
  password: fieldBuilder.createPasswordField({
    label: 'Password',
    name: 'password',
    required: true,
    placeholder: 'Enter your password'
  })
};

/**
 * Login page component using Ant Design components
 */
const LoginPage: React.FC = () => {
  const state = UseLogin()

  return (
    <AuthLayout>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={2}>Church Management</Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        {state.error && (
          <Alert
            message={`Login failed: ${state.error}`}
            type="error"
            closable={true}
            onClose={state.removeError}
          />
        )}

        <Form
          form={state.form}
          layout="vertical"
          onFinish={state.onFinish}
        >
          <Form.Item
            {...formFields.username}
          >
            {formFields.username.render()}
          </Form.Item>

          <Form.Item
            {...formFields.password}
          >
            {formFields.password.render()}
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={state.loading}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Space>
    </AuthLayout>
  );
};

export default LoginPage;