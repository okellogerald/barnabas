import React from 'react';
import { Card, Descriptions, Badge, Flex } from 'antd';
import {
    BankOutlined,
} from '@ant-design/icons';
import { Member } from '@/models';
import { DateView } from '@/components';

interface ChurchInfoCardProps {
    member: Member;
}

export const ChurchInfoCard: React.FC<ChurchInfoCardProps> = ({ member }) => {
    // Helper function to render badge for boolean values (stored as 0/1)
    const renderBadge = (value: boolean) => {
        return value
            ? <Badge status="success" text="Yes" />
            : <Badge status="error" text="No" />;
    };

    return (
        <Card
            title={
                <Flex align="center" gap="small">
                    <BankOutlined />
                    <span>Church Information</span>
                </Flex>
            }
            variant='outlined'
            style={{ height: '100%' }}
        >
            <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Member Role">
                    {member.memberRole || 'Regular'}
                </Descriptions.Item>

                <Descriptions.Item label="Former Church">
                    {member.formerChurch || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Fellowship">
                    {member.fellowship?.name || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Attends Fellowship">
                    {renderBadge(member.attendsFellowship)}
                </Descriptions.Item>

                {!member.attendsFellowship && member.fellowshipAbsenceReason && (
                    <Descriptions.Item label="Reason for Not Attending">
                        {member.fellowshipAbsenceReason}
                    </Descriptions.Item>
                )}

                <Descriptions.Item label="Is Baptized">
                    {renderBadge(member.isBaptized)}
                </Descriptions.Item>

                <Descriptions.Item label="Is Confirmed">
                    {renderBadge(member.isConfirmed)}
                </Descriptions.Item>

                <Descriptions.Item label="Partakes in Lord's Supper">
                    {renderBadge(member.partakesLordSupper)}
                </Descriptions.Item>

                <Descriptions.Item label="Nearest Member Name">
                    {member.nearestMemberName || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Nearest Member Phone">
                    {member.nearestMemberPhone || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Member Since">
                    <DateView date={member.createdAt} />
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
};