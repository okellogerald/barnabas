import { Fellowship } from "@/models";
import { DMPTable } from "@/components/table";
import { FellowshipsTableState } from "./store.table";
import { JSX } from "react";
import { Navigation } from "@/app";
import { FellowshipListPageActions } from "./types";
import { FellowshipColumns, FellowshipExpandedRowView } from "@/components/fellowship";

/**
 * Parameters for rendering the fellowship table
 */
interface TableRenderParams {
    /** Fellowships to display */
    fellowships: Fellowship[];
    /** Actions available in the UI */
    actions: FellowshipListPageActions;
    /** Current table state */
    tableState: FellowshipsTableState;
}

/**
 * Renders the fellowship table with all functionality
 * @param params Rendering parameters
 * @returns JSX element for the table
 */
export const renderFellowshipTable = (params: TableRenderParams): JSX.Element => {
    const { fellowships, actions, tableState } = params;

    // Determine which rows are expanded
    const expandedRowKeys = tableState.fellowship?.expanded
        ? [tableState.fellowship.expanded.id]
        : [];

    return (
        <DMPTable
            dataSource={fellowships}
            rowKey="id"
            onRow={(data) => {
                return {
                    onClick: () => Navigation.Fellowships.toDetails(data.id)
                }
            }}
            expandable={{
                expandedRowKeys,
                onExpand(_, record) {
                    actions.expandFellowship(record);
                },
                expandedRowRender: (record) => <FellowshipExpandedRowView record={record} />,
            }}
            pagination={{
                current: tableState.pagination.currPage,
                total: tableState.pagination.totalResults,
                pageSize: tableState.pagination.resultsPerPage,
                onChange: (page) => actions.fetchMore(page),
            }}
            columns={[
                FellowshipColumns.name,
                FellowshipColumns.leadershipSummary,
                FellowshipColumns.memberCount,
                FellowshipColumns.createdAt,
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
// const createActionsColumn = (actions: FellowshipListActions): ColumnType<Fellowship> => {
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
//                         onClick={() => actions.fellowship.view(record)}
//                     />
//                 </Tooltip>
//                 <Tooltip title="Edit Fellowship">
//                     <Button
//                         icon={<EditOutlined />}
//                         size="small"
//                         onClick={() => actions.fellowship.edit(record)}
//                     />
//                 </Tooltip>
//                 <Tooltip title="View Members">
//                     <Button
//                         icon={<TeamOutlined />}
//                         size="small"
//                         onClick={() => actions.fellowship.viewMembers(record)}
//                     />
//                 </Tooltip>
//                 <Tooltip title="Delete Fellowship">
//                     <Button
//                         icon={<DeleteOutlined />}
//                         size="small"
//                         danger
//                         onClick={() => actions.fellowship.delete(record)}
//                     />
//                 </Tooltip>
//             </Space>
//         ),
//     };
// };