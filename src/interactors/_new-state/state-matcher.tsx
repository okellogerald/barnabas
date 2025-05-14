import React from 'react';
import { AsyncErrorState, AsyncIdleState, AsyncLoadingState, AsyncNotFoundState, AsyncState, AsyncSuccessState, AsyncUnauthenticatedState, AsyncUnauthorizedState } from './types';

export function AsyncStateMatcher<T,
  S extends AsyncSuccessState<T>,
  I extends AsyncIdleState,
  L extends AsyncLoadingState,
  E extends AsyncErrorState,
  U extends AsyncUnauthorizedState,
  A extends AsyncUnauthenticatedState,
  N extends AsyncNotFoundState
>(props: {
  state: AsyncState<T> | S | I | L | E | U | A | N;
  views: {
    IdleView: React.ComponentType<{ state: I }>;
    LoadingView: React.ComponentType<{ state: L }>;
    ErrorView: React.ComponentType<{ state: E }>;
    UnauthorizedView: React.ComponentType<{ state: U }>;
    UnauthenticatedView: React.ComponentType<{ state: A }>;
    NotFoundView: React.ComponentType<{ state: N }>;
    SuccessView: React.ComponentType<{ state: S }>;
  };
}) {
  const { state, views } = props;
  const {
    IdleView,
    LoadingView,
    ErrorView,
    UnauthorizedView,
    UnauthenticatedView,
    NotFoundView,
    SuccessView
  } = views;

  switch (state.type) {
    case 'idle':
      return <IdleView state={state as I} />;
    case 'loading':
      return <LoadingView state={state as L} />;
    case 'error':
      return <ErrorView state={state as E} />;
    case 'unauthorized':
      return <UnauthorizedView state={state as U} />;
    case 'unauthenticated':
      return <UnauthenticatedView state={state as A} />;
    case 'notFound':
      return <NotFoundView state={state as N} />;
    case 'success':
      return <SuccessView state={state as S} />;
    default:
      return null;
  }
}