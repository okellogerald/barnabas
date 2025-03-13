import { Member } from "@/models";
import { MemberColumns, MemberExpandedRowView } from "@/components/member";
import { DMPTable } from "@/components/table";
import { MemberListActions } from "./types";
import { MembersTableState } from "./store.table";
import { JSX } from "react";

/**
 * Parameters for rendering the member table
 */
interface TableRenderParams {
    /** Members to display */
    members: Member[];
    /** Actions available in the UI */
    actions: MemberListActions;
    /** Current table state */
    tableState: MembersTableState;
}

/**
 * Renders the member table with all functionality
 * @param params Rendering parameters
 * @returns JSX element for the table
 */
export const renderMemberTable = (params: TableRenderParams): JSX.Element => {
    const { members, actions, tableState } = params;

    // Determine which rows are expanded
    const expandedRowKeys = tableState.member?.expanded
        ? [tableState.member.expanded.id]
        : [];

    return (
        <DMPTable
            dataSource={members}
            rowKey="id"
            expandable={{
                expandedRowKeys,
                onExpand(_, record) {
                    actions.table.expandMember(record);
                },
                expandedRowRender: (record) => <MemberExpandedRowView record={record} />,
            }}
            pagination={{
                current: tableState.pagination.currPage,
                total: tableState.pagination.totalResults,
                pageSize: tableState.pagination.resultsPerPage,
                onChange: (page) => actions.table.fetchMore(page),
            }}
            columns={[
                MemberColumns.firstName,
                MemberColumns.lastName,
                MemberColumns.age,
                MemberColumns.fellowship,
                MemberColumns.role,
                MemberColumns.envelope,
                MemberColumns.registrationDate,
                //createActionsColumn(actions),
            ]}
        />
    );
};

// /**
//  * Creates the actions column for the table
//  * @param actions The available actions
//  * @returns Column definition for actions
//  */
// const createActionsColumn = (actions: MemberListActions): ColumnType<Member> => {
//     return {
//         title: 'Actions',
//         key: 'actions',
//         width: 150,
//         render: (_, record) => (
//             <Space size="small">
//                 <Tooltip title="View Details">
//                     <Button
//                         icon={<EyeOutlined />}
//                         size="small"
//                         onClick={() => actions.member.view(record)}
//                     />
//                 </Tooltip>
//                 <Tooltip title="Edit Member">
//                     <Button
//                         icon={<EditOutlined />}
//                         size="small"
//                         onClick={() => actions.member.edit(record)}
//                     />
//                 </Tooltip>
//                 <Tooltip title="Delete Member">
//                     <Button
//                         icon={<DeleteOutlined />}
//                         size="small"
//                         danger
//                         onClick={() => actions.member.delete(record)}
//                     />
//                 </Tooltip>
//             </Space>
//         ),
//     };
// };