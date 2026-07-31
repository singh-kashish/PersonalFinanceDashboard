import { Link } from "@tanstack/react-router";
interface NavLinkProps {
  to: string;
  label: string;
  active: boolean;
}

export function NavLink({ to, label, active }: NavLinkProps) {
  return (
    <Link
      to={to as any}
      className={`
        px-4 py-2 text-sm cursor-pointer
        ${active ? 'text-emerald-400' : 'text-slate-400'}
      `}
    >
      {label}
    </Link>
  );
}
