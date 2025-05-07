import React from 'react';
import { Card, Row, Col, Statistic, Typography, Spin, Space, List, Descriptions, Button } from 'antd';
import {
    UserOutlined,
    TeamOutlined,
    HomeOutlined,
    RightOutlined,
    BankOutlined,
    MailOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { AuthManager } from '@/features/auth/auth.manager';
import { Actions } from '@/features/auth/permission';
import { useDashboard } from '@/interactors/dashboard/hook';
import { createUIStateMatcher, IErrorState } from '@/interactors/_state';
import { DashboardPageSuccessState } from '@/interactors/dashboard/types';
import { CSSProperties } from 'react';

const { Title, Text, Paragraph } = Typography;

/**
 * Main Dashboard page component that displays summary statistics
 * and quick links based on user permissions
 */
const DashboardPage: React.FC = () => {
    const state = useDashboard();

    return createUIStateMatcher(state, {
        LoadingView,
        SuccessView,
        ErrorView,
    });
};

// ============================
// Success View Section
// ============================

/**
 * Dashboard success state view
 */
const SuccessView: React.FC<{ state: DashboardPageSuccessState }> = ({ state }) => {
    const { church, totalFellowships, totalMembers } = state;
    const user = AuthManager.instance.useCurrentUser();
    const authManager = AuthManager.instance;

    /**
     * Helper function to get time-based greeting
     */
    const getTimeBasedGreeting = (): string => {
        const currentHour = new Date().getHours();

        if (currentHour < 12) {
            return 'Good morning';
        } else if (currentHour < 17) {
            return 'Good afternoon';
        } else {
            return 'Good evening';
        }
    };

    // Generate quick links based on user permissions
    const quickLinks = [
        {
            title: 'Add New Member',
            icon: <UserOutlined />,
            path: '/members/create',
            permissionRequired: Actions.MEMBER_CREATE
        },
        {
            title: 'Create Fellowship',
            icon: <HomeOutlined />,
            path: '/fellowships/create',
            permissionRequired: Actions.FELLOWSHIP_CREATE
        },
        {
            title: 'View All Members',
            icon: <TeamOutlined />,
            path: '/members',
            permissionRequired: Actions.MEMBER_FIND_ALL
        },
        {
            title: 'View All Fellowships',
            icon: <TeamOutlined />,
            path: '/fellowships',
            permissionRequired: Actions.FELLOWSHIP_FIND_ALL
        }
    ].filter(link => authManager.hasPermission(link.permissionRequired));

    // Get appropriate greeting based on time of day
    const greeting = getTimeBasedGreeting();

    return (
        <Space direction="vertical" size="large" style={styles.container}>
            {/* Header with greeting */}
            <div>
                <Title level={2}>Dashboard</Title>
                <Paragraph>
                    {greeting}, {user?.name || 'User'}
                </Paragraph>
            </div>

            {/* Church Details Card */}
            <ChurchInfoCard church={church} />

            {/* Statistics Section */}
            <StatisticsSection
                totalMembers={totalMembers}
                totalFellowships={totalFellowships}
            />

            {/* Quick Links Section */}
            <QuickLinksSection quickLinks={quickLinks} />
        </Space>
    );
};

// ============================
// Church Information Section
// ============================

/**
 * Church information card component
 */
const ChurchInfoCard: React.FC<{ church: any }> = ({ church }) => {
    /**
     * Generate description items for the church information
     */
    const getDescriptionItems = (church: any) => [
        {
            key: 'name',
            label: 'Name',
            children: <Text strong>{church.name}</Text>
        },
        {
            key: 'registration',
            label: 'Registration',
            children: church.registrationNumber
        },
        {
            key: 'domain',
            label: 'Domain',
            children: church.domainName
        },
        {
            key: 'contact',
            label: 'Contact',
            children: (
                <Space direction="vertical" size="small">
                    <Space>
                        <PhoneOutlined />
                        <Text>{church.contactPhone}</Text>
                    </Space>
                    <Space>
                        <MailOutlined />
                        <Text>{church.contactEmail}</Text>
                    </Space>
                </Space>
            )
        }
    ];

    const descriptionItems = getDescriptionItems(church);

    return (
        <Card
            title={
                <Space>
                    <BankOutlined />
                    <span>Church Information</span>
                </Space>
            }
            style={styles.card}
        >
            <Descriptions
                layout="vertical"
                column={{ xs: 1, sm: 2, md: 3, lg: 4 }}
                items={descriptionItems}
            />
        </Card>
    );
};

// ============================
// Statistics Section
// ============================

/**
 * Statistics section component
 */
const StatisticsSection: React.FC<{
    totalMembers: number | null;
    totalFellowships: number | null;
}> = ({ totalMembers, totalFellowships }) => {
    /**
     * Check if user has permission to view specific statistics
     */
    const canViewMemberStats = totalMembers !== null;
    const canViewFellowshipStats = totalFellowships !== null;

    /**
     * Render fallback when no statistics are available
     */
    const renderNoPermissionMessage = () => (
        <Col xs={24}>
            <Card style={styles.card}>
                <Text type="secondary">
                    You do not have permission to view church statistics.
                </Text>
            </Card>
        </Col>
    );

    if (!canViewMemberStats && !canViewFellowshipStats) {
        return renderNoPermissionMessage();
    }

    return (
        <Row gutter={[16, 16]}>
            {canViewMemberStats && (
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable>
                        <Statistic
                            title="Total Members"
                            value={totalMembers}
                            prefix={<UserOutlined />}
                            valueStyle={styles.statisticValue}
                        />
                    </Card>
                </Col>
            )}

            {canViewFellowshipStats && (
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable>
                        <Statistic
                            title="Total Fellowships"
                            value={totalFellowships}
                            prefix={<HomeOutlined />}
                            valueStyle={styles.fellowshipStatValue}
                        />
                    </Card>
                </Col>
            )}
        </Row>
    );
};

// ============================
// Quick Links Section
// ============================

/**
 * Interface for quick links shown on dashboard
 */
interface QuickLink {
    title: string;
    icon: React.ReactNode;
    path: string;
    permissionRequired: string;
}

/**
 * Quick links section component
 */
const QuickLinksSection: React.FC<{ quickLinks: QuickLink[] }> = ({ quickLinks }) => {
    /**
     * Check if there are any quick links to display
     */
    if (quickLinks.length === 0) {
        return null;
    }

    /**
     * Render a single quick link item
     */
    const renderQuickLinkItem = (item: QuickLink) => (
        <List.Item>
            <Link to={item.path}>
                <Card
                    hoverable
                    size="small"
                >
                    <Space>
                        {item.icon}
                        <Text>{item.title}</Text>
                        <RightOutlined style={styles.arrowIcon} />
                    </Space>
                </Card>
            </Link>
        </List.Item>
    );

    return (
        <Card
            title={
                <Space>
                    <RightOutlined />
                    <span>Quick Links</span>
                </Space>
            }
        >
            <List
                grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 2,
                    md: 2,
                    lg: 4
                }}
                dataSource={quickLinks}
                renderItem={renderQuickLinkItem}
            />
        </Card>
    );
};

