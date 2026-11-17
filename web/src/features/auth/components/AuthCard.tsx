// src/features/auth/FloLoginPage.tsx
import Icon from '@/assets/Icon.svg';
import { ModeToggle } from '@/components/mode-toggle';
import { useState } from 'react';
import LoginCard from './LoginCard';
import SignupCard from './SignupCard';

export function FloLoginPage() {
  const [showSignup, setShowSignup] = useState<boolean>(false);

  return (
    <main className="min-h-screen w-full flex flex-col">
      {/* Top bar with toggle aligned right */}
      <header className="w-full px-4 pt-4 pb-2 flex justify-end">
        <ModeToggle />
      </header>

      {/* Centered content area */}
      <section className="flex-1 w-full flex items-center justify-center px-4 pb-8">
        <div
          className="
            w-full
            max-w-md
            rounded-[12px]
            shadow-[0_1px_2px_rgba(15,23,42,0.3)]
            dark:shadow-[0_1px_2px_rgba(30,58,138,1.0)]
            px-8 py-10
            space-y-8
          "
        >
          {/* Logo + heading */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-[#1E293B] flex items-center justify-center">
              <div className="h-7 w-7 rounded-md flex items-center justify-center bg-[#0F172A]">
                <img src={Icon} alt="Flo logo" />
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
          </div>

          {showSignup ? (
            <SignupCard setShowSignup={setShowSignup} />
          ) : (
            <LoginCard setShowSignup={setShowSignup} />
          )}
        </div>
      </section>
    </main>
  );
}
