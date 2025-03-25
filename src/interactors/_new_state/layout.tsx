import React from 'react';
import { Button, Flex, Layout, Result, Spin, Typography, Alert, Card, Space } from 'antd';
import { Content } from 'antd/es/layout/layout';
import {
    ArrowLeftOutlined,
    LoginOutlined,
    ReloadOutlined,
    UnorderedListOutlined,
    PlusOutlined,
    LockOutlined,
    WarningOutlined,
    InfoCircleOutlined,
    FileSearchOutlined
} from '@ant-design/icons';
import {
    AsyncState,
    AsyncIdleState,
    AsyncLoadingState,
    AsyncErrorState,
    AsyncUnauthorizedState,
    AsyncSuccessState,
    isSuccessState,
    AsyncNotFoundState,
    AsyncUnauthenticatedState
} from './types';
import { AsyncStateMatcher } from './state_matcher';

const { Text, Title } = Typography;

// Default view components
const DefaultIdleView: React.FC<{ state: AsyncIdleState }> = ({ state }) => (
    <Flex vertical style={{ width: '100%', height: '100%' }} justify="center" align="center">
        <Card variant={"outlined"} style={{ width: 400, textAlign: 'center' }}>
            <InfoCircleOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <Title level={4}>Ready to Start</Title>
            <Text>{state.message || 'Waiting for input to begin...'}</Text>
        </Card>
    </Flex>
);

const DefaultLoadingView: React.FC<{ state: AsyncLoadingState }> = ({ state }) => (
    <Flex vertical style={{ width: '100%', height: '100%' }} justify="center" align="center">
        <Card variant={"outlined"} style={{ width: 400, textAlign: 'center', padding: '24px 0' }}>
            <Spin tip={state.message || 'Loading...'} size="large">
                <div style={{ padding: 100, borderRadius: 8 }} />
            </Spin>
        </Card>
    </Flex>
);

const DefaultErrorView: React.FC<{ state: AsyncErrorState }> = ({ state }) => (
    <Flex vertical style={{ width: '100%', height: '100%' }} justify="center" align="center">
        <Result
            status="error"
            title="Something went wrong"
            subTitle={state.message}
            icon={<WarningOutlined />}
            extra={
                <Space direction="vertical" align="center">
                    <Alert
                        message="Error Details"
                        description={state.message}
                        type="error"
                        showIcon
                        style={{ maxWidth: 500, marginBottom: 16 }}
                    />
                    <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={() => state.actions.retry()}
                        size="large"
                    >
                        Try Again
                    </Button>
                </Space>
            }
        />
    </Flex>
);

const DefaultUnauthorizedView: React.FC<{ state: AsyncUnauthorizedState }> = ({ state }) => (
    <Flex vertical style={{ width: '100%', height: '100%' }} justify="center" align="center">
        <Result
            status="403"
            title="Access Denied"
            subTitle={state.message}
            icon={<LockOutlined style={{ color: '#f5222d' }} />}
            extra={
                <Space direction="vertical" align="center">
                    {state.requiredPermissions && state.requiredPermissions.length > 0 && (
                        <Alert
                            message="Required Permissions"
                            description={
                                <ul>
                                    {state.requiredPermissions.map((perm, index) => (
                                        <li key={index}>{perm}</li>
                                    ))}
                                </ul>
                            }
                            type="info"
                            showIcon
                            style={{ maxWidth: 500, marginBottom: 16 }}
                        />
                    )}
                    <Flex gap="middle">
                        {state.actions?.goBack && (
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={state.actions.goBack}
                            >
                                Go Back
                            </Button>
                        )}
                        {state.actions?.retry && (
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={state.actions.retry}
                            >
                                Try Again
                            </Button>
                        )}
                        {state.actions?.login && (
                            <Button
                                type="primary"
                                icon={<LoginOutlined />}
                                onClick={state.actions.login}
                            >
                                Log In
                            </Button>
                        )}
                    </Flex>
                </Space>
            }
        />
    </Flex>
);

