'use client';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { ChefHat, Clock, CheckCircle, UtensilsCrossed } from 'lucide-react';
import clsx from 'clsx';

const COLUMNS = [
  { status: 'QUEUED',    label: 'Queued',    color: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-800' },
  { status: 'PREPARING', label: 'Preparing', color: 'bg-orange-50 border-orange-200', badge: 'bg-orange-100 text-orange-800' },
  { status: 'DONE',      label: 'Done',      color: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-100 text-emerald-800' },
];

export default function KitchenPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    api.kitchen.queue().then(setTickets).catch(() => {});
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, [load]);

  async function advance(id: string, action: 'start' | 'done' | 'serve') {
    setLoading(true);
    try {
      if (action === 'start') await api.kitchen.start(id);
      else if (action === 'done') await api.kitchen.done(id);
      else await api.kitchen.serve(id);
      load();
    } finally { setLoading(false); }
  }

  const byStatus = (s: string) => tickets.filter(t => t.status === s);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-in">
        <div>
          <h1 className="text-3xl font-heading text-foreground">Kitchen Display</h1>
          <p className="text-muted-fg text-sm mt-1">{tickets.length} active ticket{tickets.length !== 1 ? 's' : ''} · refreshes every 15s</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium cursor-pointer hover:bg-muted transition-colors">
          <Clock className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {COLUMNS.map(col => (
          <div key={col.status} className={clsx('rounded-2xl border-2 p-4 space-y-3 animate-in stagger-1', col.color)}>
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-foreground text-lg">{col.label}</h2>
              <span className={clsx('text-xs px-2 py-0.5 rounded-full font-semibold', col.badge)}>
                {byStatus(col.status).length}
              </span>
            </div>

            {byStatus(col.status).length === 0 && (
              <div className="py-8 flex flex-col items-center gap-2 text-muted-fg opacity-60">
                <ChefHat className="w-8 h-8" strokeWidth={1} />
                <p className="text-xs">Empty</p>
              </div>
            )}

            {byStatus(col.status).map(ticket => (
              <div key={ticket.id} className="bg-white rounded-xl border border-white/80 p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-foreground">{ticket.order?.orderNo}</span>
                  <span className="text-xs text-muted-fg flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {ticket.order?.notes && (
                  <p className="text-xs bg-yellow-50 border border-yellow-200 rounded-lg px-2 py-1.5 text-yellow-800">
                    {ticket.order.notes}
                  </p>
                )}

                <div className="space-y-1">
                  {ticket.order?.items?.map((li: any) => (
                    <div key={li.id} className="flex items-center gap-2 text-sm">
                      <UtensilsCrossed className="w-3.5 h-3.5 text-muted-fg shrink-0" />
                      <span className="text-foreground">{li.qty}× {li.item?.name}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-1">
                  {col.status === 'QUEUED' && (
                    <button onClick={() => advance(ticket.id, 'start')} disabled={loading}
                      className="w-full py-2 bg-orange-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-orange-600 transition-colors disabled:opacity-60">
                      Start preparing
                    </button>
                  )}
                  {col.status === 'PREPARING' && (
                    <button onClick={() => advance(ticket.id, 'done')} disabled={loading}
                      className="w-full py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-emerald-600 transition-colors disabled:opacity-60">
                      Mark done
                    </button>
                  )}
                  {col.status === 'DONE' && (
                    <button onClick={() => advance(ticket.id, 'serve')} disabled={loading}
                      className="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Served
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
