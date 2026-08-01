import { useForm } from "react-hook-form";
import { signupSchema, type SignupFormValues } from "../schema";
import { useAuthStore } from "../store/useAuthStore";
import { zodResolver } from '@hookform/resolvers/zod';
import { signup } from "../api/auth.api";
import type { SignupLoginResponseApi } from "../auth.types";
import { useMutation } from "@tanstack/react-query";

export const useSignupHook = () =>{
    const setCredentials = useAuthStore((s)=>s.setCredentials);
    const {register,handleSubmit,formState:{errors}} = useForm<SignupFormValues>({resolver: zodResolver(signupSchema)});
    const signupMutation = useMutation({mutationFn:signup,
        onSuccess: (data:SignupLoginResponseApi) =>{
            setCredentials(data.data)
        },
    });
    const onSubmit = (values:SignupFormValues) =>{
        signupMutation.mutate(values);
    }
    const showError = !!errors.email || !!errors.password || signupMutation.isError || !!errors.confirmPassword || !!errors.form;
    return {showError,register,handleSubmit,onSubmit,errors,signupMutation};
}