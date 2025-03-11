import { LoginRequest, loginRequestSchema } from "@/data/auth";
import { AuthManager } from "@/managers/auth";
import { useMutation } from "@tanstack/react-query";
import { Form } from "antd";
import { LogInPageState } from "./types";
import { Navigation } from "@/app";

const handleSubmit = async (values: LoginRequest) => {
    const result = loginRequestSchema.safeParse(values);
    if (!result.success) {
        console.log(result.error)
        throw new Error("Please make sure you have entered a valid email and password");
    }
    console.log(result.data);
    const success = await AuthManager.instance.login(values);
    if (success) {
        Navigation.toDashboard();
    } else {
        throw new Error("Invalid email or password");
    }
};

export const UseLogin = (): LogInPageState => {
    const [form] = Form.useForm<LoginRequest>();

    const onFinish = () => {
        mutation.mutate(form.getFieldsValue());
    };

    const reset = () => {
        mutation.reset();
    }

    const mutation = useMutation({
        mutationKey: ["login"],
        mutationFn: handleSubmit,
    });

    return {
        form,
        loading: mutation.isPending,
        error: mutation.error?.message,
        onFinish,
        removeError: reset,
    };
};
