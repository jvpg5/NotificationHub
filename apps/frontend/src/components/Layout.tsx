import { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

interface LayoutProps {
  children?: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div>
      <nav>
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/simulator"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Simulator
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          History
        </NavLink>
      </nav>
      <main>{children ?? <Outlet />}</main>
    </div>
  );
}

export default Layout;