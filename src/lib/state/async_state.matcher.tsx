import React from 'react';
import {
  Alert,
  Button,
  Card,
  Empty,
  Result,
  Spin,
  Space,
  Typography,
  Flex
} from 'antd';
import {
  InfoCircleOutlined,
  ReloadOutlined,
  LoginOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  FileSearchOutlined,
  UnorderedListOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { 
  AsyncState,
  IdleState,
  LoadingState,
  ErrorState,
  SuccessState,
  NotFoundState,
  UnauthorizedState,
  UnauthenticatedState,
  isIdleState,
  isLoadingState,
  isErrorState,
  isSuccessState,
  isNotFoundState, 
  isUnauthorizedState,
  isUnauthenticatedState
} from '@/lib/state';

const { Text } = Typography;

interface AsyncStateMatcherProps<T> {
  // Current state to match against
  state: AsyncState<T>;
  
  // Custom render functions for each state type
  views: {
    IdleView?: React.ComponentType<{ state: IdleState }>;
    LoadingView?: React.ComponentType<{ state: LoadingState }>;
    ErrorView?: React.ComponentType<{ state: ErrorState }>;
    SuccessView: React.ComponentType<{ state: SuccessState<T> | any }>;
    UnauthorizedView?: React.ComponentType<{ state: UnauthorizedState }>;
    NotFoundView?: React.ComponentType<{ state: NotFoundState }>;
    UnauthenticatedView?: React.ComponentType<{ state: UnauthenticatedState }>;
    // Allow for custom state views
    [key: string]: React.ComponentType<{ state: any }> | undefined;
  };
  
  // Use compact styling for space-constrained UIs
  compact?: boolean;
  
  // Style props
  className?: string;
  style?: React.CSSProperties;
  
  // Custom messages
  messages?: {
    loading?: string;
    error?: string;
    unauthorized?: string;
    notFound?: string;
    unauthenticated?: string;
    idle?: string;
  };
}

/**
 * Component that renders different views based on the current AsyncState type
 */
export function AsyncStateMatcher<T>({
  state,
  views,
  compact = false,
  messages = {}
}: AsyncStateMatcherProps<T>) {
  // If a custom view is provided for this state type, use it
  if (isIdleState(state) && views.IdleView) {
    return <views.IdleView state={state} />;
  }

  if (isLoadingState(state) && views.LoadingView) {
    return <views.LoadingView state={state} />;
  }

  if (isErrorState(state) && views.ErrorView) {
    return <views.ErrorView state={state} />;
  }

  if (isUnauthorizedState(state) && views.UnauthorizedView) {
    return <views.UnauthorizedView state={state} />;
  }

  if (isNotFoundState(state) && views.NotFoundView) {
    return <views.NotFoundView state={state} />;
  }

  if (isUnauthenticatedState(state) && views.UnauthenticatedView) {
    return <views.UnauthenticatedView state={state} />;
  }

  if (isSuccessState(state)) {
    return <views.SuccessView state={state} />;
  }

  // Check for custom state types by convention
  const customViewName = `${state.type.charAt(0).toUpperCase() + state.type.slice(1)}View`;
  const CustomView = views[customViewName];

  if (CustomView) {
    return React.createElement(CustomView, { state });
  }

  // If no custom view is provided, fall back to default views based on state type
  if (isIdleState(state)) {
    return compact ? <CompactIdleView state={state} message={messages.idle} /> : <DefaultIdleView state={state} message={messages.idle} />;
  }

  if (isLoadingState(state)) {
    return compact ? <CompactLoadingView state={state} message={messages.loading} /> : <DefaultLoadingView state={state} message={messages.loading} />;
  }

  if (isErrorState(state)) {
    return compact ? <CompactErrorView state={state} message={messages.error} /> : <DefaultErrorView state={state} message={messages.error} />;
  }

  if (isUnauthorizedState(state)) {
    return compact ? <CompactUnauthorizedView state={state} message={messages.unauthorized} /> : <DefaultUnauthorizedView state={state} message={messages.unauthorized} />;
  }

  if (isNotFoundState(state)) {
    return compact ? <CompactNotFoundView state={state} message={messages.notFound} /> : <DefaultNotFoundView state={state} message={messages.notFound} />;
  }

  if (isUnauthenticatedState(state)) {
    return compact ? <CompactUnauthenticatedView state={state} message={messages.unauthenticated} /> : <DefaultUnauthenticatedView state={state} message={messages.unauthenticated} />;
  }

  // Fallback for unknown state types
  return null;
}

// Default view components

interface DefaultViewProps {
  state: any;
  message?: string;
}

// IDLE STATE VIEWS
const DefaultIdleView = ({ state, message }: DefaultViewProps) => (
  <Card size="small" style={{ textAlign: 'center', maxWidth: 300, margin: '0 auto' }}>
    <Flex vertical align="center" gap="small">
      <InfoCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />
      <Text>{message || state.message || 'Ready to start'}</Text>
      {state.actions.initialize && (
        <Button
          type="primary"
          onClick={() => state.initialize()}
        >
          Start
        </Button>
      )}
    </Flex>
  </Card>
);

const CompactIdleView = ({ state, message }: DefaultViewProps) => (
  <Alert
    type="info"
    showIcon
    message={message || state.message || 'Ready to start'}
    action={
      state.actions.initialize && (
        <Button
          size="small"
          type="primary"
          onClick={() => state.initialize()}
        >
          Start
        </Button>
      )
    }
  />
);

// LOADING STATE VIEWS
const DefaultLoadingView = ({ state, message }: DefaultViewProps) => (
  <Flex
    vertical
    align="center"
    justify="center"
    style={{ width: '100%', padding: '32px 0' }}
    gap={"middle"}
  >
    <Spin />
    <Text>{message || state.message || 'Loading...'}</Text>
  </Flex>
);

const CompactLoadingView = ({ state, message }: DefaultViewProps) => (
  <Flex align="center" gap="small" style={{ padding: '8px' }}>
    <Spin size="small" />
    <Text>{message || state.message || 'Loading...'}</Text>
  </Flex>
);

// ERROR STATE VIEWS
const DefaultErrorView = ({ state, message }: DefaultViewProps) => (
  <Result
    status="error"
    icon={<WarningOutlined />}
    title="Error"
    subTitle={message || state.getErrorMessage()}
    extra={
      <Button
        type="primary"
        danger
        icon={<ReloadOutlined />}
        onClick={() => state.retry()}
      >
        Try Again
      </Button>
    }
  />
);

const CompactErrorView = ({ state, message }: DefaultViewProps) => (
  <Alert
    type="error"
    message={message || state.getErrorMessage()}
    showIcon
    action={
      <Button
        size="small"
        danger
        onClick={() => state.retry()}
      >
        Retry
      </Button>
    }
  />
);

// UNAUTHORIZED STATE VIEWS
const DefaultUnauthorizedView = ({ state, message }: DefaultViewProps) => (
  <Result
    status="403"
    title="Access Denied"
    subTitle={message || state.message}
    icon={<LockOutlined style={{ color: '#f5222d' }} />}
    extra={
      <Space>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => state.goBack()}
        >
          Go Back
        </Button>
        {state.actions.retry && (
          <Button
            icon={<ReloadOutlined />}
            onClick={() => state.retry()}
          >
            Try Again
          </Button>
        )}
        {state.actions.requestAccess && (
          <Button
            type="primary"
            onClick={() => state.requestAccess()}
          >
            Request Access
          </Button>
        )}
      </Space>
    }
  />
);

