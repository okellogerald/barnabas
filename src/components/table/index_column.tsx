import { ColumnType } from "antd/es/table";

export const IndexTableColumn = <T,>(props: { currentPage: number, pageSize: number }): ColumnType<T> => {
    return {
        title: '',
        key: '_index',
        width: '5%',
        render: (_: any, __: any, index: number) => <>{((index + 1) + (props.currentPage - 1) * props.pageSize)}</>
    }
};
