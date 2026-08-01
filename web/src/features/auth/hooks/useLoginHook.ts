import { loginSchema, type LoginFormValues } from "../schema";
import { useAuthStore } from "../store/useAuthStore";
import {useForm} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import { login } from "../api/auth.api";
import { useMutation } from "@tanstack/react-query";
import type { SignupLoginResponseApi } from "../auth.types";

const useLoginHook = () =>{
    const setCredentials = useAuthStore((s) => s.setCredentials);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data:SignupLoginResponseApi) => {
      setCredentials({
        user: data.data.user,
        accessToken: data.data.accessToken,
      });
      // navigate to '/dashboard'
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const showError = !!errors.email || !!errors.password || loginMutation.isError;

  return {register,handleSubmit, loginMutation,onSubmit, showError, errors};
}

export default useLoginHook