import React from 'react';
import { Card, Descriptions, Timeline, Typography, Flex } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Member } from '@/models';
import { DateView } from '@/components';

const { Text } = Typography;

interface AdditionalInfoCardProps {
    member: Member;
}

export const AdditionalInfoCard: React.FC<AdditionalInfoCardProps> = ({ member }) => {
    // Generate a timeline of important events related to the member
    const generateTimeline = () => {
        const events = [];

        // Add membership creation date
        events.push({
            key: 'created',
            date: member.createdAt,
            title: 'Became a Member',
            description: `${[member.firstName, member.lastName].filter(Boolean).join(' ')} joined the church.`,
        });

        // Add any other events that might be relevant
        if (member.dateOfMarriage) {
            events.push({
                key: 'marriage',
                date: member.dateOfMarriage,
                title: 'Marriage',
                description: `Married to ${member.spouseName || 'spouse'} at ${member.placeOfMarriage || 'unknown location'}.`,
            });
        }

        // Sort events by date (oldest first)
        return events.sort((a, b) => dayjs(a.date).isBefore(dayjs(b.date)) ? -1 : 1);
    };

    const timelineEvents = generateTimeline();

    return (
        <Card
            title={
                <Flex align="center" gap="small">
                    <InfoCircleOutlined />
                    <span>Additional Information</span>
                </Flex>
            }
            bordered={false}
        >
            <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Member ID">
                    {member.id}
                </Descriptions.Item>

                <Descriptions.Item label="Church ID">
                    {member.churchId}
                </Descriptions.Item>

                <Descriptions.Item label="Created At">
                    <DateView date={member.createdAt} />
                </Descriptions.Item>

                <Descriptions.Item label="Last Updated">
                    <DateView date={member.updatedAt} />
                </Descriptions.Item>
            </Descriptions>

            {/* Timeline of significant events */}
            <div style={{ marginTop: '20px' }}>
                <Typography.Title level={5}>Member Timeline</Typography.Title>

                <Timeline
                    mode="left"
                    items={timelineEvents.map(event => ({
                        label: <DateView date={event.date} />,
                        children: (
                            <div>
                                <Text strong>{event.title}</Text>
                                <div>{event.description}</div>
                            </div>
                        )
                    }))}
                />
            </div>
        </Card>
    );
};