import React, { lazy, Suspense } from 'react';
import { Skeleton, Alert } from 'antd';

/**
 * Creates a lazy-loaded component with a loading fallback
 * @param importFn Function that imports the component
 * @param fallback Optional custom loading component
 * @returns Lazy component wrapped in Suspense
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  name: string,
  fallback: React.ReactNode = <Skeleton active paragraph={{ rows: 4 }} />
) {
  const LazyComponent = lazy(importFn);

  // Component display name for debugging
  const componentName = `Lazy${name}`;

  // Create a wrapper component with Suspense
  const Component = (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );

  // Set display name for better debugging
  Component.displayName = componentName;

  return Component;
}
/**
 * Error boundary for handling errors in lazy-loaded components
 */
export class LazyLoadErrorBoundary extends React.Component<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}, {
  hasError: boolean;
}> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Alert
          type="error"
          message="Failed to load component"
          description="There was a problem loading this part of the page. Please try refreshing."
        />
      );
    }

    return this.props.children;
  }
}