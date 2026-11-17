// AsideNav.tsx
import { DesktopNavItem } from "./components/DesktopNavItem";
import { MobileNavItem } from "./components/MobileNavItem";
import DashboardIcon from "./components/DashboardIcon";
import AnalyticsIcon from "./components/AnalyticsIcon";
import TransactionsIcon from "./components/TransactionsIcon";
import SettingsIcon from "./components/SettingsIcon";
import Icon from "@/assets/Icon.svg";

interface AsideNavProps {
  id: string;
}

const NavItemDetails = [
  { icon: <DashboardIcon />, label: "Dashboard", to: "/dashboard" },
  { icon: <AnalyticsIcon />, label: "Analytics", to: "/analytics" },
  { icon: <TransactionsIcon />, label: "Transactions", to: "/transactions" },
  { icon: <SettingsIcon />, label: "Settings", to: "/settings" },
];

export function AsideNav({ id }: AsideNavProps) {
  return (
    <aside
      id={id}
      className="flex flex-col h-full w-full border-r border-sidebar-border pt-2 md:pt-6"
    >
      {/* Logo area - desktop only */}
      <div className="hidden md:flex items-center gap-2 mb-4 pl-6 pb-4">
        <img src={Icon} alt="Flo logo" className="w-14" />
        <div className="flex flex-col justify-start items-start">
          <h3 className="text-4xl font-bold text-selected-nav-dark-green">Flo</h3>
          <h6 className="text-md text-text-small">Personal Finance</h6>
        </div>
      </div>

      {/* Mobile nav: bottom bar, equal width items */}
      <nav className="mt-auto md:hidden flex flex-row justify-between items-stretch gap-1 px-1 py-1 border-t">
        {NavItemDetails.map((n) => (
          <MobileNavItem key={n.label} {...n} />
        ))}
      </nav>

      {/* Desktop nav: vertical list */}
      <nav className="hidden md:flex flex-col justify-start items-stretch gap-1 px-2 mr-2">
        {NavItemDetails.map((n) => (
          <DesktopNavItem key={n.label} {...n} />
        ))}
      </nav>
    </aside>
  );
}
