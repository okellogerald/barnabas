import React from 'react';
import { Card, Descriptions, Flex } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Member } from '@/models';
import { DateView } from '@/components';

interface PersonalInfoCardProps {
    member: Member;
}

export const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({ member }) => {
    return (
        <Card
            title={
                <Flex align="center" gap="small">
                    <UserOutlined />
                    <span>Personal Information</span>
                </Flex>
            }
            variant={"outlined"}
            style={{ height: '100%' }}
        >
            <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Full Name">
                    {[member.firstName, member.middleName, member.lastName].filter(Boolean).join(' ')}
                </Descriptions.Item>

                <Descriptions.Item label="Gender">
                    {member.gender || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Date of Birth">
                    <DateView date={member.dateOfBirth} />
                </Descriptions.Item>

                <Descriptions.Item label="Place of Birth">
                    {member.placeOfBirth || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Phone Number">
                    {member.phoneNumber || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Email">
                    {member.email || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Residence">
                    {[
                        member.residenceNumber,
                        member.residenceBlock,
                        member.residenceArea
                    ].filter(Boolean).join(', ') || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Postal Address">
                    {member.postalBox || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Occupation">
                    {member.occupation || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Place of Work">
                    {member.placeOfWork || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Education Level">
                    {member.educationLevel || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Profession">
                    {member.profession || '-'}
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
};