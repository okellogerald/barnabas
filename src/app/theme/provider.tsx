import { ConfigProvider, ThemeConfig } from 'antd';
import { DesignTokens, ThemeColors } from './constants';

export default function ThemeProvider({ children }: { children: React.ReactNode; }) {
    return <ConfigProvider theme={themeConfig} >
        {children}
    </ConfigProvider>
}

const themeConfig: ThemeConfig = {
    token: {
        fontFamily: "Avenir",
        colorPrimary: ThemeColors.Primary.DEFAULT,
        colorError: ThemeColors.Status.ERROR,
        colorTextBase: ThemeColors.Text.PRIMARY,
        colorTextLabel: ThemeColors.Text.SECONDARY,
        colorTextPlaceholder: ThemeColors.Text.TERTIARY,
        colorTextDisabled: ThemeColors.Text.DISABLED,
        colorIcon: ThemeColors.UI.DISABLED,
        colorBorder: ThemeColors.UI.DIVIDER,
        borderRadius: DesignTokens.Radius.DEFAULT,
        fontWeightStrong: 500,
    },
    components: {
        Button: {
            primaryShadow: "none",
            fontWeight: "400",
        },
    }
}
