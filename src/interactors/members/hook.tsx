import { useQuery } from "@tanstack/react-query";
import { MemberListPageUIState, MemberListPageUISuccessState } from "./types";
import { QueryKeys } from "../_queries/queries";
import { determineUIState, UI_STATE_TYPE, UIStateFactory } from "../_state";
import { Member } from "@/models";
import { MemberColumns, MemberExpandedRowView } from "@/components/member";
import { DMPTable } from "@/components/table";
import { fetchInitialMembers, MEMBERS_RESULTS_PER_PAGE } from "./service";

type _PageActions = MemberListPageUISuccessState["actions"];

type _MembersResult = Awaited<ReturnType<typeof fetchInitialMembers>>

export const useMemberList = (): MemberListPageUIState => {
    const query = useQuery({
        queryKey: [QueryKeys.members.all],
        queryFn: () => fetchInitialMembers({}),
    });

    const state = determineUIState<_MembersResult, MemberListPageUIState>({
        queryResult: query,
        onLoading: () => UIStateFactory.loading(),
        onError: () => UIStateFactory.error({ retry: query.refetch }),
        onSuccess: (result) => createSuccessState(result),
        onPermissionError: (error) => UIStateFactory.unauthorized({ error }),
    });

    return state;
};

const createSuccessState = (props: _MembersResult): MemberListPageUISuccessState => {
    const { members } = props

    const actions: _PageActions = {
        refresh: () => { },
        addNew: () => { },
        member: {
            view: () => { },
            edit: () => { },
            delete: () => { },
        }
    }

    // const fetchMore = async (page: number) => {
    //     const cond1 = page <= pagination.currPage
    //     const cond2 = (page * pagination.resultsPerPage) <= payouts.length
    //     if (cond1 || cond2) {
    //         setCurrPage(page)
    //         return
    //     }
    //     NiceModal.show(LOADING_DATA_DIALOG)
    //     const results = await fetchMorePayouts({
    //         pending: false,
    //         currPage: pagination.currPage,
    //         nextPage: page,
    //         total: pagination.totalResults,
    //     })
    //     addToPayouts(results, page)
    //     NiceModal.remove(LOADING_DATA_DIALOG)
    // }

    return {
        type: UI_STATE_TYPE.success,
        pagination: {
            currentPage: 1,
            pageSize: MEMBERS_RESULTS_PER_PAGE,
            total: members.length,
            onChange: (_) => { },
        },
        renderTable: () => renderTable({ members, actions }),
        actions: actions,
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
        pagination={{
            current: 1,
            pageSize: MEMBERS_RESULTS_PER_PAGE,
            total: props.members.length,
            onChange: (_) => { },
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

// const createMemberColumn = (props: { actions: _PageActions }): ColumnType<Member> => {
//     const { actions } = props;
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
//     }
// }
