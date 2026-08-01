import useLoginHook from "../hooks/useLoginHook"

type LoginCardProps={
    setShowSignup: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginCard = ({setShowSignup}:LoginCardProps) =>{
    
    const {register,handleSubmit, loginMutation,onSubmit, showError,errors} = useLoginHook();
    return (
        <>
        {/* Error alert   */}
          {showError && (
            <div
              className="
                rounded-lg
                border
                px-4 py-3
                flex flex-col gap-1
                border-[#881337] bg-[#4C0519]
                text-wrap
              "
            >
              <div className="flex items-center gap-2 text-sm font-medium text-[#FB7185]">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#FB7185] text-[11px]">
                  !
                </span>
                <span>We couldn’t log you in</span>
              </div>
              <p className="text-xs leading-snug text-[#FECDD3] text-wrap">
                Double‑check your email and password and try again. If this keeps happening,
                reset your password from the email link.
              </p>
            </div>
          )}

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
          >
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-medium dark:text-[#E2E8F0]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                // onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="
                  block w-full rounded-[8px]
                  px-3 py-2 text-sm
                  dark:bg-[#0F172A]
                  border border-[#334155]
                  dark:text-[#F8FAFC]
                  dark:placeholder:text-[#64748B]
                  focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-[#10B981]
                  focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]
                "
              />
              {errors.email && (
                <p className="text-[11px] text-rose-400">{errors.email.message}</p>
              )}

            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-medium dark:text-[#E2E8F0]"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                placeholder="••••••••"
                className="
                  block w-full rounded-[8px]
                  px-3 py-2 text-sm
                  dark:bg-[#0F172A]
                  border border-[#334155]
                  dark:text-[#F8FAFC]
                  dark:placeholder:text-[#64748B]
                  focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-[#10B981]
                  focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]
                "
              />
              <p className="text-[11px] dark:text-[#64748B]">
                8+ characters with at least one number.
              </p>
              {errors.password && (
                <p className="text-[11px] text-rose-400">{errors.password.message}</p>
              )}
            </div>

            {/* Primary button */}
            <button
              type="submit"
              className="
                mt-2 w-full rounded-[8px]
                px-3 py-2 text-sm font-medium
                bg-[#10B981]
                text-[#00422B]
                flex items-center justify-center
                hover:opacity-95
                cursor-pointer
                transition-colors
                focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-[#10B981]
                focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]
              "
            >
              {loginMutation.isPending ? 'Signing in…' : 'Continue'}
            </button>
          </form>

          {/* Footer under form */}
          <footer className="text-xs text-center space-y-1">
            <p>
              <span className="dark:text-[#94A3B8]">Don’t have an account? </span>
              <span
                className="font-medium hover:opacity-95
                cursor-pointer text-[#10B981]"
                onClick={(e)=>{e.preventDefault();setShowSignup(true)}}
              >
                Create one
              </span>
            </p>
            <p className="text-[11px] text-[#64748B]">
              By continuing you agree to Flo’s&nbsp;
              <span
                className="underline underline-offset-2 text-[#10B981]"
              >
                Terms
              </span>
              &nbsp;and&nbsp;
              <span
                className="underline underline-offset-2 text-[#10B981]"
              >
                Privacy Policy
              </span>
              .
            </p>
          </footer>
          </>
    )
}
export default LoginCard