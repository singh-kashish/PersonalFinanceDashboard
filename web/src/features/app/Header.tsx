import type { User } from "../auth/auth.types";
import { ModeToggle } from "@/components/mode-toggle";

type HeaderProps={
  id:string;
  user: User | null;
}
function Header({id, user}:HeaderProps) {
  console.log(user?.email,user?.name)
  return (
    <header className="flex justify-between items-center px-4 h-16 w-full border-b border-sidebar-border border-l bg-sidebar-fill" id={id}>
      <div className="w-full">
        <h3 className="text-3xl font-bold text-selected-nav-dark-green ">Flo</h3>
      </div>
      <div className="flex justify-end items-center w-full">
        <ModeToggle/>
        <h2 className="flex items-center justify-center bg-primary rounded-full p-3 text-sidebar-button-text font-bold uppercase h-12 w-12 mx-2">{ (user?.name?.[0]) ?? (user?.email?.[0]) ?? null }</h2>
      </div>
    </header>
  );
}
export default Header;