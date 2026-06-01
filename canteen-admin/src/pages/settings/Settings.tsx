import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/context/AuthContext';

function SettingField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <Input value={value} disabled />
    </div>
  );
}

function ToggleItem({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="mt-1 text-xs text-slate-500">{enabled ? 'Enabled across the admin workflow' : 'Disabled for the current site profile'}</p>
      </div>
      <span
        className={
          enabled
            ? 'inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800'
            : 'inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700'
        }
      >
        {enabled ? 'On' : 'Off'}
      </span>
    </div>
  );
}

function SystemRow({ label, value, status }: { label: string; value: string; status: 'success' | 'pending' | 'warning' | 'failed' }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-sm text-slate-500">{value}</p>
      </div>
      <StatusBadge status={status}>{status === 'success' ? 'Online' : status === 'pending' ? 'Syncing' : status === 'warning' ? 'Degraded' : 'Offline'}</StatusBadge>
    </div>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6 p-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Centralize your canteen operations with configuration, notification preferences, and system insights.
            </p>
          </div>
          <Button variant="outline">Save changes</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Update your canteen contact and availability information.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <SettingField label="Canteen Name" value="Campus Canteen Classic" />
              <SettingField label="Email" value="support@canteen.example.com" />
              <SettingField label="Contact Number" value="+1 (555) 214-9987" />
              <SettingField label="Working Hours" value="Mon–Fri, 08:00–18:00" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Settings</CardTitle>
              <CardDescription>Control order automation and verification workflows.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleItem label="Auto Accept Orders" enabled={true} />
              <ToggleItem label="QR Verification Required" enabled={false} />
              <ToggleItem label="Wallet Payments Enabled" enabled={true} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Keep the team informed with alerts and reports.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleItem label="New Order Alerts" enabled={true} />
              <ToggleItem label="Low Stock Alerts" enabled={true} />
              <ToggleItem label="Daily Reports" enabled={false} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Review service health and platform sync state.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SystemRow label="Frontend Status" value="Running" status="success" />
              <SystemRow label="Backend Status" value="Responding" status="success" />
              <SystemRow label="Database Status" value="Connected" status="success" />
              <SystemRow label="Version" value="v2.4.1" status="pending" />
              <SystemRow label="Last Sync" value="5 minutes ago" status="pending" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Current profile details and active session controls.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">User Name</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{user?.name || 'Admin User'}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">Email</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{user?.email || 'admin@canteen.example.com'}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">Role</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{user?.role || 'Administrator'}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">Last Login</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{user?.lastLogin || 'Today, 09:18 AM'}</p>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="destructive" onClick={logout}>Logout</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
