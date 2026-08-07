import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"

type NavItemProps = {
    icon: ReactNode,
    label: string,
    to: string
}
const NavItem = ({icon,label,to}:NavItemProps) =>{

    return(
        <Link to={to} activeProps={{className:'bg-red'}}>
        <div className="flex flex-col justify-center items-start md:flex-row md:justify-start cursor-pointer text-red-800">
            <p>{icon}</p>
            <p>{label}</p>
        </div>
         </Link>
    )
}
export default NavItem;


//Desktop(light mode):
/* Link */

// box-sizing: border-box;

// /* Auto layout */
// display: flex;
// flex-direction: row;
// align-items: center;
// padding: 12px 16px;
// gap: 12px;

// width: 279px;
// height: 48px;

// background: #EFF4FF;
// border-left: 4px solid #006C49;

// /* Inside auto layout */
// flex: none;
// order: 1;
// align-self: stretch;
// flex-grow: 0;


// /* Container */

// /* Auto layout */
// display: flex;
// flex-direction: column;
// align-items: flex-start;
// padding: 0px;

// width: 18px;
// height: 18px;


// /* Inside auto layout */
// flex: none;
// order: 0;
// flex-grow: 0;


// /* Icon */

// width: 18px;
// height: 18px;

// background: #006C49;

// /* Inside auto layout */
// flex: none;
// order: 0;
// flex-grow: 0;


// /* Text */

// width: 66.92px;
// height: 24px;

// font-family: 'Geist';
// font-style: normal;
// font-weight: 400;
// font-size: 16px;
// line-height: 24px;
// /* identical to box height, or 150% */
// display: flex;
// align-items: center;

// color: #006C49;


// /* Inside auto layout */
// flex: none;
// order: 1;
// flex-grow: 0;

// Mobile(Dark Mode):
// /* Bottom Navigation Bar (Mobile Only) */

// box-sizing: border-box;

// /* Auto layout */
// display: flex;
// flex-direction: row;
// align-items: center;
// padding: 0px 36.63px;
// gap: 41.2px;

// position: absolute;
// height: 72px;
// left: 0px;
// right: 0px;
// bottom: 0px;

// background: #1E293B;
// border-top: 1px solid #334155;

// /* Inside auto layout */
// flex: none;
// order: 2;
// flex-grow: 0;
// z-index: 2;


// /* Link */

// /* Auto layout */
// display: flex;
// flex-direction: column;
// align-items: center;
// padding: 0px;
// gap: 4px;

// width: 50.91px;
// height: 37px;


// /* Inside auto layout */
// flex: none;
// order: 0;
// flex-grow: 0;


// /* Container */

// /* Auto layout */
// display: flex;
// flex-direction: column;
// align-items: flex-start;
// padding: 0px;

// width: 18px;
// height: 18px;


// /* Inside auto layout */
// flex: none;
// order: 0;
// flex-grow: 0;


// /* Icon */

// width: 18px;
// height: 18px;

// background: #94A3B8;

// /* Inside auto layout */
// flex: none;
// order: 0;
// flex-grow: 0;


// /* Container */

// /* Auto layout */
// display: flex;
// flex-direction: column;
// align-items: flex-start;
// padding: 0px;

// width: 50.91px;
// height: 15px;


// /* Inside auto layout */
// flex: none;
// order: 1;
// flex-grow: 0;


// /* Text */

// width: 50.91px;
// height: 15px;

// font-family: 'Geist';
// font-style: normal;
// font-weight: 500;
// font-size: 10px;
// line-height: 15px;
// /* identical to box height, or 150% */
// display: flex;
// align-items: center;

// color: #94A3B8;


// /* Inside auto layout */
// flex: none;
// order: 0;
// flex-grow: 0;


// /* Link */

// /* Auto layout */
// display: flex;
// flex-direction: column;
// align-items: center;
// padding: 0px;
// gap: 4px;
// isolation: isolate;

// width: 43.2px;
// height: 37px;


// /* Inside auto layout */
// flex: none;
// order: 1;
// flex-grow: 0;


// /* Container */

// /* Auto layout */
// display: flex;
// flex-direction: column;
// align-items: flex-start;
// padding: 0px;

