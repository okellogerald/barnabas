import { useQuery } from "@tanstack/react-query";
import { DashboardPageState, DashboardPageSuccessState } from "./types";
import { fetchDashboardData } from "./service";
import { determineUIState, UI_STATE_TYPE, UIStateFactory } from "../_state";

type DashboardData = Awaited<ReturnType<typeof fetchDashboardData>>;

export const useDashboard = (): DashboardPageState => {
    const query = useQuery({
        queryKey: ["dashboard"],
        queryFn: () => fetchDashboardData(),
    })

    const createSuccessState = (data: DashboardData): DashboardPageSuccessState => {
        return {
            type: UI_STATE_TYPE.success,
            church: data.church,
            totalFellowships: data.fellowships?.length ?? null,
            totalMembers: data.members?.members?.length ?? null,
        }
    }

    const state = determineUIState<DashboardData, DashboardPageState>({
        queryResult: query,
        onLoading: () => UIStateFactory.loading(),
        onError: () => UIStateFactory.error({ retry: query.refetch }),
        onSuccess: createSuccessState,
    });

    return state;
}