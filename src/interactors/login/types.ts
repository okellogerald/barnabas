import { FormInstance } from "antd";

export interface LogInPageState {
    loading: boolean;
    error?: string;
    form: FormInstance;
    onFinish: () => void;
    removeError: () => void;
}
