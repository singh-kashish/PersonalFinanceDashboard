import type { FieldValues } from "react-hook-form";

import { type AuthCardInputProps } from "../auth.data"
export const AuthCardInput = <TFormValues extends FieldValues>({
  label,
  id,
  type,
  autoComplete,
  placeholder,
  registerFn,
  touchedBoolean,
  errorBoolean,
  errorMessage,
  helpText,
}: AuthCardInputProps<TFormValues>) => {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-medium dark:text-[#E2E8F0]"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        {...registerFn(id)}
        placeholder={placeholder}
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
      {helpText && (
        <p className="text-[11px] dark:text-[#64748B]">{helpText}</p>
      )}
      {touchedBoolean && errorBoolean && (
        <p className="text-[11px] text-rose-400">{errorMessage}</p>
      )}

        </div>)
}