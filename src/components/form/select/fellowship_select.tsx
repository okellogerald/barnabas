import React from 'react';
import { SelectProps } from 'antd';
import { AsyncSelect } from './async_select';
import { Fellowship } from '@/models/fellowship';
import { FellowshipManager } from '@/managers/fellowship';

interface FellowshipOption {
    label: string;
    value: string;
    details: string | null; // Optional details like chairman name
}

/**
 * A select component for choosing a fellowship.
 * This component fetches fellowship data using react-query and transforms it into select options.
 */
export const FellowshipSelect: React.FC<Omit<SelectProps<string>, 'options'>> = (props) => {
    /**
     * Transforms fellowship data into an array of FellowshipOption objects.
     *
     * @param data An array of Fellowship objects.
     * @returns An array of FellowshipOption objects.
     */
    const transformFellowships = (data: Fellowship[]): FellowshipOption[] => {
        return data.map((fellowship) => {
            let details = '';
            if (fellowship.chairman) {
                details = `(Chairman: ${fellowship.chairman.firstName} ${fellowship.chairman.lastName})`;
            }

            return {
                label: fellowship.name + (details ? ` ${details}` : ''),
                value: fellowship.id,
                details: fellowship.notes,
            };
        });
    };

    return (
        <AsyncSelect<Fellowship[]>
            queryKey={['fellowships']}
            fetchFn={() => FellowshipManager.instance.getFellowships()} // Use resolved data
            placeholder="Select a fellowship"
            transformData={transformFellowships}
            {...props}
        />
    );
};

export default FellowshipSelect;