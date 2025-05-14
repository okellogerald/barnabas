import React from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Row,
  Col,
  Divider
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useFellowshipCreate } from '@/hooks/fellowship';

const { Title, Text } = Typography;
const { TextArea } = Input;

/**
 * Fellowship Creation Page
 * 
 * Allows users to create a new fellowship with name and notes
 */
const FellowshipCreatePage: React.FC = () => {
  // Get form handling logic from hook
  const {
    form,
    isSubmitting,
    handleSubmit,
    handleCancel,
    handleReset
  } = useFellowshipCreate();

  return (
    <div className="fellowship-create-page">
      <Card>
        <Row gutter={[0, 16]}>
          {/* Page Header */}
          <Col span={24}>
            <Title level={4}>Create New Fellowship</Title>
            <Text type="secondary">
              Create a new fellowship for organizing church members into smaller community groups
            </Text>
          </Col>

          {/* Form Area */}
          <Col span={24}>
            <Divider />
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={true}
              validateTrigger={['onBlur', 'onChange']}
            >
              {/* Fellowship Name */}
              <Form.Item
                name="name"
                label="Fellowship Name"
                rules={[
                  { required: true, message: 'Please enter the fellowship name' },
                  { max: 100, message: 'Name cannot exceed 100 characters' }
                ]}
              >
                <Input placeholder="Enter fellowship name" />
              </Form.Item>

              {/* Fellowship Notes */}
              <Form.Item
                name="notes"
                label="Notes"
                rules={[
                  { max: 500, message: 'Notes cannot exceed 500 characters' }
                ]}
              >
                <TextArea
                  placeholder="Enter optional notes about this fellowship"
                  rows={4}
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              {/* Form Actions */}
              <Divider />
              <Form.Item>
                <Row justify="space-between">
                  <Col>
                    <Button
                      icon={<ArrowLeftOutlined />}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </Col>
                  <Col>
                    <Space>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={handleReset}
                      >
                        Reset
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={isSubmitting}
                      >
                        Create Fellowship
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Card>

      {/* Help Card */}
      <Card style={{ marginTop: 16 }}>
        <Title level={5}>About Fellowships</Title>
        <Text>
          Fellowships are small groups of church members who meet regularly for worship,
          bible study, and community. Each fellowship has leaders including a Chairman,
          Secretary, and Treasurer.
        </Text>
        <Divider />
        <Text type="secondary">
          Note: After creating a fellowship, you can assign leadership roles from the
          fellowship details page.
        </Text>
      </Card>
    </div>
  );
};

export default FellowshipCreatePage;