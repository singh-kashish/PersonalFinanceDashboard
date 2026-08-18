import { useSignupHook } from "../hooks/useSignupHook";
import AuthCardFooter from "./AuthCardFooter";
import { AuthCardInput } from "./AuthCardInput";
import AuthErrorDialog from "./AuthErrorDialog";
import AuthSubmitButton from "./AuthSubmitButton";
import { signupFieldData } from "../auth.data";
import type { SignupFormValues } from "../schema";

type SignupCardProp = {
    setShowSignup: React.Dispatch<React.SetStateAction<boolean>>;
}
const SignupCard = ({setShowSignup}:SignupCardProp) =>{
    const {submitCount,touchedFields,register,handleSubmit,onSubmit,errors,signupMutation,hasFieldErrors} = useSignupHook();
return (<>
        <AuthErrorDialog hasFieldErrors={hasFieldErrors} submitCount={submitCount} 
        title={'We couldn’t sign you up'} 
        description={'There seems to be an issue, please check errors below and if this keeps happening, reach out to us.'} visible={signupMutation.isError}
        />

          {/* Form card */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="
              rounded-[8px]
              dark:bg-[#1E293B]
              border dark:border-[#334155]
              px-5 py-6
              space-y-5">
            {signupFieldData.map((field)=><AuthCardInput<SignupFormValues> {...field}
                  registerFn={register}
                  touchedBoolean={!!touchedFields[field.id]} errorBoolean={!!errors[field.id]}
                  errorMessage={errors[field.id]?.message as string | undefined} />)}
            <AuthSubmitButton beforeSubmitTitle={'Sign up'} afterSubmitTitle='Signing up…' mutationStatus={signupMutation.isPending}/>
            <AuthCardFooter text={'Have an account?'} goTo={'Log in'} setFunction={setShowSignup} setBool={false}/>
          </form>
          </>)
}
export default SignupCard