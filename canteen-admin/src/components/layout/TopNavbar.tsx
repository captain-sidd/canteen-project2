import React from 'react';
import { Menu, Bell, User, LogOut, Settings, Package, AlertTriangle, CircleDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useLocation, useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/api';

export function TopNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { stats, usingMocks } = useOrders();

  const { data: inventoryData } = useQuery({
    queryKey: ['inventory', 'navbar'],
    queryFn: () => inventoryApi.getAll({ page: 1, limit: 10 }),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const pathnames = location.pathname.split('/').filter((x) => x);
  const lowStockCount = inventoryData?.items.filter((item) => item.stock_quantity <= 5).length ?? 0;
  const notificationCount = stats.pending + stats.ready + lowStockCount;

  const profileName = user?.name || 'Admin User';
  const profileEmail = user?.email || 'admin@canteen.com';
  const profileRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Administrator';

  return (
    <header className="h-16 flex items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger render={
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          } />
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>

        <div className="hidden md:flex">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              {pathnames.length > 0 && <BreadcrumbSeparator />}
              {pathnames.map((value, index) => {
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;
                const title = value.charAt(0).toUpperCase() + value.slice(1);

                return (
                  <React.Fragment key={to}>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{title}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={to}>{title}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-slate-600" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-white">
                  {notificationCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Notifications</p>
                  <p className="text-xs text-slate-500">Recent operational alerts</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] uppercase tracking-[0.18em] text-slate-600">
                  {usingMocks ? 'Mock' : 'Live'}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate('/orders')}
              className="flex flex-col gap-1 px-4 py-3"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                <Package className="h-4 w-4 text-primary" />
                New Orders
              </div>
              <p className="text-xs text-slate-500">{stats.pending} pending orders waiting for action.</p>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/orders')}
              className="flex flex-col gap-1 px-4 py-3"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                <CircleDot className="h-4 w-4 text-emerald-600" />
                Ready Orders
              </div>
              <p className="text-xs text-slate-500">{stats.ready} orders ready for delivery or pickup.</p>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/inventory')}
              className="flex flex-col gap-1 px-4 py-3"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Low Stock Alerts
              </div>
              <p className="text-xs text-slate-500">
                {lowStockCount > 0 ? `${lowStockCount} items are low in stock.` : 'Inventory levels are healthy.'}
              </p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full p-0 overflow-hidden border border-slate-200 bg-slate-100">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={profileName} className="h-full w-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-slate-500" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <div className="px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={profileName} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{profileName}</p>
                  <p className="truncate text-xs text-slate-500">{profileEmail}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">{profileRole}</p>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')} className="px-4 py-3">
              <Settings className="h-4 w-4 text-slate-600" />
              <span className="ml-2 text-sm">Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="px-4 py-3">
              <Settings className="h-4 w-4 text-slate-600" />
              <span className="ml-2 text-sm">Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
              variant="destructive"
              className="px-4 py-3"
            >
              <LogOut className="h-4 w-4 text-destructive" />
              <span className="ml-2 text-sm">Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
