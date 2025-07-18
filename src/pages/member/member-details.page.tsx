import React from 'react';
import {
    Button,
    Breadcrumb,
    Flex,
    Space,
    Divider,
    Card,
    Badge,
    Table,
    Typography,
    Empty,
    Tag,
    Avatar,
    Timeline,
    Row,
    Col,
    Select,
    Tooltip
} from 'antd';
import {
    LeftOutlined,
    EditOutlined,
    DeleteOutlined,
    PrinterOutlined,
    UserOutlined,
    BankOutlined,
    UserSwitchOutlined,
    HeartOutlined,
    InfoCircleOutlined,
    IdcardOutlined,
    TeamOutlined,
    CalendarOutlined,
    PhoneOutlined,
    MailOutlined,
    CopyOutlined,
    FileTextOutlined,
    CheckOutlined,
    CloseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { DateView } from '@/components';
import { notifyUtils } from '@/utilities';
import { AsyncStateMatcher, isErrorState, isLoadingState } from '@/lib/state';
import { Dependant, Member } from '@/models';
import { MemberDetailsSuccessState, useMemberDetails } from '@/hooks/member/use-member-details';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Member Details Page
 * 
 * A comprehensive view of a church member's information, organized into card sections
 * using a consistent layout with bordered cards and borderless descriptions
 */
const MemberDetailsPage: React.FC = () => {
    const state = useMemberDetails();

    return (
        <div style={{ padding: '24px' }}>
            {/* Conditionally render header based on state */}
            {MemberDetailsSuccessState.is(state) && <MemberDetailsHeader state={state} />}

            {/* Main content with state handling */}
            <AsyncStateMatcher<Member>
                state={state}
                views={{
                    SuccessView: MemberContentView,
                    LoadingView,
                    ErrorView
                }}
            />
        </div>
    );
};

/**
 * Loading view component
 */
const LoadingView: React.FC<{ state: any }> = ({ state }) => {
    return (
        <div style={{ textAlign: 'center', padding: 100 }}>
            {isLoadingState(state) && state.message}
        </div>
    );
};

/**
 * Error view component
 */
const ErrorView: React.FC<{ state: any }> = ({ state }) => {
    if (!isErrorState(state)) return null;

    return (
        <div style={{ textAlign: 'center', padding: 100 }}>
            <div>{state.message}</div>
            <Button
                onClick={() => state.retry()}
                style={{ marginTop: 16 }}
            >
                Try Again
            </Button>
        </div>
    );
};

/**
 * Member Details Header Component
 * 
 * Displays breadcrumb navigation and action buttons for the member details page
 */
const MemberDetailsHeader: React.FC<{ state: MemberDetailsSuccessState }> = ({ state }) => {
    const { actions } = state;

    return (
        <Flex vertical gap="middle" style={{ width: '100%', marginBottom: 16 }}>
            <Breadcrumb
                items={[
                    { title: <a onClick={() => actions.goToList()}>Members</a> },
                    { title: 'Member Details' },
                ]}
            />

            <Flex justify="space-between" align="center">
                <Button icon={<LeftOutlined />} onClick={() => actions.goToList()}>
                    Back to Members
                </Button>

                <Space>
                    <Button icon={<PrinterOutlined />} onClick={() => actions.print()}>
                        Print
                    </Button>
                    <Button icon={<EditOutlined />} type="primary" onClick={() => actions.edit()}>
                        Edit
                    </Button>
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => actions.delete()}
                    >
                        Delete
                    </Button>
                </Space>
            </Flex>

            <Divider style={{ margin: '12px 0' }} />
        </Flex>
    );
};

/**
 * Envelope Assignment Component
 * 
 * Allows quick assignment or release of envelopes for the member
 */
