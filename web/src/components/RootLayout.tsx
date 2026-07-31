import { AuthShell } from "@/features/auth/components/AuthShell";
import { Outlet } from "@tanstack/react-router";

const RootLayout= () =>{
  return (
  <main className='max-h-screen max-w-full'>
    <AuthShell>
      <Outlet />
    </AuthShell>
  </main>
  );
}
export default RootLayout