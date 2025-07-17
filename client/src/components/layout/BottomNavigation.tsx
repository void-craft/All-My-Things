import { Home, Search, ShoppingCart, User, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function BottomNavigation() {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: ShoppingCart, label: 'Shopping', path: '/shopping' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card-gradient border-t border-border p-2">
      <div className="flex justify-around items-center">
        {navItems.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              location.pathname === path
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
