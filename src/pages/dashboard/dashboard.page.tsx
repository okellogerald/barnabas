import React from 'react';
import {
    Card,
    Row,
    Col,
    Typography,
    Spin,
    Space,
    List,
    Button,
} from 'antd';
import {
    UserOutlined,
    TeamOutlined,
    HomeOutlined,
    RightOutlined,
    ManOutlined,
    WomanOutlined,
    UserAddOutlined,
    MailOutlined,
    ReloadOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { AuthenticationManager } from '@/data/authentication/authentication.manager';
import { useDashboard } from '@/interactors/dashboard/hook';
import { createUIStateMatcher, IErrorState } from '@/interactors/_state';
import { DashboardPageSuccessState } from '@/interactors/dashboard/types';
import { Actions } from '@/data/authorization';
import { useDashboardStats } from '@/hooks/dashboard/use-dashboard-stats';

const { Title, Text } = Typography;

// Quick link interface
interface QuickLink {
    title: string;
    icon: React.ReactNode;
    path: string;
    permissionRequired: string;
    color: string;
    description: string;
}

/**
 * Main Dashboard page component
 */
const DashboardPage: React.FC = () => {
    const state = useDashboard();

    return createUIStateMatcher(state, {
        LoadingView,
        SuccessView,
        ErrorView,
    });
};

/**
 * Dashboard success state view
 */
const SuccessView: React.FC<{ state: DashboardPageSuccessState }> = () => {
    const statsQuery = useDashboardStats();
    const authManager = AuthenticationManager.instance;

    // Generate quick links based on user permissions
    const quickLinks: QuickLink[] = [
        {
            title: 'Add New Member',
            icon: <UserOutlined />,
            path: '/members/create',
            permissionRequired: Actions.MEMBER_CREATE,
            color: '#1890ff',
            description: 'Register a new church member'
        },
        {
            title: 'Create Fellowship',
            icon: <HomeOutlined />,
            path: '/fellowships/create',
            permissionRequired: Actions.FELLOWSHIP_CREATE,
            color: '#52c41a',
            description: 'Start a new fellowship group'
        },
        {
            title: 'View All Members',
            icon: <TeamOutlined />,
            path: '/members',
            permissionRequired: Actions.MEMBER_FIND_ALL,
            color: '#722ed1',
            description: 'Browse church directory'
        },
        {
            title: 'View All Fellowships',
            icon: <TeamOutlined />,
            path: '/fellowships',
            permissionRequired: Actions.FELLOWSHIP_FIND_ALL,
            color: '#fa8c16',
            description: 'Manage fellowship groups'
        }
    ].filter(link => authManager.hasPermission(link.permissionRequired));

    return (
        <div style={styles.pageContainer}>
            <div style={styles.container}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {/* Page Title */}
                    <div>
                        <Title level={2} style={{ margin: 0 }}>
                            Dashboard
                        </Title>
                        <Text type="secondary">Church management overview</Text>
                    </div>

                    {/* Statistics Section */}
                    <StatisticsSection statsQuery={statsQuery} />

                    {/* Quick Actions Section */}
                    <QuickActionsSection quickLinks={quickLinks} />
                </Space>
            </div>
        </div>
    );
};

/**
 * Statistics section component
 */
const StatisticsSection: React.FC<{ statsQuery: any }> = ({ statsQuery }) => {
    const { data: stats, isLoading, error, refetch } = statsQuery;

    if (isLoading) {
        return (
            <Card style={styles.card}>
                <div style={styles.loadingStats}>
                    <Spin size="large" />
                    <Text style={{ marginTop: 16 }}>Loading statistics...</Text>
                </div>
            </Card>
        );
    }

    if (error || !stats) {
        return (
            <Card style={styles.card}>
                <div style={styles.errorStats}>
                    <Text type="danger">Failed to load statistics</Text>
                    <Button onClick={() => refetch()} style={{ marginTop: 8 }}>
                        Retry
                    </Button>
                </div>
            </Card>
        );
    }

    const statisticsConfig = [
        {
            title: "Total Members",
            value: stats.totalActiveMembers,
            icon: <UserOutlined />,
            color: "#1890ff",
        },
        {
            title: "Male Members",
            value: stats.totalMaleMembers,
            icon: <ManOutlined />,
            color: "#52c41a",
        },
        {
            title: "Female Members",
            value: stats.totalFemaleMembers,
            icon: <WomanOutlined />,
            color: "#eb2f96",
        },
        {
            title: "New Members (Last 6 months)",
            value: stats.totalActiveMembersLast6Months,
            icon: <UserAddOutlined />,
            color: "#faad14",
        },
        {
            title: "Active Fellowships",
            value: stats.totalActiveFellowships,
            icon: <TeamOutlined />,
            color: "#722ed1",
        },
        {
            title: "Available Envelopes",
            value: stats.availableEnvelopes,
            icon: <MailOutlined />,
            color: "#13c2c2",
        },
    ];

    return (
        <Card
            title={
                <Space>
                    <TrophyOutlined style={{ color: '#faad14' }} />
                    <span>Church Statistics</span>
                </Space>
            }
            extra={
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => refetch()}
                    loading={isLoading}
                    type="text"
                    size="small"
                >
                    Refresh
                </Button>
            }
            style={styles.card}
        >
            <Row gutter={[24, 24]}>
                {statisticsConfig.map((stat, index) => (
                    <Col xs={24} sm={12} md={8} lg={6} xl={4} key={index}>
                        <SimpleStatCard stat={stat} />
                    </Col>
                ))}
            </Row>
        </Card>
    );
};

