import { Button, Flex, Layout, Spin } from "antd";
import { Content } from "antd/es/layout/layout";
import React, { PropsWithChildren } from "react";
import {
    UI_STATE_TYPE
} from "../../interactors/_state";
import { DesignTokens } from "../../app";
import { MemberDetailsErrorState, MemberDetailsLoadingState, MemberDetailsSuccessState, MemberDetailsUIState } from "@/interactors/member-details";

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

const LoadingView = (state: MemberDetailsLoadingState) => (
    <Flex
        vertical
        style={styles.body}
        justify="center"
        align="center"
    >
        <Spin tip={state.message ?? "Loading..."} size="default" style={styles.spin}>
            <div style={styles.loadingContainer} />
        </Spin>
    </Flex>
);

const FailureView = (state: MemberDetailsErrorState) => {
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

interface PageLayoutProps {
    state: MemberDetailsUIState;
    SuccessView: (state: MemberDetailsSuccessState) => React.ReactNode;
    header: (state: MemberDetailsSuccessState) => React.ReactNode;
}

export const NewAsyncPageContentLayout = ({ state, SuccessView, header }: PageLayoutProps) => {
    let view: React.ReactNode
    if (state.type === UI_STATE_TYPE.success) {
        view = SuccessView(state as MemberDetailsSuccessState)
    }
    if (state.type === UI_STATE_TYPE.error) {
        view = FailureView(state as MemberDetailsErrorState)
    }
    if (state.type === UI_STATE_TYPE.loading) {
        view = LoadingView(state as MemberDetailsLoadingState)
    }

    return (
        <Layout style={styles.layout}>
            {
                state.type === UI_STATE_TYPE.success && header && <HeaderWrapper>
                    {header(state as MemberDetailsSuccessState)}
                </HeaderWrapper>
            }
            <Content style={styles.content}>
                {view}
            </Content>
        </Layout>
    );
};
