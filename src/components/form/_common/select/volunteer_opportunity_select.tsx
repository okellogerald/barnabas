import React from 'react';
import { SelectProps } from 'antd';
import { AsyncSelect } from './async_select';
import { GetOpportunitiesResponse, VolunteerManager } from '@/features/volunteer';

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
    const transformOpportunities = (results: GetOpportunitiesResponse): OpportunityOption[] => {
        return results.opportunities.map((opportunity) => ({
            label: opportunity.name,
            value: opportunity.id,
            description: opportunity.description || undefined,
        }));
    };

    return (
        <AsyncSelect<GetOpportunitiesResponse, Error, OpportunityOption, string | string[]>
            queryKey={['volunteer-opportunities']}
            fetchFn={() => VolunteerManager.instance.getOpportunities()}
            transformData={transformOpportunities}
            placeholder="Select volunteer opportunities"
            mode="multiple"
            {...props}
        />
    );
};

export default VolunteerOpportunitySelect;