import React, { JSX } from 'react';
import { Select, SelectProps } from 'antd';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';

interface BaseOption {
    label: string;
    value: string | number;
}

interface AsyncSelectProps<
    TData,
    TError = Error,
    TOption extends BaseOption = BaseOption
> extends Omit<SelectProps<string | number>, 'options'> {
    /**
     * Query key for React Query cache
     */
    queryKey: string[];

    /**
     * Function to fetch data from API
     */
    fetchFn: () => Promise<TData>;

    /**
     * Function to transform API response into select options
     */
    transformData: (data: TData) => TOption[];

    /**
     * Default options to show before search
     */
    defaultOptions?: TOption[];

    /**
     * Custom query options for React Query
     */
    queryOptions?: Omit<
        UseQueryOptions<TData, TError, TData>,
        'queryKey' | 'queryFn'
    >;
}

export const AsyncSelect = <
    TData,
    TError = Error,
    TOption extends BaseOption = BaseOption
>({
    queryKey,
    fetchFn,
    transformData,
    defaultOptions = [],
    queryOptions = {},
    placeholder = 'Search...',
    ...props
}: AsyncSelectProps<TData, TError, TOption>): JSX.Element => {
    const { data, isLoading } = useQuery({
        queryKey,
        queryFn: fetchFn,
        ...queryOptions,
    });

    const options = data ? transformData(data) : defaultOptions;

    return (
        <Select<string | number>
            showSearch
            allowClear
            loading={isLoading}
            options={options}
            placeholder={placeholder}
            {...props}
        />
    );
};

// Example usage with Nationalities
interface Nationality {
    id: number;
    name: string;
    code: string;
}

interface NationalityOption extends BaseOption {
    code: string;
}

export const NationalitySelect: React.FC<Omit<SelectProps<string | number>, 'options'>> = (props) => {
    const fetchNationalities = async (): Promise<Nationality[]> => {
        const response = await fetch('/api/nationalities');
        if (!response.ok) {
            throw new Error('Failed to fetch nationalities');
        }
        return response.json();
    };

    const transformNationalities = (data: Nationality[]): NationalityOption[] => {
        return data.map((nationality) => ({
            label: nationality.name,
            value: nationality.id,
            code: nationality.code,
        }));
    };

    return (
        <AsyncSelect<Nationality[], Error, NationalityOption>
            queryKey={['nationalities']}
            fetchFn={fetchNationalities}
            transformData={transformNationalities}
            defaultOptions={[
                { label: 'United States', value: 1, code: 'US' },
                { label: 'United Kingdom', value: 2, code: 'GB' },
            ]}
            {...props}
        />
    );
};

// Example with Companies
interface Company {
    id: string;
    name: string;
    registrationNumber: string;
}

export const CompanySelect: React.FC<Omit<SelectProps<string | number>, 'options'>> = (props) => {
    const fetchCompanies = async (): Promise<Company[]> => {
        const response = await fetch('/api/companies');
        if (!response.ok) {
            throw new Error('Failed to fetch companies');
        }
        return response.json();
    };

    const transformCompanies = (data: Company[]): BaseOption[] => {
        return data.map((company) => ({
            label: `${company.name} (${company.registrationNumber})`,
            value: company.id,
        }));
    };

    return (
        <AsyncSelect<Company[]>
            queryKey={['companies']}
            fetchFn={fetchCompanies}
            transformData={transformCompanies}
            placeholder="Search companies..."
            {...props}
        />
    );
};