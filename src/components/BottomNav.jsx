import { NavLink } from 'react-router-dom';
import { LayoutGrid, Repeat, User } from 'lucide-react';

const items = [
  { to: '/album', label: 'Álbum', Icon: LayoutGrid },
  { to: '/grupo', label: 'Grupo', Icon: Repeat },
  { to: '/perfil', label: 'Perfil', Icon: User },
];

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 border-t border-white/10 bg-brand-nav/95 backdrop-blur">
      <div className="mx-auto flex max-w-app">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition ${
                isActive ? 'text-brand-accent' : 'text-white/55'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={23} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
