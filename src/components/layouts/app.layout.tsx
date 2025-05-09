import React, { useState, CSSProperties } from 'react';
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
import { AuthManager } from '@/features/auth/auth.manager';
import { User } from '@/models';
import { ItemType, MenuItemType } from 'antd/es/menu/interface';
import { DesignTokens } from '@/app/theme/constants';
import { Actions } from '@/features/auth/permission';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

/**
 * Logo Component for the sidebar
 */
interface LogoProps {
    collapsed: boolean;
}

const Logo: React.FC<LogoProps> = ({ collapsed }) => (
    <div style={styles.logoContainer(collapsed)}>
        <Link to="/dashboard">
            <Title level={collapsed ? 5 : 4} style={styles.title(collapsed)}>
                {collapsed ? 'B' : 'Barnabas'}
            </Title>
        </Link>
    </div>
);

/**
 * Navigation menu component
 */
interface NavigationMenuProps {
    collapsed: boolean;
    currentPath: string;
    authManager: AuthManager;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ currentPath, authManager }) => {
    const menuItems: ItemType<MenuItemType>[] = [
        {
            key: 'dashboard',
            icon: <HomeOutlined />,
            label: <Link to="/dashboard">Dashboard</Link>,
        },
        {
            key: 'members',
            icon: <TeamOutlined />,
            label: authManager.hasPermission(Actions.MEMBER_FIND_ALL) ? (
                <Link to="/members">Members</Link>
            ) : (
                <span style={styles.disabledMenuItem}>Members</span>
            ),
        },
        {
            key: 'fellowships',
            icon: <PartitionOutlined />,
            label: authManager.hasPermission(Actions.FELLOWSHIP_FIND_ALL) ? (
                <Link to="/fellowships">Fellowships</Link>
            ) : (
                <span style={styles.disabledMenuItem}>Fellowships</span>
            ),
        },
        {
            key: 'opportunities',
            icon: <HeartOutlined />,
            label: authManager.hasPermission(Actions.MEMBER_CREATE) ? (
                <Link to="/opportunities">Opportunities</Link>
            ) : (
                <span style={styles.disabledMenuItem}>Opportunities</span>
            ),
        },
        {
            key: 'envelopes',
            icon: <HeartOutlined />,
            label: authManager.hasPermission(Actions.MEMBER_CREATE) ? (
                <Link to="/envelopes">Envelopes</Link>
            ) : (
                <span style={styles.disabledMenuItem}>Envelopes</span>
            ),
        },
        {
            key: 'users',
            icon: <TeamOutlined />,
            label: authManager.hasPermission(Actions.USER_FIND_ALL) ? (
                <Link to="/users">Users</Link>
            ) : (
                <span style={styles.disabledMenuItem}>Users</span>
            ),
        },
        {
            key: 'roles',
            icon: <SettingOutlined />,
            label: authManager.hasPermission(Actions.ROLE_FIND_ALL) ? (
                <Link to="/roles">Roles</Link>
            ) : (
                <span style={styles.disabledMenuItem}>Roles</span>
            ),
        },
    ];

    return (
        <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[currentPath]}
            items={menuItems}
        />
    );
};

/**
 * User profile dropdown component
 */
interface UserProfileDropdownProps {
    currentUser: User | null;
    handleLogout: () => Promise<void>;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ currentUser, handleLogout }) => {
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

    return (
        <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={['click']}
        >
            <Space style={styles.userDropdown}>
                <Avatar icon={<UserOutlined />} />
                <Text>{currentUser?.name || 'User'}</Text>
            </Space>
        </Dropdown>
    );
};

/**
 * Application Layout component
 * Provides the main layout for the protected pages of the application
 */
const AppLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const location = useLocation();
    const navigate = useNavigate();
    const authManager = AuthManager.instance;
    const currentUser = authManager.useCurrentUser() as User;

    // Handle sidebar toggle
    const toggleSidebar = (): void => {
        setCollapsed(!collapsed);
    };

    // Handle logout
    const handleLogout = async (): Promise<void> => {
        await authManager.logout();
        navigate('/login');
    };

    // Get the current route path for menu selection
    const getCurrentPath = (): string => {
        const path = location.pathname;
        if (path.startsWith('/dashboard')) return 'dashboard';
        if (path.startsWith('/members')) return 'members';
        if (path.startsWith('/fellowships')) return 'fellowships';
        if (path.startsWith('/opportunities')) return 'opportunities';
        if (path.startsWith('/envelopes')) return 'envelopes';
        if (path.startsWith('/roles')) return 'roles';
        if (path.startsWith('/users')) return 'users';
        return '';
    };

    const currentPath = getCurrentPath();

    return (
        <Layout style={styles.layout}>
            {/* Sidebar */}
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={250}
                style={styles.sider}
            >
                <Logo collapsed={collapsed} />
                <Divider style={styles.divider} />
                <NavigationMenu
                    collapsed={collapsed}
                    currentPath={currentPath}
                    authManager={authManager}
                />
            </Sider>

            {/* Main Layout */}
            <Layout style={styles.mainLayout(collapsed)}>
                {/* Header */}
                <Header style={styles.header}>
                    <div style={styles.headerContent}>
                        {/* Left side - Toggle button */}
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={toggleSidebar}
                        />

                        {/* Right side - User profile */}
                        <UserProfileDropdown
                            currentUser={currentUser}
                            handleLogout={handleLogout}
                        />
                    </div>
                </Header>

                {/* Content */}
                <Content style={styles.content}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

// Define a type for our styles object that handles both static styles and function styles
type StylesType = {
    layout: CSSProperties;
    sider: CSSProperties;
    logoContainer: (collapsed: boolean) => CSSProperties;
    title: (collapsed: boolean) => CSSProperties;
    divider: CSSProperties;
    disabledMenuItem: CSSProperties;
    mainLayout: (collapsed: boolean) => CSSProperties;
    header: CSSProperties;
    headerContent: CSSProperties;
    userDropdown: CSSProperties;
    content: CSSProperties;
};

const styles: StylesType = {
    layout: {
        minHeight: '100vh',
        width: '100%'
    },
    sider: {
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100
    },
    logoContainer: (collapsed: boolean): CSSProperties => ({
        padding: collapsed ? '16px 0' : '16px',
        textAlign: collapsed ? 'center' : 'left'
    }),
    title: (_: boolean): CSSProperties => ({
        margin: 0,
        color: 'white'
    }),
    divider: {
        margin: '0 0 8px 0',
        borderColor: 'rgba(255, 255, 255, 0.2)'
    },
    disabledMenuItem: {
        color: 'rgba(255, 255, 255, 0.5)'
    },
    mainLayout: (collapsed: boolean): CSSProperties => ({
        marginLeft: collapsed ? 80 : 250,
        transition: 'all 0.2s',
        width: '100%'
    }),
    header: {
        padding: '0 16px',
        background: '#fff'
    },
    headerContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    userDropdown: {
        cursor: 'pointer'
    },
    content: {
        margin: '24px 16px',
        padding: 24,
        background: '#fff',
        minHeight: 280,
        borderRadius: DesignTokens.Radius.LARGE,
    }
};

export default AppLayout;