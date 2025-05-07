import React from 'react';
import { SelectProps } from 'antd';
import { VolunteerOpportunity } from '@/models';
import { VolunteerOpportunityManager } from '@/features/volunteer';
import { AsyncSelect } from './async_select';

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
    const transformOpportunities = (data: VolunteerOpportunity[]): OpportunityOption[] => {
        return data.map((opportunity) => ({
            label: opportunity.name,
            value: opportunity.id,
            description: opportunity.description || undefined,
        }));
    };

    return (
        <AsyncSelect<VolunteerOpportunity[], Error, OpportunityOption, string | string[]>
            queryKey={['volunteer-opportunities']}
            fetchFn={() => VolunteerOpportunityManager.instance.getOpportunities()}
            transformData={transformOpportunities}
            placeholder="Select volunteer opportunities"
            mode="multiple"
            {...props}
        />
    );
};

export default VolunteerOpportunitySelect;