import { Card, Flex, Layout, Typography } from "antd"
import { PropsWithChildren } from "react"
import { Content, Header } from "antd/es/layout/layout"
import { DesignTokens } from "@/app"

export const AuthLayout: React.FC<PropsWithChildren> = (props) => {
    return (
        <Layout style={{ width: "100vw", height: "100vh" }}>
            <Header style={{ backgroundColor: "Background" }}>
                <Flex align="center" justify="center" style={{ height: "100%" }}>
                    <Typography.Text>DMP</Typography.Text>
                </Flex>
            </Header>
            <Content>
                <Flex
                    align="center"
                    justify="center"
                    style={{
                        height: "100%",
                        width: "100%",
                    }}
                >
                    <Card style={{
                        minWidth: 500,
                        padding: 30,
                        backgroundColor: "white",
                        borderRadius: 20,
                        boxShadow: DesignTokens.Elevation.LEVEL_1,
                    }}>
                        {props.children}
                    </Card>
                </Flex>
            </Content>
        </Layout>
    )
}