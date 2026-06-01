import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6 p-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
            <p className="mt-1 text-sm text-slate-500">Account details and session information.</p>
          </div>
          <Button variant="outline" onClick={logout}>Logout</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="text-sm font-semibold text-slate-700">Name</div>
            <div className="mt-2 text-lg font-medium text-slate-900">{user?.name || '—'}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="text-sm font-semibold text-slate-700">Email</div>
            <div className="mt-2 text-lg font-medium text-slate-900">{user?.email || '—'}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="text-sm font-semibold text-slate-700">Phone</div>
            <div className="mt-2 text-lg font-medium text-slate-900">{user?.phone || 'Not provided'}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="text-sm font-semibold text-slate-700">Role</div>
            <div className="mt-2 text-lg font-medium text-slate-900">{user?.role || 'admin'}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 md:col-span-2">
            <div className="text-sm font-semibold text-slate-700">Last Login</div>
            <div className="mt-2 text-lg font-medium text-slate-900">{user?.lastLogin || 'Unknown'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
