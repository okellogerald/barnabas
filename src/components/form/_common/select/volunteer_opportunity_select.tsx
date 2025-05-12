import React from 'react';
import { SelectProps } from 'antd';
import { AsyncSelect } from './async_select';
import { VolunteerManager } from '@/features/volunteer';
import { VolunteerOpportunityQueryCriteria } from '@/data/volunteer';
import { SortDirection } from '@/lib/query';
import { VolunteerOpportunity } from '@/models';

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
        const opps = await VolunteerManager.instance.getAll(criteria);
        console.log("Volunteer opportunities:", opps);
        return opps;
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