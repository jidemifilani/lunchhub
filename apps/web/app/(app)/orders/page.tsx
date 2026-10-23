'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { ShoppingBag, Clock } from 'lucide-react';
import clsx from 'clsx';

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-orange-100 text-orange-800',
  READY:     'bg-emerald-100 text-emerald-800',
  COLLECTED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-600',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => { api.orders.list(filter || undefined).then(setOrders); }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-in">
        <div>
          <h1 className="text-3xl font-heading text-foreground">Orders</h1>
          <p className="text-muted-fg text-sm mt-1">{orders.length} orders found</p>
        </div>
        <Link href="/orders/new"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer">
          <ShoppingBag className="w-4 h-4" /> New order
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap animate-in stagger-1">
        {['', 'PENDING', 'PREPARING', 'READY', 'COLLECTED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={clsx('px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer',
              filter === s ? 'bg-primary text-white' : 'bg-card border border-border text-muted-fg hover:text-foreground')}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="space-y-3 animate-in stagger-2">
        {orders.length === 0 && (
          <div className="bg-card rounded-2xl border border-border py-16 flex flex-col items-center gap-3 text-muted-fg">
            <ShoppingBag className="w-10 h-10 opacity-25" />
            <p>No orders found.</p>
          </div>
        )}
        {orders.map(o => (
          <div key={o.id} className="bg-card rounded-2xl border border-border p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-semibold text-foreground font-mono text-sm">{o.orderNo}</span>
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_STYLES[o.status])}>
                    {o.status}
                  </span>
                  <span className="text-xs text-muted-fg">{o.type}</span>
                </div>
                <p className="text-sm text-muted-fg mt-0.5">{o.user?.name} · {o.items?.length} item(s)</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {o.items?.slice(0, 3).map((li: any) => (
                    <span key={li.id} className="text-xs bg-muted text-muted-fg px-2 py-0.5 rounded-lg">{li.item?.name}</span>
                  ))}
                  {o.items?.length > 3 && <span className="text-xs text-muted-fg">+{o.items.length - 3} more</span>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-foreground">₦{Number(o.total).toLocaleString()}</p>
                <p className="text-xs text-muted-fg flex items-center gap-1 justify-end mt-0.5">
                  <Clock className="w-3 h-3" /> {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
