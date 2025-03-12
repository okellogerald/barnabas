import { Table, TableProps } from "antd"
import React from "react"

export const DMPTable = <T extends object>({
    ...props
}: TableProps<T>): React.ReactElement => {
    return (
        <Table<T>
            bordered
            style={{ width: '100%' }}
            {...props}
        />
    );
};