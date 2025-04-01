import { Fellowship } from "@/models";
import { ColumnType } from "antd/es/table";
import { Tag, Typography } from "antd";
import { TeamOutlined, UserOutlined } from "@ant-design/icons";
import { dateUtils } from "@/utilities/date.utils";

/**
 * Column definitions for the fellowship table
 */
export const FellowshipColumns: Record<string, ColumnType<Fellowship>> = {
    /**
     * Fellowship name column
     */
    name: {
        title: "Name",
        dataIndex: "name",
        key: "name",
        sorter: true,
        width: 200,
        render: (_, record) => (
            <Typography.Text strong>{record.name}</Typography.Text>
        ),
    },

    /**
     * Leadership summary column
     */
    leadershipSummary: {
        title: "Leadership",
        dataIndex: "leadershipSummary",
        key: "leadershipSummary",
        width: 300,
        render: (_, record) => {
            if (!record.hasLeadership()) {
                return <Tag color="error">No leadership assigned</Tag>;
            }

            return (
                <div style={{ maxWidth: 280 }}>
                    <Typography.Paragraph ellipsis={{ rows: 2 }}>
                        {record.getLeadershipSummary()}
                    </Typography.Paragraph>
                </div>
            );
        },
    },

    /**
     * Member count column
     */
    memberCount: {
        title: "Members",
        dataIndex: "memberCount",
        key: "memberCount",
        width: 150,
        render: (_, record) => {
            if (record.memberCount === undefined) {
                return <Tag icon={<TeamOutlined />}>Unknown</Tag>;
            }

            return (
                <Tag icon={<UserOutlined />} color={record.memberCount > 0 ? "processing" : "default"}>
                    {record.getMembershipSummary()}
                </Tag>
            );
        },
    },

    /**
     * Creation date column
     */
    createdAt: {
        title: "Created",
        dataIndex: "createdAt",
        key: "createdAt",
        sorter: true,
        width: 150,
        render: (value) => dateUtils.format(value),
    },
};

/**
 * Fellowship expanded row view component
 */
export const FellowshipExpandedRowView: React.FC<{ record: Fellowship }> = ({ record }) => {
    return (
        <div style={{ padding: "8px 16px" }}>
            <Typography.Title level={5}>Fellowship Details</Typography.Title>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {record.notes && (
                    <div>
                        <Typography.Text strong>Notes: </Typography.Text>
                        <Typography.Text>{record.notes}</Typography.Text>
                    </div>
                )}

                <div>
                    <Typography.Text strong>Leadership: </Typography.Text>
                    <Typography.Text>{record.getLeadershipSummary()}</Typography.Text>
                </div>

                <div>
                    <Typography.Text strong>Member Count: </Typography.Text>
                    <Typography.Text>{record.getMembershipSummary()}</Typography.Text>
                </div>

                <div>
                    <Typography.Text strong>Created: </Typography.Text>
                    <Typography.Text>{dateUtils.format(record.createdAt)}</Typography.Text>
                </div>

                <div>
                    <Typography.Text strong>Last Updated: </Typography.Text>
                    <Typography.Text>{dateUtils.format(record.updatedAt)}</Typography.Text>
                </div>
            </div>
        </div>
    );
};