const CompactUnauthorizedView = ({ state, message }: DefaultViewProps) => (
  <Alert
    type="error"
    showIcon
    message="Access Denied"
    description={message || state.message}
    icon={<LockOutlined />}
    action={
      <Space direction="vertical" size="small">
        <Button
          size="small"
          onClick={() => state.goBack()}
        >
          Back
        </Button>
        {state.actions.retry && (
          <Button
            size="small"
            onClick={() => state.retry()}
          >
            Retry
          </Button>
        )}
      </Space>
    }
  />
);

// NOT FOUND STATE VIEWS
const DefaultNotFoundView = ({ state, message }: DefaultViewProps) => (
  <Result
    status="404"
    title={`${state.resourceType} Not Found`}
    subTitle={message || state.message}
    icon={<FileSearchOutlined style={{ color: '#1890ff' }} />}
    extra={
      <Space>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => state.retry()}
        >
          Try Again
        </Button>
        {state.actions.goBack && (
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => state.goBack()}
          >
            Go Back
          </Button>
        )}
        {state.actions.goToList && (
          <Button
            icon={<UnorderedListOutlined />}
            onClick={() => state.goToList()}
          >
            View All
          </Button>
        )}
      </Space>
    }
  />
);

const CompactNotFoundView = ({ state, message }: DefaultViewProps) => (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description={message || state.message}
    style={{ margin: '8px 0' }}
  >
    <Space size="small">
      <Button
        size="small"
        onClick={() => state.retry()}
      >
        Retry
      </Button>
      {state.actions.goBack && (
        <Button
          size="small"
          onClick={() => state.goBack()}
        >
          Back
        </Button>
      )}
    </Space>
  </Empty>
);

// UNAUTHENTICATED STATE VIEWS
const DefaultUnauthenticatedView = ({ state, message }: DefaultViewProps) => (
  <Result
    status="warning"
    title="Authentication Required"
    subTitle={message || state.message}
    icon={<LoginOutlined style={{ color: '#faad14' }} />}
    extra={
      <Space>
        <Button
          type="primary"
          icon={<LoginOutlined />}
          onClick={() => state.login()}
        >
          Log In
        </Button>
        {state.actions.retry && (
          <Button
            icon={<ReloadOutlined />}
            onClick={() => state.retry()}
          >
            Try Again
          </Button>
        )}
      </Space>
    }
  />
);

const CompactUnauthenticatedView = ({ state, message }: DefaultViewProps) => (
  <Alert
    type="warning"
    showIcon
    message="Authentication Required"
    description={message || state.message}
    action={
      <Button
        size="small"
        type="primary"
        onClick={() => state.login()}
      >
        Log In
      </Button>
    }
  />
);

/**
 * Simplified version of AsyncStateMatcher that uses the default views
 */
export function AsyncStateRenderer<T>({
  state,
  views,
  compact = false,
  className,
  style,
  messages
}: Omit<AsyncStateMatcherProps<T>, 'defaultViews'>) {
  return (
    <AsyncStateMatcher
      state={state}
      views={views}
      compact={compact}
      className={className}
      style={style}
      messages={messages}
    />
  );
}