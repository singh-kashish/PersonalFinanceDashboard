import type { UseFormRegister, FieldValues, FieldPath } from "react-hook-form";
import type { SignupFormValues, LoginFormValues } from "./schema";

type SignupFieldConfig = Omit<
      AuthCardInputProps<SignupFormValues>,
      "registerFn" | "touchedBoolean" | "errorBoolean" | "errorMessage"
    >;

type LoginFieldConfig = Omit<
  AuthCardInputProps<LoginFormValues>,
  "registerFn" | "touchedBoolean" | "errorBoolean" | "errorMessage"
>;

export type AuthCardInputProps<TFormValues extends FieldValues> = {
    label: string,
    registerFn: UseFormRegister<TFormValues>,
    touchedBoolean?: boolean,
    errorBoolean?: boolean,
    errorMessage?: string,
    helpText?:string,
    placeholder: string,
    autoComplete: 'email'|'set-password',
    id: FieldPath<TFormValues>,//'email'|'confirmPassword'|'password'
    type: 'email'|'password',
}

export const signupFieldData: SignupFieldConfig[] = [
    {
        id: "email",
        type: "email",
        autoComplete: "email",
        label: "Email",
        helpText: "",
        placeholder: "you@example.com",
    },
    {
        id: "password",
        type: "password",
        autoComplete: "set-password",
        label: "Password",
        helpText: "6+ characters with at least one number.",
        placeholder: "••••••••",
    },
    {
        id: "confirmPassword",
        type: "password",
        autoComplete: "set-password",
        label: "Confirm Password",
        helpText: "Must be same as password.",
        placeholder: "••••••••",
    },
];

export const loginFieldData: LoginFieldConfig[] = [
  {
    id: "email",
    type: "email",
    autoComplete: "email",
    label: "Email",
    helpText: "",
    placeholder: "you@example.com",
  },
  {
    id: "password",
    type: "password",
    autoComplete: "set-password", // or "current-password" if you want to keep that
    label: "Password",
    helpText: "8+ characters with at least one number.",
    placeholder: "••••••••",
  },
];
