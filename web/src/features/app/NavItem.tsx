import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

type NavItemProps = {
  icon: ReactNode;
  label: string;
  to: string;
};


const NavItem = ({ icon, label, to }: NavItemProps) => {
  const { location } = useRouterState();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className="
        flex flex-col md:flex-row
        items-center md:items-center
        justify-center md:justify-start
        w-full
        mx-1 md:mx-2
        mb-1 md:mb-2
        px-0 md:px-3
        py-2 md:py-2
        text-sm md:text-base
        cursor-pointer
        transition-colors
        text-text-small
      "
      activeProps={{
            className:
                "flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start " +
                "text-selected-nav-dark-green font-bold md:bg-green-selected-fill " + // bg only on md+
                "rounded-lg",
        }}
    >
      <div
        className={[
          "flex items-center justify-center text-lg md:text-xl rounded-lg px-3 py-2",
          isActive ? "bg-green-selected-fill text-selected-nav-dark-green font-bold" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {icon}
      </div>
      <h6
        className={[
          "mt-1 md:mt-0 md:ml-2 font-medium",
          isActive ? "text-selected-nav-dark-green font-bold" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label}
      </h6>
    </Link>
  );
};
export default NavItem;