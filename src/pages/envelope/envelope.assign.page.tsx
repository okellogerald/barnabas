import React from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Space, 
  Alert,
  Typography,
  Divider,
  Descriptions,
  Tag,
  Empty
} from 'antd';
import { UserOutlined, RollbackOutlined } from '@ant-design/icons';
import { AsyncStateMatcher } from '@/lib/state';
import { EnvelopeAssignSuccessState, useEnvelopeAssign } from '@/features/member';
import { MemberSelector } from '@/components/member/member_selector';

const { Title, Text } = Typography;

/**
 * Page to assign an envelope to a member
 */
const EnvelopeAssignPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Use our custom hook
  const state = useEnvelopeAssign(id || '');

  return (
    <Card title={<Title level={4}>Assign Envelope to Member</Title>}>
      <AsyncStateMatcher
        state={state}
        views={{
          SuccessView: ({ state }) => {
            if (!EnvelopeAssignSuccessState.is(state)) {
              return null;
            }
            
            const { envelope, selectedMember, isAssigning, memberSelectorVisible } = state;
            
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

                {selectedMember ? (
                  <div style={{ marginBottom: 24 }}>
                    <Descriptions bordered column={1}>
                      <Descriptions.Item label="Selected Member">
                        <Space>
                          <UserOutlined />
                          <Text strong>{selectedMember.getFullName()}</Text>
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Phone Number">
                        {selectedMember.phoneNumber || <Text type="secondary">Not provided</Text>}
                      </Descriptions.Item>
                      <Descriptions.Item label="Fellowship">
                        {selectedMember.fellowship?.name || <Text type="secondary">None</Text>}
                      </Descriptions.Item>
                    </Descriptions>
                    
                    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                      <Button 
                        onClick={() => state.showMemberSelector()}
                      >
                        Change Member
                      </Button>
                      
                      <Button 
                        type="primary" 
                        icon={<UserOutlined />}
                        loading={isAssigning}
                        onClick={() => state.assign()}
                      >
                        Assign Envelope to Member
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px 0' }}>
                    <Empty 
                      description="No member selected"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                    <Button 
                      type="primary" 
                      icon={<UserOutlined />}
                      onClick={() => state.showMemberSelector()}
                      style={{ marginTop: 16 }}
                    >
                      Select Member
                    </Button>
                  </div>
                )}
                
                <Divider />
                
                <div style={{ textAlign: 'right' }}>
                  <Button 
                    onClick={() => state.cancel()}
                    icon={<RollbackOutlined />}
                  >
                    Cancel
                  </Button>
                </div>
                
                {/* Member selector modal */}
                <MemberSelector
                  visible={memberSelectorVisible}
                  onCancel={() => state.hideMemberSelector()}
                  onSelect={(member) => state.selectMember(member)}
                  filter={{ hasEnvelope: false }} // Only show members without envelopes
                />
              </>
            );
          }
        }}
      />
    </Card>
  );
};

export default EnvelopeAssignPage;