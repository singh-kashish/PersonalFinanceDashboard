type AuthSubmitButtonProps = {
    mutationStatus: boolean,
    beforeSubmitTitle: string,
    afterSubmitTitle: string,
}

function AuthSubmitButton({mutationStatus,beforeSubmitTitle,afterSubmitTitle}:AuthSubmitButtonProps){
    return (<>
        <button
              type="submit"
              disabled={mutationStatus}
              className={`
                mt-2 w-full rounded-[8px]
                px-3 py-2 text-sm font-medium
                bg-[#10B981]
                text-[#00422B]
                flex items-center justify-center
                ${
                  mutationStatus
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:opacity-95 cursor-pointer'
                }
                transition-colors
                focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-[#10B981]
                focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]
              `}
            >
              {mutationStatus ? afterSubmitTitle : beforeSubmitTitle}
            </button>
    </>)
}
export default AuthSubmitButton;