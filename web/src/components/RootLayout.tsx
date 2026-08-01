import { AuthShell } from "@/features/auth/components/AuthShell";
import { ErrorLayout } from "@/features/error/ErrorLayout";
import { Outlet } from "@tanstack/react-router";

const RootLayout= () =>{
  return (
  <main className='max-h-screen max-w-full'>
    <ErrorLayout>
      <AuthShell>
        <Outlet />
      </AuthShell>
    </ErrorLayout>
  </main>
  );
}
export default RootLayout