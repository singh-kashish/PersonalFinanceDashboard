type AuthErrorDialogProps = {hasFieldErrors:boolean,submitCount:number,title:string,description:string,visible:boolean};
const AuthErrorDialog = ({hasFieldErrors,submitCount,title,description,visible}:AuthErrorDialogProps) =>{
    return (
        <>
        {/* Error alert   */}
          {hasFieldErrors && submitCount>0 && visible && (
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
                <span>{title}</span>
              </div>
              <p className="text-xs leading-snug text-[#FECDD3] text-wrap">
                {description}
              </p>
            </div>
          )}
          </>
    )
}
export default AuthErrorDialog;