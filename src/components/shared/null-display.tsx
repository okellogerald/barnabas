import { Typography } from "antd";
import dayjs from "dayjs";
import { DateView } from "./date-view";

const { Text } = Typography

// Global configuration for null/empty value display
export const NULL_DISPLAY = 'N/A';

/**
 * Helper function to render cell content with null check
 */
export const renderWithNull = (value: any) => {
    if (value) {
        return <Text>{value}</Text>
    }
    return value ? <Text>{value}</Text> : <Text type="secondary">{NULL_DISPLAY}</Text>
}

/**
 * Helper function to render cell content with null check
 */
export const renderDateWithNull = (value?: Date | dayjs.Dayjs | string | null) => {
    if (!value) {
        return <Text type="secondary">{NULL_DISPLAY}</Text>
    }

    if (dayjs(value).isValid()) {
        return <DateView date={value} />
    }

    return <Text type="secondary">{NULL_DISPLAY}</Text>
}
