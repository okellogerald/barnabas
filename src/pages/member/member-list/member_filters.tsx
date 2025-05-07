import React, { useState, useEffect } from "react";
import { Button, Card, Checkbox, Col, Input, Row, Select, Space, Divider } from "antd";
import { FilterOutlined, CloseOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/interactors/_queries";
import { FellowshipManager } from "@/features/fellowship";
import { canApplyFilters, useMemberList } from "@/interactors/member-list";
import { isSuccessState, UI_STATE_TYPE } from "@/interactors/_state";

/**
 * Member list filter component
 */
export const MemberFilters: React.FC<{
    onApplyFilters: () => void;
}> = ({ onApplyFilters }) => {
    const state = useMemberList();
    if(!isSuccessState(state)) return null;

    const filters = state.table.filters;

    // Local state to avoid immediate filtering
    const [localFilters, setLocalFilters] = useState({
        firstName: filters.firstName || '',
        lastName: filters.lastName || '',
        fellowshipId: filters.fellowshipId,
        isBaptized: filters.isBaptized,
        attendsFellowship: filters.attendsFellowship
    });

    // Check for fellowship ID in sessionStorage (from navigation)
    useEffect(() => {
        const storedFellowshipId = sessionStorage.getItem('memberList_fellowshipId');
        
        if (storedFellowshipId && (!filters.fellowshipId || filters.fellowshipId !== storedFellowshipId)) {
            // Update local filters with the stored fellowship ID
            setLocalFilters(prev => ({
                ...prev,
                fellowshipId: storedFellowshipId
            }));
            
            // Apply the filter automatically
            state.actions.table.applyFilters({
                ...filters,
                fellowshipId: storedFellowshipId
            });
            
            // Clear sessionStorage so it only applies once
            sessionStorage.removeItem('memberList_fellowshipId');
            
            // Trigger filter callback
            onApplyFilters();
        }
    }, [filters, state.actions.table, onApplyFilters]);

    // Fetch fellowships for dropdown
    const fellowshipsQuery = useQuery({
        queryKey: [QueryKeys.fellowships.all],
        queryFn: () => FellowshipManager.instance.getAll(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const fellowships = fellowshipsQuery.data || [];

    // Apply all filters at once
    const handleApplyFilters = () => {
        state.actions.table.applyFilters(localFilters);
        if (canApplyFilters(localFilters)) onApplyFilters();
    };

    // Clear all filters
    const handleClearFilters = () => {
        setLocalFilters({
            firstName: '',
            lastName: '',
            fellowshipId: undefined,
            isBaptized: undefined,
            attendsFellowship: undefined
        });
        state.actions.table.clearFilters();
        onApplyFilters();
    };

    return (
        <Card
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><FilterOutlined /> Filter Members</span>
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        size="small"
                        onClick={() => state.actions.table.toggleFiltersVisible()}
                    />
                </div>
            }
            size="small"
            style={{ marginBottom: 16 }}
        >
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12} lg={8}>
                    <div>
                        <div style={{ marginBottom: 8 }}>
                            <label>First Name</label>
                        </div>
                        <Input
                            placeholder="Enter first name..."
                            value={localFilters.firstName}
                            onChange={(e) => setLocalFilters({ ...localFilters, firstName: e.target.value })}
                            allowClear
                        />
                    </div>
                </Col>

                <Col xs={24} md={12} lg={8}>
                    <div>
                        <div style={{ marginBottom: 8 }}>
                            <label>Last Name</label>
                        </div>
                        <Input
                            placeholder="Enter last name..."
                            value={localFilters.lastName}
                            onChange={(e) => setLocalFilters({ ...localFilters, lastName: e.target.value })}
                            allowClear
                        />
                    </div>
                </Col>

                <Col xs={24} md={12} lg={8}>
                    <div>
                        <div style={{ marginBottom: 8 }}>
                            <label>Fellowship</label>
                        </div>
                        <Select
                            placeholder="Select Fellowship"
                            allowClear
                            style={{ width: "100%" }}
                            loading={fellowshipsQuery.isLoading}
                            value={localFilters.fellowshipId}
                            onChange={(value) => setLocalFilters({ ...localFilters, fellowshipId: value })}
                            options={fellowships.map((f) => ({
                                label: f.name,
                                value: f.id,
                            }))}
                        />
                    </div>
                </Col>

                <Col xs={24}>
                    <Space direction="horizontal" size="large">
                        <Checkbox
                            checked={localFilters.isBaptized === 1}
                            onChange={(e) => setLocalFilters({ ...localFilters, isBaptized: e.target.checked ? 1 : 0 })}
                        >
                            Baptized Members
                        </Checkbox>

                        <Checkbox
                            checked={localFilters.attendsFellowship === 1}
                            onChange={(e) => setLocalFilters({ ...localFilters, attendsFellowship: e.target.checked ? 1 : 0 })}
                        >
                            Attends Fellowship
                        </Checkbox>
                    </Space>
                </Col>

                <Col xs={24}>
                    <Divider style={{ margin: '8px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Space>
                            <Button
                                onClick={handleClearFilters}
                            >
                                Clear All
                            </Button>

                            <Button
                                type="primary"
                                onClick={handleApplyFilters}
                                disabled={!canApplyFilters(localFilters)}
                            >
                                Apply Filters
                            </Button>
                        </Space>
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

/**
 * Filter toggle button
 */
export const FilterToggle: React.FC = () => {
    const state = useMemberList();
    if (state.type !== UI_STATE_TYPE.success) return null;

    const filters = state.table.filters;

    return (
        <Button
            type={filters.filtersApplied ? "primary" : "default"}
            icon={<FilterOutlined />}
            onClick={() => state.actions.table.toggleFiltersVisible()}
        >
            Filters
        </Button>
    );
};