import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin, Space, List } from 'antd';
import { UserOutlined, TeamOutlined, HomeOutlined, CalendarOutlined, RightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { AuthManager } from '../../managers/auth/auth.manager';
import { MemberRepository } from '@/data/member';
import { FellowshipRepository } from '@/data/fellowship';
import { notifyUtils } from '@/utilities/notification_utils';

const { Title, Text, Paragraph } = Typography;

interface QuickLink {
    title: string;
    icon: React.ReactNode;
    path: string;
    permissionRequired: string;
}

/**
 * Dashboard page showing summary statistics using Ant Design components
 */
const DashboardPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalMembers: 0,
        totalFellowships: 0,
        activeFellowships: 0,
        recentMembers: 0
    });

    const authManager = AuthManager.instance;

    useEffect(() => {
        loadDashboardData();
    }, []);

    /**
     * Load dashboard data from repositories
     */
    const loadDashboardData = async () => {
        setLoading(true);

        try {
            // Load data based on permissions
            if (authManager.hasPermission('member.findAll')) {
                const memberRepo = new MemberRepository();
                const members = await memberRepo.getAll();

                // Update member stats
                setStats(prev => ({
                    ...prev,
                    totalMembers: members.length,
                    recentMembers: members.filter(m => {
                        const createdAt = new Date(m.createdAt);
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        return createdAt >= thirtyDaysAgo;
                    }).length
                }));
            }

            if (authManager.hasPermission('fellowship.findAll')) {
                const fellowshipRepo = new FellowshipRepository();
                const fellowships = await fellowshipRepo.getAll();

                // Update fellowship stats
                setStats(prev => ({
                    ...prev,
                    totalFellowships: fellowships.length,
                    activeFellowships: fellowships.filter(f =>
                        f.chairmanId || f.secretaryId || f.treasurerId
                    ).length
                }));
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            notifyUtils.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Quick links based on user permissions
    const quickLinks: QuickLink[] = [
        {
            title: 'Add New Member',
            icon: <UserOutlined />,
            path: '/members/create',
            permissionRequired: 'member.create'
        },
        {
            title: 'Create Fellowship',
            icon: <HomeOutlined />,
            path: '/fellowships/create',
            permissionRequired: 'fellowship.create'
        },
        {
            title: 'View All Members',
            icon: <TeamOutlined />,
            path: '/members',
            permissionRequired: 'member.findAll'
        },
        {
            title: 'View All Fellowships',
            icon: <TeamOutlined />,
            path: '/fellowships',
            permissionRequired: 'fellowship.findAll'
        }
    ].filter(link => authManager.hasPermission(link.permissionRequired));

    // Get current date for greeting
    const currentHour = new Date().getHours();
    let greeting = 'Good morning';
    if (currentHour >= 12 && currentHour < 17) {
        greeting = 'Good afternoon';
    } else if (currentHour >= 17) {
        greeting = 'Good evening';
    }

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
                <Title level={2}>Dashboard</Title>
                <Paragraph>
                    {greeting}, {authManager.currentUser?.name || 'User'}
                </Paragraph>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Total Members"
                                value={stats.totalMembers}
                                prefix={<UserOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Total Fellowships"
                                value={stats.totalFellowships}
                                prefix={<HomeOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Active Fellowships"
                                value={stats.activeFellowships}
                                prefix={<TeamOutlined />}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="New Members (30 days)"
                                value={stats.recentMembers}
                                prefix={<CalendarOutlined />}
                                valueStyle={{ color: '#fa8c16' }}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            <Card title="Quick Links">
                <List
                    grid={{
                        gutter: 16,
                        xs: 1,
                        sm: 2,
                        md: 2,
                        lg: 4
                    }}
                    dataSource={quickLinks}
                    renderItem={(item) => (
                        <List.Item>
                            <Link to={item.path}>
                                <Card
                                    hoverable
                                    size="small"
                                >
                                    <Space>
                                        {item.icon}
                                        <Text>{item.title}</Text>
                                        <RightOutlined style={{ fontSize: '12px' }} />
                                    </Space>
                                </Card>
                            </Link>
                        </List.Item>
                    )}
                />
            </Card>
        </Space>
    );
};

export default DashboardPage;