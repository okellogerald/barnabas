import React from 'react';
import { Card, Descriptions, Table, Typography, Empty, Flex } from 'antd';
import { UserSwitchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Dependant, Member } from '@/models';
import { DateView } from '@/components';

interface FamilyInfoCardProps {
    member: Member;
}

export const FamilyInfoCard: React.FC<FamilyInfoCardProps> = ({ member }) => {
    // Format date for display
    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return dayjs(dateString).format('MMM D, YYYY');
    };

    // Calculate age from date of birth
    const calculateAge = (dateOfBirth?: Date | null) => {
        if (!dateOfBirth) return '-';
        return dayjs().diff(dayjs(dateOfBirth), 'year');
    };

    // Columns for dependants table
    const dependantColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (_: any, record: Dependant) => `${record.firstName} ${record.lastName}`,
        },
        {
            title: 'Relationship',
            dataIndex: 'relationship',
            key: 'relationship',
        },
        {
            title: 'Date of Birth',
            dataIndex: 'dateOfBirth',
            key: 'dateOfBirth',
            render: (date: string) => formatDate(date),
        },
        {
            title: 'Age',
            key: 'age',
            render: (_: any, record: Dependant) => calculateAge(record.dateOfBirth),
        },
    ];

    return (
        <Card
            title={
                <Flex align="center" gap="small">
                    <UserSwitchOutlined />
                    <span>Family Information</span>
                </Flex>
            }
            variant='outlined'
            style={{ height: '100%' }}
        >
            <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Marital Status">
                    {member.maritalStatus || '-'}
                </Descriptions.Item>

                {/* Only show marriage details if the member is married */}
                {member.maritalStatus === 'Married' && (
                    <>
                        <Descriptions.Item label="Marriage Type">
                            {member.marriageType || '-'}
                        </Descriptions.Item>

                        <Descriptions.Item label="Date of Marriage">
                            <DateView date={member.dateOfMarriage} />
                        </Descriptions.Item>

                        <Descriptions.Item label="Place of Marriage">
                            {member.placeOfMarriage || '-'}
                        </Descriptions.Item>

                        <Descriptions.Item label="Spouse Name">
                            {member.spouseName || '-'}
                        </Descriptions.Item>

                        <Descriptions.Item label="Spouse Phone Number">
                            {member.spousePhoneNumber || '-'}
                        </Descriptions.Item>
                    </>
                )}
            </Descriptions>

            {/* Dependants section */}
            <div style={{ marginTop: '20px' }}>
                <Typography.Title level={5}>Dependants</Typography.Title>

                {member.dependants && member.dependants.length > 0 ? (
                    <Table
                        dataSource={member.dependants}
                        columns={dependantColumns}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        bordered
                    />
                ) : (
                    <Empty description="No dependants" />
                )}
            </div>
        </Card>
    );
};