const EnvelopeAssignmentCard: React.FC<{ state: MemberDetailsSuccessState }> = ({ state }) => {
    const { member, availableEnvelopes, isAssigningEnvelope, isReleasingEnvelope, selectedEnvelopeId } = state;
    const { actions } = state;

    const currentEnvelope = member.envelopeNumber;
    const hasEnvelope = !!currentEnvelope;

    return (
        <Card
            title={
                <Flex align="center" gap="small">
                    <FileTextOutlined />
                    <span>Envelope Assignment</span>
                </Flex>
            }
            variant="outlined"
        >
            <Flex vertical gap="middle">
                {/* Current envelope status */}
                <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Current Envelope</Text>
                            {hasEnvelope ? (
                                <Flex align="center" gap="small">
                                    <Tag color="green" icon={<FileTextOutlined />}>
                                        Envelope #{currentEnvelope}
                                    </Tag>
                                    <Tooltip title="Release this envelope from the member">
                                        <Button
                                            type="text"
                                            danger
                                            icon={<CloseOutlined />}
                                            size="small"
                                            loading={isReleasingEnvelope}
                                            onClick={() => actions.releaseEnvelope()}
                                        >
                                            Release
                                        </Button>
                                    </Tooltip>
                                </Flex>
                            ) : (
                                <Badge status="error" text="No envelope assigned" />
                            )}
                        </Flex>
                    </Col>

                    {/* Envelope assignment section */}
                    {!hasEnvelope && (
                        <Col xs={24} md={12}>
                            <Flex vertical gap={4}>
                                <Text type="secondary">Assign Envelope</Text>
                                <Flex gap="small" align="center">
                                    <Select
                                        style={{ width: 160 }}
                                        placeholder="Select envelope"
                                        value={selectedEnvelopeId}
                                        onChange={(value) => actions.selectEnvelope(value)}
                                        loading={!availableEnvelopes}
                                        disabled={isAssigningEnvelope}
                                    >
                                        {availableEnvelopes?.map(envelope => (
                                            <Option key={envelope.id} value={envelope.id}>
                                                Envelope #{envelope.envelopeNumber}
                                            </Option>
                                        ))}
                                    </Select>
                                    <Button
                                        type="primary"
                                        icon={<CheckOutlined />}
                                        loading={isAssigningEnvelope}
                                        disabled={!selectedEnvelopeId}
                                        onClick={() => selectedEnvelopeId && actions.assignEnvelope(selectedEnvelopeId)}
                                    >
                                        Assign
                                    </Button>
                                </Flex>
                            </Flex>
                        </Col>
                    )}
                </Row>

                {/* Help text */}
                <div style={{ marginTop: '8px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {hasEnvelope
                            ? 'This member currently has an envelope assigned. Click "Release" to make it available for others (confirmation required).'
                            : 'Assign an available envelope to this member for their church contributions.'
                        }
                    </Text>
                </div>
            </Flex>
        </Card>
    );
};

/**
 * Main Component Content View
 * 
 * Renders the complete member information using consistent styling with 
 * bordered cards containing borderless descriptions
 */
const MemberContentView: React.FC<{ state: MemberDetailsSuccessState }> = ({ state }) => {
    const { member } = state;

    return (
        <Flex vertical gap="large">
            {/* Member Profile Header */}
            <Card variant="outlined">
                <Flex align="center" gap="large">
                    <Avatar
                        size={100}
                        src={member.profilePhoto}
                        icon={!member.profilePhoto && <UserOutlined />}
                        style={{ backgroundColor: !member.profilePhoto ? '#1890ff' : undefined }}
                    />

                    <Flex vertical gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            {[member.firstName, member.middleName, member.lastName].filter(Boolean).join(' ')}
                        </Title>

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
            </Card>

            {/* Envelope Assignment Card */}
            <EnvelopeAssignmentCard state={state} />

            {/* Personal Information Card */}
            <Card
                title={
                    <Flex align="center" gap="small">
                        <UserOutlined />
                        <span>Personal Information</span>
                    </Flex>
                }
                variant="outlined"
            >
                <Row gutter={[24, 16]}>
                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Full Name</Text>
                            <Text>{[member.firstName, member.middleName, member.lastName].filter(Boolean).join(' ')}</Text>
                        </Flex>
                    </Col>

                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Gender</Text>
                            <Text>{member.gender || '-'}</Text>
                        </Flex>
                    </Col>

                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Date of Birth</Text>
                            <DateView date={member.dateOfBirth} />
                        </Flex>
                    </Col>

                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Place of Birth</Text>
                            <Text>{member.placeOfBirth || '-'}</Text>
                        </Flex>
                    </Col>

                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Phone Number</Text>
                            <Flex align="center" gap="small">
                                <PhoneOutlined style={{ color: '#8c8c8c' }} />
                                <Text copyable>{member.phoneNumber || '-'}</Text>
                            </Flex>
                        </Flex>
                    </Col>

                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Email</Text>
                            <Flex align="center" gap="small">
                                <MailOutlined style={{ color: '#8c8c8c' }} />
                                <Text copyable>{member.email || '-'}</Text>
                            </Flex>
                        </Flex>
                    </Col>

                    <Col span={24}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Residence</Text>
                            <Text>
                                {[
                                    member.residenceNumber,
                                    member.residenceBlock,
                                    member.residenceArea
                                ].filter(Boolean).join(', ') || '-'}
                            </Text>
                        </Flex>
                    </Col>

                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Postal Address</Text>
                            <Text>{member.postalBox || '-'}</Text>
                        </Flex>
                    </Col>

                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Occupation</Text>
                            <Text>{member.occupation || '-'}</Text>
                        </Flex>
                    </Col>

                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Place of Work</Text>
                            <Text>{member.placeOfWork || '-'}</Text>
                        </Flex>
                    </Col>

                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Education Level</Text>
                            <Text>{member.educationLevel || '-'}</Text>
                        </Flex>
                    </Col>

                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Profession</Text>
                            <Text>{member.profession || '-'}</Text>
                        </Flex>
                    </Col>

                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Age</Text>
                            <Text>{member.getAge?.() || '-'}</Text>
                        </Flex>
                    </Col>
                </Row>
            </Card>

            {/* Church Information Card */}
            <Card
                title={
                    <Flex align="center" gap="small">
                        <BankOutlined />
                        <span>Church Information</span>
                    </Flex>
                }
                variant="outlined"
            >
                <Row gutter={[24, 16]}>
                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Member Role</Text>
                            <Text>{member.memberRole || 'Regular'}</Text>
                        </Flex>
                    </Col>

                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Former Church</Text>
                            <Text>{member.formerChurch || '-'}</Text>
                        </Flex>
                    </Col>

                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Fellowship</Text>
                            <Text>{member.fellowship?.name || '-'}</Text>
                        </Flex>
                    </Col>

                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Attends Fellowship</Text>
                            {member.attendsFellowship ? (
                                <Badge status="success" text="Yes" />
                            ) : (
                                <Badge status="error" text="No" />
                            )}
                        </Flex>
                    </Col>

                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Is Baptized</Text>
                            {member.isBaptized ? (
                                <Badge status="success" text="Yes" />
                            ) : (
                                <Badge status="error" text="No" />
                            )}
                        </Flex>
                    </Col>

                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Is Confirmed</Text>
                            {member.isConfirmed ? (
                                <Badge status="success" text="Yes" />
                            ) : (
                                <Badge status="error" text="No" />
                            )}
                        </Flex>
                    </Col>

                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Partakes in Lord's Supper</Text>
                            {member.partakesLordSupper ? (
                                <Badge status="success" text="Yes" />
                            ) : (
                                <Badge status="error" text="No" />
                            )}
                        </Flex>
                    </Col>

                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Nearest Member Name</Text>
                            <Text>{member.nearestMemberName || '-'}</Text>
                        </Flex>
                    </Col>

                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Nearest Member Phone</Text>
                            <Text>{member.nearestMemberPhone || '-'}</Text>
                        </Flex>
                    </Col>

                    {!member.attendsFellowship && member.fellowshipAbsenceReason && (
                        <Col span={24}>
                            <Flex vertical gap={4}>
                                <Text type="secondary">Reason for Not Attending</Text>
                                <Text>{member.fellowshipAbsenceReason}</Text>
                            </Flex>
                        </Col>
                    )}

                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Member Since</Text>
                            <Flex align="center" gap={6}>
                                <CalendarOutlined style={{ color: '#8c8c8c' }} />
                                <DateView date={member.createdAt} />
                            </Flex>
                        </Flex>
                    </Col>
                </Row>
            </Card>

            {/* Family Information Card */}
            <Card
                title={
                    <Flex align="center" gap="small">
                        <UserSwitchOutlined />
                        <span>Family Information</span>
                    </Flex>
                }
                variant="outlined"
            >
                <Row gutter={[24, 16]}>
                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Marital Status</Text>
                            <Text>{member.maritalStatus || '-'}</Text>
                        </Flex>
                    </Col>

                    {/* Only show marriage details if the member is married */}
                    {member.maritalStatus === 'Married' && (
                        <>
                            <Col xs={24} md={8}>
                                <Flex vertical gap={4}>
                                    <Text type="secondary">Marriage Type</Text>
                                    <Text>{member.marriageType || '-'}</Text>
                                </Flex>
                            </Col>

                            <Col xs={24} md={8}>
                                <Flex vertical gap={4}>
                                    <Text type="secondary">Date of Marriage</Text>
                                    <DateView date={member.dateOfMarriage} />
                                </Flex>
                            </Col>

                            <Col xs={24} md={8}>
                                <Flex vertical gap={4}>
                                    <Text type="secondary">Place of Marriage</Text>
                                    <Text>{member.placeOfMarriage || '-'}</Text>
                                </Flex>
                            </Col>

                            <Col xs={24} md={8}>
                                <Flex vertical gap={4}>
                                    <Text type="secondary">Spouse Name</Text>
                                    <Text>{member.spouseName || '-'}</Text>
                                </Flex>
                            </Col>

                            <Col xs={24} md={8}>
                                <Flex vertical gap={4}>
                                    <Text type="secondary">Spouse Phone Number</Text>
                                    <Text>{member.spousePhoneNumber || '-'}</Text>
                                </Flex>
                            </Col>
                        </>
                    )}
                </Row>

                {/* Dependants section */}
                <div style={{ marginTop: '24px' }}>
                    <Text strong>Dependants</Text>

                    {member.dependants && member.dependants.length > 0 ? (
                        <Table
                            dataSource={member.dependants}
                            columns={[
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
                                    render: (date: string) => date ? dayjs(date).format('MMM D, YYYY') : '-',
                                },
                                {
                                    title: 'Age',
                                    key: 'age',
                                    render: (_: any, record: Dependant) => (
                                        record.dateOfBirth ? dayjs().diff(dayjs(record.dateOfBirth), 'year') : '-'
                                    ),
                                },
                            ]}
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

            {/* Volunteer Information Card */}
            <Card
                title={
                    <Flex align="center" gap="small">
                        <HeartOutlined />
                        <span>Volunteer Information</span>
                    </Flex>
                }
                variant="outlined"
            >
                <Space direction='vertical'>
                    {/* Official positions */}
                    <Space direction='vertical' style={{ marginBottom: '24px' }}>
                        <Text strong>Fellowship Positions</Text>

                        {(() => {
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

                            return officialPosition ? (
                                <Flex vertical gap="small">
                                    <Text>
                                        {`${member.firstName} serves as the `}
                                        <Tag color="blue">{officialPosition}</Tag>
                                        {` of ${member.fellowship?.name || 'their fellowship'}.`}
                                    </Text>
                                </Flex>
                            ) : (
                                <Empty description="No official positions" />
                            );
                        })()}
                    </Space>

                    {/* Volunteer interests */}
                    <Space direction='vertical'>
                        <Text strong>Volunteer Interests</Text>

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
                    </Space>
                </Space>
            </Card>

            {/* Additional Information Card */}
            <Card
                title={
                    <Flex align="center" gap="small">
                        <InfoCircleOutlined />
                        <span>Additional Information</span>
                    </Flex>
                }
                variant="outlined"
            >
                <Row gutter={[24, 16]}>
                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Member ID</Text>
                            <Flex align="center" gap="small">
                                <Text style={{ fontFamily: 'monospace' }}>
                                    {member.id.substring(0, 3)}...{member.id.substring(member.id.length - 3)}
                                </Text>
                                <Button
                                    type="text"
                                    icon={<CopyOutlined />}
                                    onClick={() => {
                                        navigator.clipboard.writeText(member.id);
                                        notifyUtils.success('Member ID copied to clipboard');
                                    }}
                                    size="small"
                                    title="Copy full ID"
                                />
                            </Flex>
                        </Flex>
                    </Col>

                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Church ID</Text>
                            <Flex align="center" gap="small">
                                <Text style={{ fontFamily: 'monospace' }}>
                                    {member.churchId.substring(0, 3)}...{member.churchId.substring(member.churchId.length - 3)}
                                </Text>
                                <Button
                                    type="text"
                                    icon={<CopyOutlined />}
                                    onClick={() => {
                                        navigator.clipboard.writeText(member.churchId);
                                        notifyUtils.success('Church ID copied to clipboard');
                                    }}
                                    size="small"
                                    title="Copy full ID"
                                />
                            </Flex>
                        </Flex>
                    </Col>

                    <Col xs={24} md={8}>

                    </Col>

                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Created At</Text>
                            <Flex align="center" gap={6}>
                                <CalendarOutlined style={{ color: '#8c8c8c' }} />
                                <DateView date={member.createdAt} />
                            </Flex>
                        </Flex>
                    </Col>

                    <Col xs={24} md={8}>
                        <Flex vertical gap={4}>
                            <Text type="secondary">Last Updated</Text>
                            <Flex align="center" gap={6}>
                                <CalendarOutlined style={{ color: '#8c8c8c' }} />
                                <DateView date={member.updatedAt} />
                            </Flex>
                        </Flex>
                    </Col>
                </Row>

                {/* Timeline of significant events */}
                <Space direction='vertical' style={{ marginTop: '24px', width: '100%' }}>
                    <Text strong>Member Timeline</Text>

                    <div>
                        <Timeline
                            mode="left"
                            style={{ marginTop: 16 }}
                            items={(() => {
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
                                return events
                                    .sort((a, b) => dayjs(a.date).isBefore(dayjs(b.date)) ? -1 : 1)
                                    .map(event => ({
                                        label: <DateView date={event.date} />,
                                        children: (
                                            <div>
                                                <Text strong>{event.title}</Text>
                                                <div style={{ color: 'rgba(0, 0, 0, 0.65)' }}>{event.description}</div>
                                            </div>
                                        )
                                    }));
                            })()}
                        />
                    </div>
                </Space>
            </Card>
        </Flex>
    );
};

export default MemberDetailsPage;