// DesktopNavItem.tsx
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type NavItemBaseProps = {
  icon: ReactNode;
  label: string;
  to: string;
};

export const DesktopNavItem = ({ icon, label, to }: NavItemBaseProps) => {
  return (
    <Link
      to={to}
      activeProps={{
        className:
          "flex flex-row items-center justify-start " +
          "text-selected-nav-dark-green font-bold " +
          "bg-green-selected-fill border-l-4 border-selected-nav-dark-green " +
          "rounded-l-lg",
      }}
      className="
        flex flex-row items-center justify-start
        w-full
        mx-2 mb-2
        px-3 py-2
        text-sm
        cursor-pointer
        transition-colors
        text-text-small
        hover:bg-green-200 dark:hover:bg-green-900 rounded-md
      "
    >
      <div className="flex items-center justify-center text-xl mr-2">
        {icon}
      </div>
      <h6 className="font-medium">{label}</h6>
    </Link>
  );
};
