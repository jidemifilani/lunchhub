'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Truck, Plus, PackageCheck } from 'lucide-react';
import clsx from 'clsx';

const STATUS_STYLES: Record<string, string> = {
  EXPECTED:  'bg-blue-100 text-blue-800',
  PARTIAL:   'bg-yellow-100 text-yellow-800',
  RECEIVED:  'bg-emerald-100 text-emerald-800',
};

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);

  useEffect(() => { api.deliveries.list().then(setDeliveries).catch(() => {}); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-in">
        <div>
          <h1 className="text-3xl font-heading text-foreground">Deliveries</h1>
          <p className="text-muted-fg text-sm mt-1">{deliveries.length} delivery records</p>
        </div>
        <Link href="/deliveries/new"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> Log delivery
        </Link>
      </div>

      <div className="space-y-3 animate-in stagger-1">
        {deliveries.length === 0 && (
          <div className="bg-card rounded-2xl border border-border py-16 flex flex-col items-center gap-3 text-muted-fg">
            <Truck className="w-10 h-10 opacity-25" />
            <p>No deliveries logged yet.</p>
          </div>
        )}
        {deliveries.map(d => (
          <div key={d.id} className="bg-card rounded-2xl border border-border p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-semibold text-foreground">{d.vendor?.name || 'Vendor'}</span>
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_STYLES[d.status] || 'bg-gray-100 text-gray-600')}>
                    {d.status}
                  </span>
                </div>
                <p className="text-sm text-muted-fg mt-0.5">{d.items?.length} line(s) · Expected {new Date(d.expectedDate).toLocaleDateString()}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {d.items?.slice(0, 4).map((li: any) => (
                    <span key={li.id} className="text-xs bg-muted text-muted-fg px-2 py-0.5 rounded-lg">
                      {li.item?.name} ({li.orderedQty})
                    </span>
                  ))}
                  {d.items?.length > 4 && <span className="text-xs text-muted-fg">+{d.items.length - 4} more</span>}
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2 mt-1">
                {d.status !== 'RECEIVED' && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600">
                    <PackageCheck className="w-3.5 h-3.5" /> Pending receipt
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
