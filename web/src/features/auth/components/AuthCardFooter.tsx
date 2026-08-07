type AuthCardFooterProps = {
    goTo:string,
    setFunction:React.Dispatch<React.SetStateAction<boolean>>,
    text: string,
    setBool: boolean,
}
const AuthCardFooter = ({goTo,setFunction,text,setBool}:AuthCardFooterProps) =>{
    return (
        <>
        {/* Footer under form */}
          <footer className="text-xs text-center space-y-1">
            <p>
              <span className="dark:text-[#94A3B8]">{text} </span>
              <span
                className="font-medium hover:opacity-95
                cursor-pointer text-[#10B981]"
                onClick={(e)=>{e.preventDefault();setFunction(setBool)}}
              >
                {goTo}
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
          </footer></>)
}
export default AuthCardFooter;