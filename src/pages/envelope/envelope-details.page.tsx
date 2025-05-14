import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Divider,
  Timeline,
  Tag,
  Modal,
  Typography
} from 'antd';
import {
  ExclamationCircleOutlined,
  UserOutlined,
  RollbackOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { EnvelopeActivityType } from '@/models';
import { AsyncStateMatcher } from '@/lib/state';
import { useAppNavigation } from '@/app';
import { EnvelopeDetailSuccessState, useEnvelopeDetail } from '@/hooks/envelope';

const { Title, Text } = Typography;

/**
 * Page to view and manage a specific envelope
 */
const EnvelopeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useAppNavigation();
  const [modal, contextHolder] = Modal.useModal();

  // Use our custom hook
  const state = useEnvelopeDetail(id || '');

  // Confirmation for releasing an envelope
  const showReleaseConfirm = () => {
    if (EnvelopeDetailSuccessState.is(state) && state.envelope.memberId) {
      console.log("in here, state is::", state)
      modal.confirm({
        title: 'Are you sure you want to release this envelope?',
        icon: <ExclamationCircleOutlined />,
        content: 'This will make the envelope available for assignment to other members.',
        onOk: async () => {
          try {
            await state.release();
          } catch (error) {
            console.error('Failed to release envelope:', error);
          }
        },
      });
    } else {
      console.log(state)
    }
  };

  return (
    <Card
      title={
        <Space>
          <Title level={4}>Envelope Details</Title>
          <Button onClick={() => navigate.Envelopes.toList()} icon={<RollbackOutlined />}>
            Back to List
          </Button>
        </Space>
      }
    >
      <AsyncStateMatcher
        state={state}
        views={{
          SuccessView: ({ state }) => {
            if (!EnvelopeDetailSuccessState.is(state)) {
              return null;
            }

            const { envelope, history, isReleasing } = state;

            return (
              <>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Envelope Number">
                    <Text strong>{envelope.envelopeNumber}</Text>
                  </Descriptions.Item>

                  <Descriptions.Item label="Status">
                    <Tag color={envelope.memberId ? 'blue' : (envelope.releasedAt ? 'orange' : 'green')}>
                      {envelope.getStatus()}
                    </Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="Assigned To">
                    {envelope.member ? (
                      <Space>
                        <Text>{envelope.member.getFullName()}</Text>
                        <Button
                          type="link"
                          size="small"
                          onClick={() => navigate.Members.toDetails(envelope.memberId ?? "")}
                        >
                          View Member
                        </Button>
                      </Space>
                    ) : (
                      <Text type="secondary">Not assigned</Text>
                    )}
                  </Descriptions.Item>

                  <Descriptions.Item label="Assigned Date">
                    {envelope.assignedAt ? (
                      envelope.assignedAt.toLocaleDateString()
                    ) : (
                      <Text type="secondary">Never assigned</Text>
                    )}
                  </Descriptions.Item>

                  <Descriptions.Item label="Last Released Date">
                    {envelope.releasedAt ? (
                      envelope.releasedAt.toLocaleDateString()
                    ) : (
                      <Text type="secondary">Never released</Text>
                    )}
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Space style={{ marginBottom: 16 }}>
                  {envelope.memberId ? (
                    <Button
                      type="primary"
                      danger
                      onClick={() => showReleaseConfirm()}
                      loading={isReleasing}
                    >
                      Release from Member
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      icon={<UserOutlined />}
                      onClick={() => state.assign()}
                    >
                      Assign to Member
                    </Button>
                  )}
                </Space>

                <Divider orientation="left">
                  <Space>
                    <HistoryOutlined />
                    <span>Assignment History</span>
                  </Space>
                </Divider>

                {history.length > 0 ? (
                  <Timeline mode="left">
                    {history.map((record) => (
                      <Timeline.Item
                        key={record.id}
                        color={record.activityType === EnvelopeActivityType.ASSIGN ? 'blue' : 'red'}
                        label={record.activityAt.toLocaleDateString()}
                      >
                        {record.getActivityDescription()}
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  <Text type="secondary">No history available</Text>
                )}
              </>
            );
          }
        }}
      />
      {contextHolder}
    </Card>
  );
};

export default EnvelopeDetailPage;