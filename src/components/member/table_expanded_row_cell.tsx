import { Member } from "@/models"
import { Card, Flex, Badge, Typography } from "antd"

const { Text } = Typography

export const MemberExpandedRowView: React.FC<{ record: Member }> = ({ record }) => {
    return <Card variant={"outlined"} size="small" style={{ background: '#f7f7f7' }}>
        <Flex gap="large">
            <div>
                <Text type="secondary">Contact Info:</Text>
                <div>{record.phoneNumber || 'No phone'}</div>
                <div>{record.email || 'No email'}</div>
            </div>
            <div>
                <Text type="secondary">Residence:</Text>
                <div>{record.residenceArea || 'Not specified'}</div>
            </div>
            <div>
                <Text type="secondary">Membership Status:</Text>
                <div>
                    Baptized: <Badge status={record.isBaptized ? "success" : "default"} text={record.isBaptized ? "Yes" : "No"} />
                </div>
                <div>
                    Confirmed: <Badge status={record.isConfirmed ? "success" : "default"} text={record.isConfirmed ? "Yes" : "No"} />
                </div>
            </div>
            <div>
                <Text type="secondary">Fellowship Attendance:</Text>
                <div>
                    <Badge status={record.attendsFellowship ? "success" : "error"}
                        text={record.attendsFellowship ? "Attends regularly" : "Does not attend"} />
                </div>
            </div>
        </Flex>
    </Card>
}