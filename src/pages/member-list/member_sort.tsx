// sorting_component.tsx
import React from "react";
import { Button, Dropdown, Space, Tooltip } from "antd";
import { DownOutlined, SortAscendingOutlined, SortDescendingOutlined } from "@ant-design/icons";
import { MenuProps } from "antd";
import { memberFilterStore } from "@/interactors/member-list";
import { refreshMembers } from "@/interactors/member-list/service";

// Define available sorting fields
export interface SortOption {
    label: string;
    value: string;
}

const sortOptions: SortOption[] = [
    { label: "First Name", value: "firstName" },
    { label: "Last Name", value: "lastName" },
    { label: "Membership Number", value: "envelopeNumber" },
    { label: "Date Added", value: "createdAt" },
    { label: "Date of Birth", value: "dateOfBirth" },
];

/**
 * Component for controlling the sorting of member list
 */
export const MemberSorting: React.FC = () => {
    const filterState = memberFilterStore.getState();

    // Determine current sort field and direction
    const currentSortField = filterState.orderBy || filterState.orderByDesc || "firstName";
    const currentSortDirection = filterState.orderBy ? "asc" : "desc";

    // Find the current sort option label
    const currentSortOption = sortOptions.find(option => option.value === currentSortField);

    const handleSortChange = (field: string) => {
        // Keep the same direction, just change the field
        if (currentSortDirection === "asc") {
            filterState.setSorting(field, "asc");
        } else {
            filterState.setSorting(field, "desc");
        }

        // Refresh data with new sort
        refreshMembers();
    };

    const toggleSortDirection = () => {
        // Toggle direction for current field
        const newDirection = currentSortDirection === "asc" ? "desc" : "asc";
        filterState.setSorting(currentSortField, newDirection);

        // Refresh data with new sort
        refreshMembers();
    };

    // Create menu items for dropdown
    const items: MenuProps["items"] = sortOptions.map(option => ({
        key: option.value,
        label: option.label,
        onClick: () => handleSortChange(option.value),
    }));

    return (
        <Space style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#8c8c8c' }}>Sort by:</span>
            <Dropdown menu={{ items }} placement="bottomRight">
                <Button style={{ minWidth: '130px' }}>
                    <Space>
                        {currentSortOption?.label || "First Name"}
                        <DownOutlined />
                    </Space>
                </Button>
            </Dropdown>

            <Tooltip title={`Switch to ${currentSortDirection === "asc" ? "descending" : "ascending"} order`}>
                <Button
                    icon={currentSortDirection === "asc" ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                    onClick={toggleSortDirection}
                />
            </Tooltip>
        </Space>
    );
};