// AppShell.tsx
import Header from './Header';
import './app.css'
import { useAuthStore } from '../auth/store/useAuthStore';
import Main from './Main';
import { AsideNav } from './AsideNav';

export function AppShell() {
  const {user} = useAuthStore()
  return (
    <div className="grid min-h-screen w-full" id="app-shell">
      <Header id="header" user={user}/>
      <Main id="main"/>
      <AsideNav id="sidebar"/>
    </div>
  );
}




