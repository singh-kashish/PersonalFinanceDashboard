import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "../../auth/auth.types";
import {useAuthStore} from '../../auth/store/useAuthStore'

type ProfileProps = {
  user: User | null;
};

export function ProfileIcon({ user }: ProfileProps) {
  const navigate = useNavigate();

  const initial =
    user?.name?.[0]?.toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    "?";
    const logout = useAuthStore((s)=>s.logout)
  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          // override built-in size/shape
          variant="default"
          className="h-12 w-12 rounded-full p-0 flex items-center justify-center bg-primary text-sidebar-button-text font-bold uppercase cursor-pointer"
        >
          {initial}
          <span className="sr-only">Profile &amp; Settings</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
          Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}





