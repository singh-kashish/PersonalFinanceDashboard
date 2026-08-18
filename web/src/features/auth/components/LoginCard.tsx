import useLoginHook from "../hooks/useLoginHook"
import AuthCardFooter from "./AuthCardFooter";
import AuthErrorDialog from "./AuthErrorDialog";
import AuthSubmitButton from "./AuthSubmitButton";
import { loginFieldData } from "../auth.data";
import { AuthCardInput } from "./AuthCardInput";
import type { LoginFormValues } from "../schema";

type LoginCardProps={
    setShowSignup: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginCard = ({setShowSignup}:LoginCardProps) =>{
        const {submitCount,touchedFields,register,handleSubmit,onSubmit,errors,loginMutation} = useLoginHook();
        const hasFieldErrors = !!errors.email || !!errors.password;
    return (
        <>
          <AuthErrorDialog title={'We couldn’t log you in'} description="Double‑check your email and password and try again. If this keeps happening,
                reset your password from the email link." submitCount={submitCount} hasFieldErrors={hasFieldErrors} visible={loginMutation.isError}/>
          {/* Form card */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="
              rounded-[8px]
              dark:bg-[#1E293B]
              border dark:border-[#334155]
              px-5 py-6
              space-y-5
            "
          >{loginFieldData.map((field) => (
          <AuthCardInput<LoginFormValues>
            key={field.id}
            {...field}
            registerFn={register}
            touchedBoolean={!!touchedFields[field.type]}
            errorBoolean={!!errors[field.type]}
            errorMessage={errors[field.type]?.message as string | undefined}
          />
        ))}
            {/* Primary button */}
            <AuthSubmitButton beforeSubmitTitle="Login" afterSubmitTitle='Signing in…' mutationStatus={loginMutation.isPending}/>
          </form>
          <AuthCardFooter text={"Don’t have an account?"} goTo={'Create one'} setFunction={setShowSignup} setBool={true}/>
          </>
    )
}
export default LoginCard