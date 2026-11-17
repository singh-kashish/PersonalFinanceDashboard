import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {ThemeProvider} from 'next-themes'
import { Toaster } from '@/components/ui/sonner';
import RootLayout from './RootLayout';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useEffect } from 'react';
import { useErrorStore } from '@/features/error/useErrorStore';


const queryClient = new QueryClient({
  defaultOptions:{
    queries:{retry:1, staleTime:1000*60*60*60}},
    
  },
);

function RootComponent() {
  const bootstrapAuth = useAuthStore((s)=>s.bootstrapAuthFlow);
  useEffect(()=>{
    void bootstrapAuth()
  },[bootstrapAuth]);
  const setGlobalError = useErrorStore((s) => s.setGlobalError);
  const clearGlobalError = useErrorStore((s) => s.clearGlobalError);


  useEffect(() => {
      const updateFromNavigator = () => {
        if (!navigator.onLine) {
          setGlobalError('network-offline', 'You are offline. Check your internet connection.');
        } else {
          // Coming back online doesn't guarantee the server is reachable —
          // the next failed request (or clearServerUnreachable on success)
          // will resolve that. Only clear 'network-offline' here.
          const current = useErrorStore.getState().globalErrorType;
          if (current === 'network-offline') clearGlobalError();
        }
      };

    updateFromNavigator();
    window.addEventListener('online', updateFromNavigator);
    window.addEventListener('offline', updateFromNavigator);

    return () => {
      window.removeEventListener('online', updateFromNavigator);
      window.removeEventListener('offline', updateFromNavigator);
    };
  }, [setGlobalError, clearGlobalError]);

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
