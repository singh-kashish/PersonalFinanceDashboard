import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"

type NavItemProps = {
    icon: ReactNode,
    label: string,
    to: string,
}

const NavItem = ({icon,label,to}:NavItemProps) =>{

    return(
        <Link to={to} activeProps={{className:'text-selected-nav-dark-green'}} className="cursor-pointer flex-col justify-start items-start md:flex md:flex-row md:justify-start md:items-center">
            <div>{icon}</div>
            <h6 className="font-medium text-sm">{label}</h6>
        </Link>
    )
}
export default NavItem;