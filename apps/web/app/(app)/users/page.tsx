'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Users, UserCheck, UserX, Wallet } from 'lucide-react';
import clsx from 'clsx';

const ROLE_BADGE: Record<string, string> = {
  ADMIN:          'bg-red-100 text-red-700',
  CANTEEN_STAFF:  'bg-orange-100 text-orange-700',
  KITCHEN_STAFF:  'bg-yellow-100 text-yellow-700',
  VENDOR:         'bg-purple-100 text-purple-700',
  STAFF:          'bg-blue-100 text-blue-700',
};

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => { api.users.list().then(setUsers).catch(() => {}); }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-in">
        <div>
          <h1 className="text-3xl font-heading text-foreground">Users</h1>
          <p className="text-muted-fg text-sm mt-1">{users.length} accounts</p>
        </div>
      </div>

      <div className="animate-in stagger-1">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full max-w-sm text-sm px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-fg" />
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden animate-in stagger-2">
        {filtered.length === 0 && (
          <div className="py-16 flex flex-col items-center gap-3 text-muted-fg">
            <Users className="w-10 h-10 opacity-25" />
            <p>No users found.</p>
          </div>
        )}
        <div className="divide-y divide-border">
          {filtered.map(u => (
            <div key={u.id} className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                {u.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{u.name}</p>
                <p className="text-xs text-muted-fg truncate">{u.email}</p>
              </div>
              <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium shrink-0', ROLE_BADGE[u.role] || 'bg-gray-100 text-gray-600')}>
                {u.role}
              </span>
              <div className="flex items-center gap-2 text-xs text-muted-fg shrink-0">
                <Wallet className="w-3.5 h-3.5" />
                ₦{Number(u.walletBalance).toLocaleString()}
              </div>
              <div className="shrink-0">
                {u.active !== false
                  ? <UserCheck className="w-4 h-4 text-emerald-500" />
                  : <UserX className="w-4 h-4 text-red-400" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
