import { Home, Search, ShoppingCart, User, Bell, Store } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function BottomNavigation() {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: ShoppingCart, label: "Shopping", path: "/shopping" },
    { icon: Store, label: "Stores", path: "/stores" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 border-t border-border p-3 shadow-2xl mt-[20px] pt-[12px]">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center p-2 rounded-2xl transition-all duration-300 ${
              location.pathname === path
                ? "text-white bg-white/20 scale-110"
                : "text-white/70 hover:text-white hover:scale-105"
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