/**
 * Simple stat card component (unified design)
 */
const SimpleStatCard: React.FC<{ stat: any }> = ({ stat }) => {
    return (
        <div style={styles.simpleStatCard}>
            <div style={styles.simpleStatTop}>
                <div style={{
                    ...styles.simpleStatIcon,
                    backgroundColor: `${stat.color}15`,
                    border: `2px solid ${stat.color}30`
                }}>
                    <span style={{ color: stat.color, fontSize: '20px' }}>
                        {stat.icon}
                    </span>
                </div>
                <div style={styles.simpleStatValue}>
                    {stat.value.toLocaleString()}
                </div>
            </div>
            <div style={styles.simpleStatTitle}>
                {stat.title}
            </div>
        </div>
    );
};

/**
 * Quick actions section component
 */
const QuickActionsSection: React.FC<{ quickLinks: QuickLink[] }> = ({ quickLinks }) => {
    if (quickLinks.length === 0) {
        return null;
    }

    const renderQuickLinkItem = (item: QuickLink) => (
        <List.Item>
            <Link to={item.path} style={{ textDecoration: 'none', width: '100%' }}>
                <div style={styles.quickLinkCard}>
                    <div style={styles.quickLinkContent}>
                        <div style={{
                            ...styles.quickLinkIcon,
                            backgroundColor: `${item.color}15`,
                            borderColor: `${item.color}30`
                        }}>
                            <span style={{ color: item.color, fontSize: '24px' }}>
                                {item.icon}
                            </span>
                        </div>
                        <div style={styles.quickLinkText}>
                            <div style={styles.quickLinkTitle}>
                                {item.title}
                            </div>
                            <div style={styles.quickLinkDescription}>
                                {item.description}
                            </div>
                        </div>
                        <div style={styles.quickLinkArrow}>
                            <RightOutlined style={{ color: item.color, fontSize: '16px' }} />
                        </div>
                    </div>
                </div>
            </Link>
        </List.Item>
    );

    return (
        <Card
            title={
                <Space>
                    <RightOutlined style={{ color: '#52c41a' }} />
                    <span>Quick Actions</span>
                </Space>
            }
            style={styles.card}
        >
            <List
                grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 1,
                    md: 2,
                    lg: 2,
                    xl: 2
                }}
                dataSource={quickLinks}
                renderItem={renderQuickLinkItem}
            />
        </Card>
    );
};

/**
 * Loading view component
 */
const LoadingView: React.FC = () => (
    <div style={styles.loadingContainer}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
            <Text>Loading dashboard...</Text>
        </div>
    </div>
);

/**
 * Error view component
 */
const ErrorView: React.FC<{ state: IErrorState }> = ({ state }) => {
    const { message, actions } = state;

    return (
        <div style={styles.errorContainer}>
            <Space direction="vertical" align="center" size="large">
                <div style={{ fontSize: '48px' }}>⚠️</div>
                <Title level={4} type="danger">Something went wrong</Title>
                <Text type="secondary">{message}</Text>
                <Button type="primary" size="large" onClick={actions.retry}>
                    Try Again
                </Button>
            </Space>
        </div>
    );
};

/**
 * Styles object
 */
const styles = {
    pageContainer: {
        minHeight: '100vh',
        padding: '24px',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
    },
    card: {
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        border: '1px solid #f0f0f0',
    },
    loadingStats: {
        textAlign: 'center' as const,
        padding: '40px 0',
    },
    errorStats: {
        textAlign: 'center' as const,
        padding: '40px 0',
    },

    // Simple stat card styles (unified design)
    simpleStatCard: {
        background: '#fafafa',
        borderRadius: '8px',
        padding: '20px',
        border: '1px solid #f0f0f0',
        transition: 'all 0.3s ease',
        cursor: 'default',
        height: '100%', // Take full height of the container
        minHeight: '120px', // Minimum height
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'space-between',
    },
    simpleStatTop: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px',
    },
    simpleStatIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    simpleStatValue: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#262626',
        lineHeight: 1,
        flex: 1,
    },
    simpleStatTitle: {
        fontSize: '14px',
        color: '#595959',
        fontWeight: '500',
        lineHeight: 1.3,
        maxHeight: '36px', // Exactly 2 lines at 1.3 line-height
        overflow: 'hidden',
        wordWrap: 'break-word' as const,
        hyphens: 'auto' as const,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical' as any,
    },

    // Quick link styles
    quickLinkCard: {
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #f0f0f0',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-2px)',
        },
    },
    quickLinkContent: {
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    quickLinkIcon: {
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid',
        flexShrink: 0,
    },
    quickLinkText: {
        flex: 1,
        minWidth: 0, // Allow text truncation
    },
    quickLinkTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#262626',
        marginBottom: '4px',
        wordWrap: 'break-word' as const,
    },
    quickLinkDescription: {
        fontSize: '13px',
        color: '#8c8c8c',
        lineHeight: 1.4,
        wordWrap: 'break-word' as const,
    },
    quickLinkArrow: {
        flexShrink: 0,
    },
    loadingContainer: {
        textAlign: 'center' as const,
        padding: '80px 0',
        background: '#f5f5f5',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorContainer: {
        textAlign: 'center' as const,
        padding: '80px 0',
        background: '#f5f5f5',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
};

export default DashboardPage;
