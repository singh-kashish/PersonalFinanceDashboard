import { createRootRoute } from '@tanstack/react-router'
import ErrorBoundary from '@/shared/components/layout/ErrorBoundary';
import { SquareSpin } from '@/components/ui/square-spin';
import RootComponent from '@/components/RootComponent';
import NotFound from '@/features/app/NotFound';

export const Route = createRootRoute({
  component: RootComponent,
  
  errorComponent: ({error})=>(
    <ErrorBoundary>
      <div className="p-4 text-red-500">
        Something went wrong: {String(error)}
      </div>
      </ErrorBoundary>
  ),
  pendingComponent: () =>(
    <div className="flex min-h-screen items-center justify-center">
      <SquareSpin size="xl" className='bg-emerald-700!' />
    </div>
  ),
  notFoundComponent: () =>{
    <NotFound/>
  }
})




