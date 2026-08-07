import { useForm } from "react-hook-form";
import { signupSchema, type SignupFormValues } from "../schema";
import { useAuthStore } from "../store/useAuthStore";
import { zodResolver } from '@hookform/resolvers/zod';
import { signup } from "../api/auth.api";
import type { SignupLoginResponseApi } from "../auth.types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSignupHook = () =>{
    const setCredentials = useAuthStore((s)=>s.setCredentials);
    const {register,handleSubmit,formState:{ errors, touchedFields, isSubmitted, submitCount },} = useForm<SignupFormValues>({resolver: zodResolver(signupSchema),mode:"onChange"});

    const signupMutation = useMutation({mutationFn:signup,
        onSuccess: (data:SignupLoginResponseApi) =>{
            setCredentials(data.data)
            toast.success('Signup up successfully!');
        },
    });
    const onSubmit = (values:SignupFormValues) =>{
        signupMutation.mutate(values);
    }
    const hasFieldErrors = !!errors.email || !!errors.password || !!errors.confirmPassword;
    return {register,handleSubmit,onSubmit,errors,signupMutation,touchedFields,isSubmitted,submitCount,hasFieldErrors};
}