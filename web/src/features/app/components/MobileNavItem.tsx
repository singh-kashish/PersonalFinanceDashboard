// MobileNavItem.tsx
import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

type NavItemBaseProps = {
  icon: ReactNode;
  label: string;
  to: string;
};

export const MobileNavItem = ({ icon, label, to }: NavItemBaseProps) => {
  const { location } = useRouterState();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className="
        flex flex-col items-center justify-center
        flex-1
        px-1 py-2
        text-xs
        cursor-pointer
        transition-colors
        text-text-small
         hover:bg-green-200 dark:hover:bg-green-900 rounded-md
      "
      activeProps={{
        className:
          "flex flex-col items-center justify-center flex-1 px-1 py-2 text-xs " +
          "text-selected-nav-dark-green font-bold",
      }}
    >
      <div
        className={[
          "nav-link-icon flex items-center justify-center text-xl rounded-lg px-3 py-2 border-t-2",
          isActive ? "bg-green-selected-fill border-selected-nav-dark-green" : "border-transparent",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {icon}
      </div>
      <span className="mt-1">{label}</span>
    </Link>
  );
};
