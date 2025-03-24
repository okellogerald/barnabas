import React from 'react';
import { Avatar, Flex, Space, Typography, Tag } from 'antd';
import { UserOutlined, IdcardOutlined, TeamOutlined } from '@ant-design/icons';
import { Member } from '@/models';

const { Title, Text } = Typography;

interface MemberHeaderProps {
    member: Member;
}

export const MemberHeader: React.FC<MemberHeaderProps> = ({ member }) => {
    // Get member's full name
    const fullName = [member.firstName, member.middleName, member.lastName]
        .filter(Boolean)
        .join(' ');

    return (
        <Flex align="center" gap="large">
            {/* Profile photo or default avatar */}
            <Avatar
                size={100}
                src={member.profilePhoto}
                icon={!member.profilePhoto && <UserOutlined />}
                style={{ backgroundColor: !member.profilePhoto ? '#1890ff' : undefined }}
            />

            {/* Member info */}
            <Flex vertical gap="small">
                <Title level={3} style={{ margin: 0 }}>{fullName}</Title>

                <Space size="middle">
                    {member.envelopeNumber && (
                        <Flex align="center" gap="small">
                            <IdcardOutlined />
                            <Text>Envelope: {member.envelopeNumber}</Text>
                        </Flex>
                    )}

                    {member.fellowshipId && member.fellowship && (
                        <Flex align="center" gap="small">
                            <TeamOutlined />
                            <Text>Fellowship: {member.fellowship.name}</Text>
                        </Flex>
                    )}
                </Space>

                <Space size="small" wrap>
                    {member.memberRole && (
                        <Tag color="blue">{member.memberRole}</Tag>
                    )}

                    {member.isBaptized && (
                        <Tag color="green">Baptized</Tag>
                    )}

                    {member.isConfirmed && (
                        <Tag color="green">Confirmed</Tag>
                    )}

                    {member.attendsFellowship ? (
                        <Tag color="green">Attends Fellowship</Tag>
                    ) : (
                        <Tag color="red">Doesn't Attend Fellowship</Tag>
                    )}
                </Space>
            </Flex>
        </Flex>
    );
};