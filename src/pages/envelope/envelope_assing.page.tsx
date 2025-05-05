import React from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, 
  Form, 
  Button, 
  Space, 
  Select, 
  Alert,
  Typography,
  Divider,
  Descriptions,
  Tag
} from 'antd';
import { UserOutlined, RollbackOutlined } from '@ant-design/icons';
import { EnvelopeAssignSuccessState, useEnvelopeAssign } from '@/features/envelope/envelope-assign';
import { AsyncStateMatcher } from '@/lib/state';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Page to assign an envelope to a member
 */
const EnvelopeAssignPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  
  // Use our custom hook
  const state = useEnvelopeAssign(id || '');
  
  // Handle form submission
  const handleSubmit = async (values: { memberId: string }) => {
    if (EnvelopeAssignSuccessState.is(state)) {
      await state.assign(values.memberId);
    }
  };

  return (
    <Card title={<Title level={4}>Assign Envelope to Member</Title>}>
      <AsyncStateMatcher
        state={state}
        views={{
          SuccessView: ({ state }) => {
            if (!EnvelopeAssignSuccessState.is(state)) {
              return null;
            }
            
            const { envelope, availableMembers, isAssigning } = state;
            
            // If envelope is already assigned, show warning
            if (envelope.memberId) {
              return (
                <Alert 
                  type="warning" 
                  message="This envelope is already assigned to a member" 
                  description={
                    <>
                      <p>Envelope #{envelope.envelopeNumber} is currently assigned to {
                        envelope.member ? envelope.member.getFullName() : 'a member'
                      }.</p>
                      <p>Please release this envelope before assigning it to another member.</p>
                      <Space>
                        <Button onClick={() => state.cancel()}>
                          Back to Envelope Details
                        </Button>
                      </Space>
                    </>
                  }
                  showIcon
                />
              );
            }

            return (
              <>
                <Descriptions bordered style={{ marginBottom: 24 }}>
                  <Descriptions.Item label="Envelope Number" span={3}>
                    <Text strong>{envelope.envelopeNumber}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status" span={3}>
                    <Tag color={envelope.releasedAt ? 'orange' : 'green'}>
                      {envelope.getStatus()}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Select Member</Divider>

                {availableMembers.length === 0 ? (
                  <Alert 
                    type="info" 
                    message="No available members" 
                    description="All members already have envelopes assigned." 
                    showIcon 
                  />
                ) : (
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                  >
                    <Form.Item
                      name="memberId"
                      label="Member"
                      rules={[{ required: true, message: 'Please select a member' }]}
                    >
                      <Select
                        showSearch
                        placeholder="Select a member"
                        optionFilterProp="children"
                        onChange={(value) => state.selectMember(value)}
                        style={{ width: '100%' }}
                        filterOption={(input, option) =>
                          (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                        }
                      >
                        {availableMembers.map(member => (
                          <Option key={member.id} value={member.id}>
                            {member.getFullName()} - {member.phoneNumber}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item>
                      <Space>
                        <Button 
                          type="primary" 
                          htmlType="submit"
                          icon={<UserOutlined />}
                          loading={isAssigning}
                        >
                          Assign Envelope
                        </Button>
                        <Button 
                          onClick={() => state.cancel()}
                          icon={<RollbackOutlined />}
                        >
                          Cancel
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                )}
              </>
            );
          }
        }}
      />
    </Card>
  );
};

export default EnvelopeAssignPage;