import { Outlet, createRootRoute } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {ThemeProvider} from 'next-themes'
import { Toaster } from '@/components/ui/sonner';

const queryClient = new QueryClient();
export const Route = createRootRoute({
  component: RootComponent,
})

export function RootComponent() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
    >
    <QueryClientProvider client={queryClient}>
    <main className='max-h-screen max-w-full'>
      <Outlet />
    </main>
    <Toaster richColors closeButton position="bottom-right" expand visibleToasts={4}
        toastOptions={{
        classNames: {
        toast:"rounded-xl shadow-2xl border",
        },
    }} />
    </QueryClientProvider>
    </ThemeProvider>
  )
}
