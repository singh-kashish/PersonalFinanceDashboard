import type { Section } from "./AppShell";
import NavItem from "./NavItem";
import { NavLink } from "./NavLink";
interface AsideNavProps {
  activeSection: Section;
}

export function AsideNav({ activeSection }: AsideNavProps) {
  return (
    // <aside className="hidden md:flex md:w-56 border-r border-slate-800 flex-col py-4">
    //   <NavLink to="/" label="Dashboard" active={activeSection === 'dashboard'} />
    //   <NavLink to="/analytics" label="Analytics" active={activeSection === 'analytics'} />
    //   <NavLink to="/transactions" label="Transactions" active={activeSection === 'transactions'} />
    //   <NavLink to="/settings" label="Settings" active={activeSection === 'settings'} />
    // </aside>
    <>
    <NavItem to='/dashboard' icon='<h1>ddd</h1>' label='test'></NavItem>
    <NavItem to='/' icon='<h1>ddd</h1>' label='test'></NavItem>
    </>
  );
}