// width: 18px;
// height: 18px;


// /* Inside auto layout */
// flex: none;
// order: 0;
// flex-grow: 0;
// z-index: 0;


// /* Icon */

// width: 18px;
// height: 18px;

// background: #10B981;

// /* Inside auto layout */
// flex: none;
// order: 0;
// flex-grow: 0;


// /* Container */

// /* Auto layout */
// display: flex;
// flex-direction: column;
// align-items: flex-start;
// padding: 0px;

// width: 43.2px;
// height: 15px;


// /* Inside auto layout */
// flex: none;
// order: 1;
// flex-grow: 0;
// z-index: 1;


// /* Text */

// width: 43.2px;
// height: 15px;

// font-family: 'Geist';
// font-style: normal;
// font-weight: 500;
// font-size: 10px;
// line-height: 15px;
// /* identical to box height, or 150% */
// display: flex;
// align-items: center;

// color: #10B981;


// /* Inside auto layout */
// flex: none;
// order: 0;
// flex-grow: 0;


// /* Background */

// position: absolute;
// width: 32px;
// height: 4px;
// left: 5.6px;
// top: -12px;

// background: #10B981;
// border-radius: 0px 0px 6px 6px;

// /* Inside auto layout */
// flex: none;
// order: 2;
// flex-grow: 0;
// z-index: 2;


// /* Link */

// /* Auto layout */
// display: flex;
// flex-direction: column;
// align-items: center;
// padding: 0px;
// gap: 4px;

// width: 59.83px;
// height: 39px;


// /* Inside auto layout */
// flex: none;
// order: 2;
// flex-grow: 0;


// /* Container */

// /* Auto layout */
// display: flex;
// flex-direction: column;
// align-items: flex-start;
// padding: 0px;

// width: 18px;
// height: 20px;


// /* Inside auto layout */
// flex: none;
// order: 0;
// flex-grow: 0;


// /* Icon */

// width: 18px;
// height: 20px;

// background: #94A3B8;

// /* Inside auto layout */
// flex: none;
// order: 0;
// flex-grow: 0;


// /* Container */

// /* Auto layout */
// display: flex;
// flex-direction: column;
// align-items: flex-start;
// padding: 0px;

// width: 59.83px;
// height: 15px;


// /* Inside auto layout */
// flex: none;
// order: 1;
// flex-grow: 0;


// /* Text */

// width: 59.83px;
// height: 15px;

// font-family: 'Geist';
// font-style: normal;
// font-weight: 500;
// font-size: 10px;
// line-height: 15px;
// /* identical to box height, or 150% */
// display: flex;
// align-items: center;

// color: #94A3B8;


// /* Inside auto layout */
// flex: none;
// order: 0;
// flex-grow: 0;


// /* Link */

// /* Auto layout */
// display: flex;
// flex-direction: column;
// align-items: center;
// padding: 0px;
// gap: 4px;

// width: 39.06px;
// height: 39px;


// /* Inside auto layout */
// flex: none;
// order: 3;
// flex-grow: 0;


// /* Container */

// /* Auto layout */
// display: flex;
// flex-direction: column;
// align-items: flex-start;
// padding: 0px;

// width: 20.1px;
// height: 20px;


// /* Inside auto layout */
// flex: none;
// order: 0;
// flex-grow: 0;


// /* Icon */

// width: 20.1px;
// height: 20px;

// background: #94A3B8;

// /* Inside auto layout */
// flex: none;
// order: 0;
// flex-grow: 0;


// /* Container */

// /* Auto layout */
// display: flex;
// flex-direction: column;
// align-items: flex-start;
// padding: 0px;

// width: 39.06px;
// height: 15px;


// /* Inside auto layout */
// flex: none;
// order: 1;
// flex-grow: 0;


// /* Text */

// width: 39.06px;
// height: 15px;

// font-family: 'Geist';
// font-style: normal;
// font-weight: 500;
// font-size: 10px;
// line-height: 15px;
// /* identical to box height, or 150% */
// display: flex;
// align-items: center;

// color: #94A3B8;


// /* Inside auto layout */
// flex: none;
// order: 0;
// flex-grow: 0;
