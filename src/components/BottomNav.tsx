import { Home, Image, Calendar, UserPlus } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function BottomNav() {
  const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/gallery", label: "Gallery", icon: Image },
    { to: "/events", label: "Events", icon: Calendar },
    { to: "/join-us", label: "Join Us", icon: UserPlus },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-background/95 backdrop-blur-sm shadow-2xl border-t border-border md:hidden rounded-t-2xl z-50">
      <div className="flex justify-around py-2 px-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex flex-col items-center text-xs py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? "text-primary bg-primary/10 font-medium" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`
            }
          >
            <Icon className="h-5 w-5 mb-1" />
          </NavLink>
        ))}
      </div>
    </div>
  );
}