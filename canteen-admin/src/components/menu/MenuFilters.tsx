import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface MenuFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
}

export function MenuFilters({ search, onSearchChange }: MenuFiltersProps) {
  return (
    <div className="flex-1 flex items-center max-w-sm relative">
      <Search className="w-4 h-4 absolute left-3 text-slate-400" />
      <Input 
        placeholder="Search menu items..." 
        className="pl-9 bg-slate-50 border-slate-200"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}
