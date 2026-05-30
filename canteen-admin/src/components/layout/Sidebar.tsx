import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  QrCode, 
  Coffee, 
  UtensilsCrossed, 
  Package, 
  Ticket, 
  Users, 
  Wallet, 
  BarChart3, 
  Settings 
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Live Orders', path: '/orders', icon: ShoppingBag },
  { name: 'QR Verification', path: '/qr', icon: QrCode },
  { name: 'Menu', path: '/menu', icon: Coffee },
  { name: 'Combos', path: '/combos', icon: UtensilsCrossed },
  { name: 'Inventory', path: '/inventory', icon: Package },
  { name: 'Offers', path: '/offers', icon: Ticket },
  { name: 'Users', path: '/users', icon: Users },
  { name: 'Wallet', path: '/wallet', icon: Wallet },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col h-full bg-slate-900 text-slate-300 w-64 flex-shrink-0", className)}>
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2 font-bold text-xl text-white">
          <UtensilsCrossed className="w-6 h-6 text-primary" />
          <span>Canteen<span className="text-primary">Admin</span></span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {SIDEBAR_ITEMS.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-slate-800 hover:text-white"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-xs text-slate-400 font-medium">Logged in as</p>
          <p className="text-sm text-white font-bold truncate">Admin User</p>
        </div>
      </div>
    </div>
  );
}
