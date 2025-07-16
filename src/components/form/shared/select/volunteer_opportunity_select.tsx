import React from 'react';
import { SelectProps } from 'antd';
import { AsyncSelect } from './async_select';
import { VolunteerOpportunityQueryCriteria } from '@/data/volunteer';
import { SortDirection } from '@/lib/query';
import { VolunteerOpportunity } from '@/models';
import { VolunteerManager } from '@/data/volunteer/volunteer.manager';

interface OpportunityOption {
    label: string;
    value: string;
    description?: string;
}

/**
 * A select component for choosing volunteer opportunities (interests)
 * Supports multiple selection by default
 */
export const VolunteerOpportunitySelect: React.FC<Omit<SelectProps<string | string[]>, 'options'>> = (props) => {
    const transformOpportunities = (results: VolunteerOpportunity[]): OpportunityOption[] => {
        return results.map((opportunity) => ({
            label: opportunity.name,
            value: opportunity.id,
            description: opportunity.description || undefined,
        }));
    };

    const fetchFn = async () => {
        const criteria: VolunteerOpportunityQueryCriteria = {
            sortBy: "name",
            sortDirection: SortDirection.ASC,
        }
        return await VolunteerManager.instance.getAll(criteria);
    }

    return (
        <AsyncSelect<VolunteerOpportunity[], Error, OpportunityOption, string | string[]>
            queryKey={['volunteer-opportunities']}
            fetchFn={fetchFn}
            transformData={transformOpportunities}
            placeholder="Select volunteer opportunities"
            mode="multiple"
            {...props}
        />
    );
};

export default VolunteerOpportunitySelect;