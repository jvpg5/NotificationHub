import { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Play, Clock } from 'lucide-react';

interface LayoutProps {
  children?: ReactNode;
}

const linkBase =
  'inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors';
const linkInactive = 'text-muted-foreground hover:text-card-foreground hover:bg-muted';
const linkActive = 'bg-primary/10 text-primary';

function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-page">
      <nav className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
        <div className="mx-auto max-w-[1640px] px-8 flex items-center gap-1 h-14">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            <LayoutDashboard size={16} />
            Dashboard
          </NavLink>
          <NavLink
            to="/simulator"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            <Play size={16} />
            Simulator
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            <Clock size={16} />
            History
          </NavLink>
        </div>
      </nav>
      <main className="mx-auto max-w-[1640px] px-8 py-6">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}

export default Layout;