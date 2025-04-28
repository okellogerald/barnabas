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
  Divider,
  Select,
  Alert
} from 'antd';
import { 
  ArrowLeftOutlined, 
  SaveOutlined, 
  ReloadOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { AsyncStateMatcher } from '@/lib/state/async_state.matcher';
import { isSuccessState } from '@/lib/state';
import { useFellowshipEdit } from '@/features/fellowship/fellowship-edit';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/**
 * Fellowship Edit Page
 * 
 * Allows users to edit an existing fellowship's details and assign leadership roles
 */
const FellowshipEditPage: React.FC = () => {
  // Get form handling logic and data from hook
  const { 
    form,
    isSubmitting,
    fellowshipState,
    members,
    membersLoading,
    handleSubmit,
    handleCancel,
    handleReset
  } = useFellowshipEdit();

  // Render fellowship edit form only when data is loaded
  const renderEditForm = () => {
    if (!isSuccessState(fellowshipState)) return null;

    const fellowship = fellowshipState.data;
    
    return (
      <div className="fellowship-edit-page">
        <Card>
          <Row gutter={[0, 16]}>
            {/* Page Header */}
            <Col span={24}>
              <Title level={4}>Edit Fellowship: {fellowship.name}</Title>
              <Text type="secondary">
                Update fellowship details and manage leadership roles
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

                <Divider orientation="left">Leadership Roles</Divider>
                
                {members.length === 0 && !membersLoading && (
                  <Alert
                    message="No Members"
                    description="This fellowship doesn't have any members yet. Assign members to this fellowship before assigning leadership roles."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                )}

                {/* Chairman */}
                <Form.Item
                  name="chairmanId"
                  label="Chairman"
                  extra="The main leader of the fellowship"
                >
                  <Select
                    placeholder="Select a chairman"
                    allowClear
                    loading={membersLoading}
                    disabled={members.length === 0}
                    optionFilterProp="children"
                    showSearch
                  >
                    {members.map(member => (
                      <Option key={member.id} value={member.id}>
                        {member.getFullName()} ({member.phoneNumber})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Secretary */}
                <Form.Item
                  name="secretaryId"
                  label="Secretary"
                  extra="Manages fellowship records and communication"
                >
                  <Select
                    placeholder="Select a secretary"
                    allowClear
                    loading={membersLoading}
                    disabled={members.length === 0}
                    optionFilterProp="children"
                    showSearch
                  >
                    {members.map(member => (
                      <Option key={member.id} value={member.id}>
                        {member.getFullName()} ({member.phoneNumber})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Treasurer */}
                <Form.Item
                  name="treasurerId"
                  label="Treasurer"
                  extra="Manages fellowship finances"
>
                  <Select
                    placeholder="Select a treasurer"
                    allowClear
                    loading={membersLoading}
                    disabled={members.length === 0}
                    optionFilterProp="children"
                    showSearch
                  >
                    {members.map(member => (
                      <Option key={member.id} value={member.id}>
                        {member.getFullName()} ({member.phoneNumber})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Deputy Chairman */}
                <Form.Item
                  name="deputyChairmanId"
                  label="Deputy Chairman"
                  extra="Assists the chairman and acts in their absence"
                >
                  <Select
                    placeholder="Select a deputy chairman"
                    allowClear
                    loading={membersLoading}
                    disabled={members.length === 0}
                    optionFilterProp="children"
                    showSearch
                  >
                    {members.map(member => (
                      <Option key={member.id} value={member.id}>
                        {member.getFullName()} ({member.phoneNumber})
                      </Option>
                    ))}
                  </Select>
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
                          Save Changes
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
          <Space align="start">
            <TeamOutlined style={{ fontSize: 16 }} />
            <div>
              <Text strong>Leadership Assignments</Text>
              <br />
              <Text type="secondary">
                Only members who are already assigned to this fellowship can be selected for leadership roles.
                You can assign members to this fellowship from the Member Management page.
              </Text>
            </div>
          </Space>
        </Card>
      </div>
    );
  };

  // Use AsyncStateMatcher to handle loading, error states
  return (
    <AsyncStateMatcher
      state={fellowshipState}
      views={{
        SuccessView: () => renderEditForm()
      }}
    />
  );
};

export default FellowshipEditPage;