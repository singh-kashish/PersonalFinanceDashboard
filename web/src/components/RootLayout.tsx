import { AppShell } from "@/features/app/AppShell";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { ErrorLayout } from "@/features/error/ErrorLayout";

const RootLayout= () =>{
  return (
  <main className='max-h-screen max-w-full'>
    <ErrorLayout>
      <AuthShell>
        <AppShell/>
      </AuthShell>
    </ErrorLayout>
  </main>
  );
}
export default RootLayout