// ============================
// Loading and Error Views
// ============================

/**
 * Loading view component for dashboard
 */
const LoadingView: React.FC = () => (
    <div style={styles.loadingContainer}>
        <Spin size="large" />
    </div>
);

/**
 * Error view component for dashboard
 */
const ErrorView: React.FC<{ state: IErrorState }> = ({ state }) => {
    const { message, actions } = state;

    return (
        <div style={styles.errorContainer}>
            <Space direction="vertical" align="center">
                <Typography.Text type="danger">{message}</Typography.Text>
                <Button type="primary" onClick={actions.retry}>Retry</Button>
            </Space>
        </div>
    );
};

// ============================
// Styles
// ============================

type StylesType = {
    container: CSSProperties;
    loadingContainer: CSSProperties;
    errorContainer: CSSProperties;
    card: CSSProperties;
    statisticValue: CSSProperties;
    fellowshipStatValue: CSSProperties;
    arrowIcon: CSSProperties;
};

const styles: StylesType = {
    container: {
        width: '100%'
    },
    loadingContainer: {
        textAlign: 'center',
        padding: '40px 0'
    },
    errorContainer: {
        textAlign: 'center',
        padding: '40px 0'
    },
    card: {
        marginBottom: 16
    },
    statisticValue: {
        color: '#1890ff'
    },
    fellowshipStatValue: {
        color: '#52c41a'
    },
    arrowIcon: {
        fontSize: '12px',
        color: '#1890ff'
    }
};

export default DashboardPage;