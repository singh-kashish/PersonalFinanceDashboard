import type { User } from "../auth/auth.types";
import { ModeToggle } from "@/components/mode-toggle";
import { ProfileIcon } from "./components/ProfileIcon";

type HeaderProps={
  id:string;
  user: User | null;
}
function Header({id, user}:HeaderProps) {
  return (
    <header className="flex justify-between items-center px-4 h-16 w-full border-b border-sidebar-border border-l bg-sidebar-fill" id={id}>
      <div className="w-full">
        <h3 className="text-3xl font-bold text-selected-nav-dark-green ">Flo</h3>
      </div>
      <div className="flex justify-end items-center w-full  gap-3">
        <ModeToggle/>
        <ProfileIcon user={user}/>
      </div>
    </header>
  );
}
export default Header;