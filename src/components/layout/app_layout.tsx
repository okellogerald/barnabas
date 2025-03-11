import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Typography, Space, Divider } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    HomeOutlined,
    TeamOutlined,
    PartitionOutlined,
    SettingOutlined,
    LogoutOutlined,
    HeartOutlined
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthManager } from '@/managers/auth/auth.manager';
import { User } from '@/models';
import { ItemType, MenuItemType } from 'antd/es/menu/interface';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

/**
 * Application Layout component
 * Provides the main layout for the protected pages of the application
 */
const AppLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const authManager = AuthManager.instance;
    const currentUser = authManager.useCurrentUser() as User;

    // Handle sidebar toggle
    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    // Handle logout
    const handleLogout = async () => {
        await authManager.logout();
        navigate('/login');
    };

    // User menu items
    const userMenuItems: ItemType<MenuItemType>[] = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'My Profile',
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Settings',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: handleLogout,
        },
    ];

    // Get the current route path for menu selection
    const getCurrentPath = () => {
        const path = location.pathname;
        if (path.startsWith('/dashboard')) return 'dashboard';
        if (path.startsWith('/members')) return 'members';
        if (path.startsWith('/fellowships')) return 'fellowships';
        if (path.startsWith('/opportunities')) return 'opportunities';
        if (path.startsWith('/roles')) return 'roles';
        return '';
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={250}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 100
                }}
            >
                {/* Logo */}
                <div style={{ padding: collapsed ? '16px 0' : '16px', textAlign: collapsed ? 'center' : 'left' }}>
                    <Link to="/dashboard">
                        <Title level={collapsed ? 5 : 4} style={{ margin: 0, color: 'white' }}>
                            {collapsed ? 'CMS' : 'Church Management'}
                        </Title>
                    </Link>
                </div>

                <Divider style={{ margin: '0 0 8px 0', borderColor: 'rgba(255, 255, 255, 0.2)' }} />

                {/* Navigation Menu */}
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[getCurrentPath()]}
                    items={[
                        {
                            key: 'dashboard',
                            icon: <HomeOutlined />,
                            label: <Link to="/dashboard">Dashboard</Link>,
                        },
                        {
                            key: 'members',
                            icon: <TeamOutlined />,
                            label: authManager.hasPermission('member.findAll') ? (
                                <Link to="/members">Members</Link>
                            ) : (
                                <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Members</span>
                            ),
                        },
                        {
                            key: 'fellowships',
                            icon: <PartitionOutlined />,
                            label: authManager.hasPermission('fellowship.findAll') ? (
                                <Link to="/fellowships">Fellowships</Link>
                            ) : (
                                <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Fellowships</span>
                            ),
                        },
                        {
                            key: 'opportunities',
                            icon: <HeartOutlined />,
                            label: authManager.hasPermission('opportunity.findAll') ? (
                                <Link to="/opportunities">Opportunities</Link>
                            ) : (
                                <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Opportunities</span>
                            ),
                        },
                        {
                            key: 'roles',
                            icon: <SettingOutlined />,
                            label: authManager.hasPermission('role.findAll') ? (
                                <Link to="/roles">Roles</Link>
                            ) : (
                                <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Roles</span>
                            ),
                        },
                    ]}
                />
            </Sider>

            {/* Main Layout */}
            <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'all 0.2s' }}>
                {/* Header */}
                <Header style={{ padding: '0 16px', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* Left side - Toggle button */}
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={toggleSidebar}
                        />

                        {/* Right side - User profile */}
                        <Dropdown
                            menu={{ items: userMenuItems }}
                            placement="bottomRight"
                            trigger={['click']}
                        >
                            <Space style={{ cursor: 'pointer' }}>
                                <Avatar icon={<UserOutlined />} />
                                <Text>{currentUser?.name || 'User'}</Text>
                            </Space>
                        </Dropdown>
                    </div>
                </Header>

                {/* Content */}
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AppLayout;