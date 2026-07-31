import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {ThemeProvider} from 'next-themes'
import { Toaster } from '@/shared/ui/sonner';
import RootLayout from './RootLayout';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useEffect } from 'react';


const queryClient = new QueryClient();

function RootComponent() {
  const bootstrapAuth = useAuthStore((s)=>s.bootstrapAuthFlow);
  useEffect(()=>{
    void bootstrapAuth()
  },[bootstrapAuth]);
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <QueryClientProvider client={queryClient}>
    <RootLayout/>
    <Toaster richColors closeButton position="bottom-right" expand visibleToasts={4} toastOptions={{ classNames: { toast:"rounded-xl shadow-2xl border",},}} />
    </QueryClientProvider>
    </ThemeProvider>
  )
}


export default RootComponent