const DefaultUnauthenticatedView: React.FC<{ state: AsyncUnauthenticatedState }> = ({ state }) => (
    <Flex vertical style={{ width: '100%', height: '100%' }} justify="center" align="center">
        <Result
            status="warning"
            title="Authentication Required"
            subTitle={state.message || "Your session has expired or you need to log in."}
            icon={<LoginOutlined style={{ color: '#faad14' }} />}
            extra={
                <Space direction="vertical" align="center">
                    <Alert
                        message="Session Information"
                        description="Your authentication token is invalid or has expired. Please log in again to continue."
                        type="warning"
                        showIcon
                        style={{ maxWidth: 500, marginBottom: 16 }}
                    />
                    <Flex gap="middle">
                        {state.actions?.retry && (
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={state.actions.retry}
                            >
                                Try Again
                            </Button>
                        )}
                        {state.actions?.login && (
                            <Button
                                type="primary"
                                icon={<LoginOutlined />}
                                onClick={state.actions.login}
                                size="large"
                            >
                                Log In Now
                            </Button>
                        )}
                    </Flex>
                </Space>
            }
        />
    </Flex>
);

const DefaultNotFoundView: React.FC<{ state: AsyncNotFoundState }> = ({ state }) => (
    <Flex vertical style={{ width: '100%', height: '100%' }} justify="center" align="center">
        <Result
            status="404"
            title={`${state.resourceType} Not Found`}
            subTitle={state.message || `The requested ${state.resourceType.toLowerCase()} could not be found.`}
            icon={<FileSearchOutlined style={{ color: '#1890ff' }} />}
            extra={
                <Space direction="vertical" align="center">
                    {state.resourceId && (
                        <Alert
                            message="Resource Information"
                            description={`You were looking for ${state.resourceType} with ID: ${state.resourceId}`}
                            type="info"
                            showIcon
                            style={{ maxWidth: 500, marginBottom: 16 }}
                        />
                    )}
                    <Flex gap="middle">
                        {state.actions?.goBack && (
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={state.actions.goBack}
                            >
                                Go Back
                            </Button>
                        )}
                        {state.actions?.goToList && (
                            <Button
                                icon={<UnorderedListOutlined />}
                                onClick={state.actions.goToList}
                            >
                                View All {state.resourceType}s
                            </Button>
                        )}
                        {state.actions?.create && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={state.actions.create}
                            >
                                Create New {state.resourceType}
                            </Button>
                        )}
                    </Flex>
                </Space>
            }
        />
    </Flex>
);

// Props for the layout component
interface AsyncPageLayoutProps<T> {
    state: AsyncState<T>;
    SuccessView: React.ComponentType<{ state: AsyncSuccessState<T> }>;
    IdleView?: React.ComponentType<{ state: AsyncIdleState }>;
    LoadingView?: React.ComponentType<{ state: AsyncLoadingState }>;
    ErrorView?: React.ComponentType<{ state: AsyncErrorState }>;
    UnauthorizedView?: React.ComponentType<{ state: AsyncUnauthorizedState }>;
    UnauthenticatedView?: React.ComponentType<{ state: AsyncUnauthenticatedState }>;
    NotFoundView?: React.ComponentType<{ state: AsyncNotFoundState }>;
    header?: React.ComponentType<{ state: AsyncSuccessState<T> }>;
    title?: string;
}

export function AsyncPageLayout<T>({
    state,
    SuccessView,
    IdleView,
    LoadingView = DefaultLoadingView,
    ErrorView = DefaultErrorView,
    UnauthorizedView = DefaultUnauthorizedView,
    UnauthenticatedView = DefaultUnauthenticatedView,
    NotFoundView = DefaultNotFoundView,
    header: Header,
    title
}: AsyncPageLayoutProps<T>) {
    return (
        <Layout style={{ width: '100%', background: 'transparent', }}>
            {/* Title bar (always shown if provided) */}
            {title && (
                <div style={{ backgroundColor: 'transparent', paddingBottom: 16 }}>
                    <Flex justify="space-between" align="center">
                        <Text strong style={{ fontSize: 16 }}>{title}</Text>
                    </Flex>
                </div>
            )}

            {/* Header (only shown in success state) */}
            {isSuccessState(state) && Header && (
                <div style={{ backgroundColor: 'transparent', paddingBottom: 24 }}>
                    <Header state={state} />
                </div>
            )}

            {/* Main content area */}
            <Content style={{ backgroundColor: 'transparent', height: '100%', width: '100%' }}>
                <AsyncStateMatcher
                    state={state}
                    views={{
                        IdleView: IdleView || DefaultIdleView,
                        LoadingView,
                        ErrorView,
                        UnauthorizedView,
                        UnauthenticatedView,
                        NotFoundView,
                        SuccessView,
                    }}
                />
            </Content>
        </Layout>
    );
}