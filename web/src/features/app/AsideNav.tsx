// AsideNav.tsx
import NavItem from "./NavItem";
import DashboardIcon from './components/DashboardIcon'
import AnalyticsIcon from "./components/AnalyticsIcon";
import TransactionsIcon from "./components/TransactionsIcon";
import SettingsIcon from "./components/SettingsIcon";
import Icon from '@/assets/Icon.svg';

interface AsideNavProps {
  id:string;
}
const NavItemDetails = [
  {icon: <DashboardIcon/>,label: "Dashboard",to: "/dashboard"}
    ,{icon: <AnalyticsIcon/>,label: "Analytics",to: '/analytics'},
    {icon: <TransactionsIcon/>,label: "Transactions",to: '/transactions'},
    {icon: <SettingsIcon/>,label: "Settings",to: '/settings'},

];

export function AsideNav({ id }: AsideNavProps) {
  return (
    <aside
      id={id}
      className="flex flex-row md:flex-col h-full md:w-1/4 w-full"
    >
      {/* Logo area */}
      <div className="hidden md:flex items-center gap-2 md:mb-4">
        <img src={Icon} alt="Flo logo" className="w-14" />
        <div className="flex flex-col justify-start items-start">
          <h3 className="text-4xl font-bold text-selected-nav-dark-green">Flo</h3>
          <h6 className="text-lg text-text-small">Personal Finance</h6>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-row md:flex-col gap-2 md:mt-2 ml-4 md:ml-0 text-text-small">
        {NavItemDetails.map((n) => (
          <NavItem
            icon={n.icon}
            label={n.label}
            to={n.to}
            key={n.label}
          />
        ))}
      </nav>
    </aside>
  );
}


