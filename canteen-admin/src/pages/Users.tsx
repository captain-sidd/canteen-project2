import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { DataTable } from '@/components/ui/DataTable';
import { usersApi, parseApiError } from '@/api';
import type { UserInterface } from '@/types/user';
import { toast } from 'sonner';

export default function Users() {
  const { data: users, isLoading, isError } = useQuery<UserInterface[]>({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
    retry: 1,
  });

  useEffect(() => {
    if (isError) {
      toast.error('Unable to load users', { description: parseApiError(new Error('Could not fetch users')) });
    }
  }, [isError]);

  const columns = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Role', accessorKey: 'role' },
    { header: 'Balance', accessorKey: 'walletBalance', cell: (row: UserInterface) => `₹${row.walletBalance.toFixed(2)}` },
    { header: 'Status', accessorKey: 'isActive', cell: (row: UserInterface) => (row.isActive ? 'Active' : 'Inactive') },
    { header: 'Joined', accessorKey: 'createdAt', cell: (row: UserInterface) => new Date(row.createdAt).toLocaleDateString() },
  ];

  return (
    <PageContainer>
      <SectionHeader
        title="Users"
        description="Browse users and wallet balances fetched from the backend."
      />

      <div className="bg-white rounded-xl border p-5 shadow-sm">
        {isLoading ? (
          <div className="py-20 text-center text-slate-500">Loading users…</div>
        ) : (
          <DataTable columns={columns} data={users ?? []} searchPlaceholder="Search users..." />
        )}
        {isError && !isLoading && (
          <div className="mt-4 text-sm text-red-600">Failed to load users. Please try again.</div>
        )}
      </div>
    </PageContainer>
  );
}
