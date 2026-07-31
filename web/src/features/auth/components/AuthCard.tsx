// src/features/auth/FloLoginPage.tsx
import { useState } from 'react';
import Icon from '@/assets/Icon.svg';
import { ModeToggle } from '@/components/mode-toggle';


export function FloLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    // fake error
    setShowError(true);
  };

  return (
    <main className="min-h-screen w-full h-full flex items-start justify-center ">
        
      <section className="w-full max-w-120 px-4 py-2 flex flex-col justify-start items-end gap-y-10">
        <ModeToggle/>
        <div
          className="
            relative
            rounded-[12px]

            shadow-[0_1px_2px_rgba(15,23,42,0.3)]
            dark:shadow-[0_1px_2px_rgba(30,58,138,1.0)]
            px-8 py-10
            space-y-8
          "
        >
          {/* Logo + heading */}
          <header className="flex flex-col items-center text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-[#1E293B] flex items-center justify-center">
              <div className="h-7 w-7 rounded-md flex items-center justify-center bg-[#0F172A]">
                <img src={Icon} alt={Icon}/>
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-[20px] font-semibold tracking-tight text-[#006C49] dark:text-[#F8FAFC]">
                Flo
              </h1>
              <p className="text-sm dark:text-[#94A3B8]">
                Your money, clearly.
              </p>
            </div>
          </header>

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
            onSubmit={handleSubmit}
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
                value={email}
                onChange={e => setEmail(e.target.value)}
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
                value={password}
                onChange={e => setPassword(e.target.value)}
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
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium dark:text-[#E2E8F0]"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
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
                Must be same as password.
              </p>
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
              Continue
            </button>
          </form>

          {/* Footer under form */}
          <footer className="text-xs text-center space-y-1">
            <p>
              <span className="dark:text-[#94A3B8]">Don’t have an account? </span>
              <span
                className="font-medium hover:opacity-95
                cursor-pointer text-[#10B981]"
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
        </div>
      </section>
    </main>
  );
}
