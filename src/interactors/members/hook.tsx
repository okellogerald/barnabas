import { useQuery } from "@tanstack/react-query";
import { MemberListPageUIState, MemberListPageUISuccessState } from "./types";
import { QueryKeys } from "../_queries/queries";
import { MemberManager } from "@/managers/member";
import { determineUIState, UI_STATE_TYPE, UIStateFactory } from "../_state";
import { Member } from "@/models";
import { MemberColumns, MemberExpandedRowView } from "@/components/member";
import { DMPTable } from "@/components/table";
import { Button, Space, Tooltip } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { ColumnType } from "antd/es/table";

type _PageActions = MemberListPageUISuccessState["actions"];

export const useMemberList = (): MemberListPageUIState => {
    const query = useQuery({
        queryKey: [QueryKeys.members.all],
        queryFn: () => MemberManager.instance.getMembers(),
    });

    const state = determineUIState<Member[], MemberListPageUIState>({
        queryResult: query,
        onLoading: () => UIStateFactory.loading(),
        onError: () => UIStateFactory.error({ retry: query.refetch }),
        onSuccess: (members) => createSuccessState({ members }),
        onPermissionError: (error) => UIStateFactory.unauthorized({ error }),
    });

    return state;
};

const createSuccessState = (props: { members: Member[] }): MemberListPageUISuccessState => {
    const { members } = props

    const actions: _PageActions = {
        refresh: () => { },
        addNew: () => { },
        member: {
            view: (member) => { },
            edit: (member) => { },
            delete: (member) => { },
        }
    }

    return {
        type: UI_STATE_TYPE.success,
        renderTable: () => renderTable({ members, actions }),
        actions: {
            refresh: () => { },
            addNew: () => { },
            member: {
                view: () => { },
                edit: () => { },
                delete: () => { },
            }
        },
    };
}

const renderTable = (props: { members: Member[], actions: _PageActions }) => {
    return <DMPTable
        dataSource={props.members}
        rowKey={(e) => e.id}
        expandable={{
            defaultExpandedRowKeys: [props.members[0].id],
            expandedRowRender: (record) => <MemberExpandedRowView record={record} />,
        }}
        columns={[
            MemberColumns.name,
            MemberColumns.role,
            MemberColumns.fellowship,
            MemberColumns.baptism,
            MemberColumns.maritalStatus,
            // createMemberColumn({ actions: props.actions }),
        ]}
    />
}

const createMemberColumn = (props: { actions: _PageActions }): ColumnType<Member> => {
    const { actions } = props;
    return {
        title: 'Actions',
        key: 'actions',
        width: 150,
        render: (_, record) => (
            <Space size="small">
                <Tooltip title="View Details">
                    <Button
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => actions.member.view(record)}
                    />
                </Tooltip>
                <Tooltip title="Edit Member">
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => actions.member.edit(record)}
                    />
                </Tooltip>
                <Tooltip title="Delete Member">
                    <Button
                        icon={<DeleteOutlined />}
                        size="small"
                        danger
                        onClick={() => actions.member.delete(record)}
                    />
                </Tooltip>
            </Space>
        ),
    }
}
