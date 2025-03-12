import { Button, Flex, Layout, Spin } from "antd";
import { Content } from "antd/es/layout/layout";
import React, { PropsWithChildren } from "react";
import {
    createUIStateMatcher,
    IErrorState,
    ILoadingState,
    UI_STATE_TYPE,
    UIStateBase
} from "../../interactors/_state";
import { DesignTokens } from "../../app";

const styles = {
    layout: {
        width: "100%",
    },
    header: {
        backgroundColor: "Background",
        paddingBottom: 24,
    } as React.CSSProperties,
    content: {
        backgroundColor: "Background",
        height: "100%",
        width: "100%",
    } as React.CSSProperties,
    body: {
        width: "100%",
        height: "100%",
    } as React.CSSProperties,
    spin: {
    } as React.CSSProperties,
    loadingContainer: {
        padding: 100,
        background: 'rgba(0, 0, 0, 0.05)',
        borderRadius: DesignTokens.Radius.LARGE,
    } as React.CSSProperties,
};

const HeaderWrapper: React.FC<PropsWithChildren> = ({ children }) => (
    <div style={styles.header}>
        <Flex justify="end" align="center" gap="middle" style={{ height: "100%" }}>
            {children}
        </Flex>
    </div>
);

const LoadingView: React.FC<{ state: ILoadingState }> = () => (
    <Flex
        vertical
        style={styles.body}
        justify="center"
        align="center"
    >
        <Spin tip="Loading..." size="default" style={styles.spin}>
            <div style={styles.loadingContainer} />
        </Spin>
    </Flex>
);

const FailureView: React.FC<{ state: IErrorState }> = ({ state }) => {
    const { actions } = state;

    return (
        <Flex
            vertical
            style={styles.body}
            justify="center"
            align="center"
            gap={"middle"}
        >
            Failed to fetch data
            <Button onClick={() => actions.retry()}>Try Again</Button>
        </Flex>
    );
};

interface PageLayoutProps<T extends UIStateBase<UI_STATE_TYPE>> {
    state: T;
    SuccessView: React.FC<{ state: Extract<T, { type: UI_STATE_TYPE.success }> }>;
    header?: React.ReactNode;
}

export const AsyncListLayout = <T extends UIStateBase<UI_STATE_TYPE>>({ state, SuccessView, header }: PageLayoutProps<T>) => {
    const view = createUIStateMatcher(state, {
        FailureView,
        SuccessView,
        LoadingView,
    });

    return (
        <Layout style={styles.layout}>
            {
                state.type === UI_STATE_TYPE.success && header && <HeaderWrapper>
                    {header}
                </HeaderWrapper>
            }
            <Content style={styles.content}>
                {view}
            </Content>
        </Layout>
    );
};
