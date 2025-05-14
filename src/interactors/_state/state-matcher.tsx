import { UI_STATE_TYPE, UIStateBase } from "./common"

// Matcher Function with Configurable Views
export function createUIStateMatcher<
  State extends UIStateBase<UI_STATE_TYPE>,
  Views extends Record<string, React.ComponentType<{ state: any }>>
>(
  state: State,
  views: Views
) {
  const type = state.type
  if (type === UI_STATE_TYPE.error) return <views.FailureView state={state} />
  if (type === UI_STATE_TYPE.loading) return <views.LoadingView state={state} />
  if (type === UI_STATE_TYPE.success) return <views.SuccessView state={state} />
  if (type === UI_STATE_TYPE.unauthorized) return <views.UnauthorizedView state={state} />
  return undefined
};

