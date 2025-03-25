import React, { JSX } from 'react';
import { AsyncErrorState, AsyncIdleState, AsyncLoadingState, AsyncNotFoundState, AsyncState, AsyncSuccessState, AsyncUnauthenticatedState, AsyncUnauthorizedState, UI_STATE_TYPE } from './types';

// Define a type for views so they receive properly typed state
type StateViews<T> = {
  IdleView?: React.ComponentType<{ state: AsyncIdleState }>;
  LoadingView: React.ComponentType<{ state: AsyncLoadingState }>;
  ErrorView: React.ComponentType<{ state: AsyncErrorState }>;
  UnauthorizedView: React.ComponentType<{ state: AsyncUnauthorizedState }>;
  UnauthenticatedView: React.ComponentType<{ state: AsyncUnauthenticatedState }>;
  SuccessView: React.ComponentType<{ state: AsyncSuccessState<T> }>;
  NotFoundView: React.ComponentType<{ state: AsyncNotFoundState }>;
};

interface AsyncStateMatcherProps<T> {
  state: AsyncState<T>;
  views: StateViews<T>;
}

export function AsyncStateMatcher<T>({ state, views }: AsyncStateMatcherProps<T>): JSX.Element {
  const { type } = state;

  switch (type) {
    case UI_STATE_TYPE.idle:
      return views.IdleView ? <views.IdleView state={state as AsyncIdleState} /> : <></>;
    case UI_STATE_TYPE.loading:
      return <views.LoadingView state={state as AsyncLoadingState} />;
    case UI_STATE_TYPE.error:
      return <views.ErrorView state={state as AsyncErrorState} />;
    case UI_STATE_TYPE.unauthorized:
      return <views.UnauthorizedView state={state as AsyncUnauthorizedState} />;
    case UI_STATE_TYPE.success:
      return <views.SuccessView state={state as AsyncSuccessState<T>} />;
    case UI_STATE_TYPE.notFound:
      return <views.NotFoundView state={state as AsyncNotFoundState} />;
    default:
      return <></>;
  }
}