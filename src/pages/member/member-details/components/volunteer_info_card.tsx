import React from 'react';
import { Card, Tag, Empty, Typography, Flex } from 'antd';
import { HeartOutlined } from '@ant-design/icons';
import { Member } from '@/models';

const { Text, Title } = Typography;

interface VolunteerInfoCardProps {
    member: Member;
}

export const VolunteerInfoCard: React.FC<VolunteerInfoCardProps> = ({ member }) => {
    // Get the position name if the member holds one
    const getOfficialPosition = () => {
        if (!member.fellowship) return null;

        if (member.fellowship.chairmanId === member.id) {
            return 'Chairman';
        } else if (member.fellowship.deputyChairmanId === member.id) {
            return 'Deputy Chairman';
        } else if (member.fellowship.secretaryId === member.id) {
            return 'Secretary';
        } else if (member.fellowship.treasurerId === member.id) {
            return 'Treasurer';
        }

        return null;
    };

    const officialPosition = getOfficialPosition();

    return (
        <Card
            title={
                <Flex align="center" gap="small">
                    <HeartOutlined />
                    <span>Volunteer Information</span>
                </Flex>
            }
            variant='outlined'
            style={{ height: '100%' }}
        >
            {/* Official positions */}
            <div style={{ marginBottom: '20px' }}>
                <Title level={5}>Fellowship Positions</Title>

                {officialPosition ? (
                    <Flex vertical gap="small">
                        <Text>
                            {`${member.firstName} serves as the `}
                            <Tag color="blue">{officialPosition}</Tag>
                            {` of ${member.fellowship?.name || 'their fellowship'}.`}
                        </Text>
                    </Flex>
                ) : (
                    <Empty description="No official positions" />
                )}
            </div>

            {/* Volunteer interests */}
            <div>
                <Title level={5}>Volunteer Interests</Title>

                {member.interests && member.interests.length > 0 ? (
                    <Flex gap="small" wrap>
                        {member.interests.map(interest => (
                            <Tag key={interest.id} color="green">
                                {interest.name}
                            </Tag>
                        ))}
                    </Flex>
                ) : (
                    <Empty description="No volunteer interests" />
                )}
            </div>
        </Card>
    );
};