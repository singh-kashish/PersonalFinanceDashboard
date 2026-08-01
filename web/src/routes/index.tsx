import { createFileRoute } from '@tanstack/react-router';
import { FloLoginPage } from '@/features/auth/components/AuthCard';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="min-h-screen h-dvh w-full flex items-center justify-center bg-background">
        <FloLoginPage/>
    </main>
  );
}
