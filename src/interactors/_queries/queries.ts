import { queryClient } from "@/app";

export const QueryKeys = {
    customers: {
        all: ["customers"] as const,
        detail: (id: string) => ["customers", id] as const,
    },
    ubos: {
        all: ["ubos"] as const,
        detail: (id: string) => ["ubos", id] as const,
    },
    transactions: {
        all: ["transactions"] as const,
        detail: (id: string) => ["transactions", id] as const,
    },
    alerts: {
        all: ["alerts"] as const,
        detail: (id: string) => ["alerts", id] as const,
    },
    cases: {
        all: ["cases"] as const,
        detail: (id: string) => ["cases", id] as const,
    },
} as const;

export const InvalidationActions = {
    refreshCustomers: () => {
        queryClient.invalidateQueries({ queryKey: QueryKeys.customers.all });
    },
    refreshCustomer: (id: string) => {
        queryClient.invalidateQueries({
            queryKey: QueryKeys.customers.detail(id),
        });
    },
    refreshUBOs: () => {
        queryClient.invalidateQueries({ queryKey: QueryKeys.ubos.all });
    },
    refreshUBO: (id: string) => {
        queryClient.invalidateQueries({ queryKey: QueryKeys.ubos.detail(id) });
    },
    refreshTransactions: () => {
        queryClient.invalidateQueries({ queryKey: QueryKeys.transactions.all });
    },
    refreshTransaction: (id: string) => {
        queryClient.invalidateQueries({
            queryKey: QueryKeys.transactions.detail(id),
        });
    },
    refreshAlerts: () => {
        queryClient.invalidateQueries({ queryKey: QueryKeys.alerts.all });
    },
    refreshAlert: (id: string) => {
        queryClient.invalidateQueries({
            queryKey: QueryKeys.alerts.detail(id),
        });
    },
    refreshCases: () => {
        queryClient.invalidateQueries({ queryKey: QueryKeys.cases.all });
    },
    refreshCase: (id: string) => {
        queryClient.invalidateQueries({
            queryKey: QueryKeys.cases.detail(id),
        });
    },
    refreshAll: () => {
        queryClient.invalidateQueries({ queryKey: QueryKeys.customers.all });
        queryClient.invalidateQueries({ queryKey: QueryKeys.ubos.all });
        queryClient.invalidateQueries({ queryKey: QueryKeys.transactions.all });
        queryClient.invalidateQueries({ queryKey: QueryKeys.alerts.all });
        queryClient.invalidateQueries({ queryKey: QueryKeys.cases.all });
    },
} as const;
