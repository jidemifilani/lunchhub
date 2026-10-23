'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Plus, Trash2, CheckCircle } from 'lucide-react';

export default function NewDeliveryPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [vendorId, setVendorId] = useState('');
  const [expectedDate, setExpectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [lines, setLines] = useState([{ itemId: '', orderedQty: 1 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.deliveries.vendors().then((v: any[]) => { setVendors(v); if (v[0]) setVendorId(v[0].id); }).catch(() => {});
    api.menu.items().then(setItems);
  }, []);

  function addLine() { setLines(l => [...l, { itemId: '', orderedQty: 1 }]); }
  function removeLine(i: number) { setLines(l => l.filter((_, j) => j !== i)); }
  function updateLine(i: number, field: string, val: any) {
    setLines(l => l.map((ln, j) => j === i ? { ...ln, [field]: val } : ln));
  }

  async function submit() {
    if (!vendorId) { setError('Select a vendor.'); return; }
    if (lines.some(l => !l.itemId)) { setError('Select an item for every line.'); return; }
    setLoading(true); setError('');
    try {
      await api.deliveries.create({ vendorId, expectedDate, items: lines });
      setDone(true);
    } catch (e: any) { setError(e.message || 'Failed to log delivery.'); }
    finally { setLoading(false); }
  }

  if (done) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 animate-in">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-emerald-600" />
      </div>
      <h2 className="text-2xl font-heading text-foreground">Delivery logged!</h2>
      <button onClick={() => router.push('/deliveries')}
        className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-primary-hover transition-colors">
        View all deliveries
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div className="animate-in">
        <h1 className="text-3xl font-heading text-foreground">Log Delivery</h1>
        <p className="text-muted-fg text-sm mt-1">Record incoming stock from a vendor</p>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      <div className="bg-card rounded-2xl border border-border p-5 space-y-4 animate-in stagger-1">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Vendor</label>
            <select value={vendorId} onChange={e => setVendorId(e.target.value)}
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer">
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Expected date</label>
            <input type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)}
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Items ordered</label>
            <button onClick={addLine} className="flex items-center gap-1 text-xs text-primary cursor-pointer hover:underline">
              <Plus className="w-3.5 h-3.5" /> Add line
            </button>
          </div>
          <div className="space-y-2">
            {lines.map((ln, i) => (
              <div key={i} className="flex items-center gap-2">
                <select value={ln.itemId} onChange={e => updateLine(i, 'itemId', e.target.value)}
                  className="flex-1 text-sm px-3 py-2 rounded-lg border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer">
                  <option value="">Select item…</option>
                  {items.map(it => <option key={it.id} value={it.id}>{it.name}</option>)}
                </select>
                <input type="number" min="1" value={ln.orderedQty} onChange={e => updateLine(i, 'orderedQty', parseInt(e.target.value))}
                  className="w-20 text-sm px-3 py-2 rounded-lg border border-border bg-white text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/30" />
                {lines.length > 1 && (
                  <button onClick={() => removeLine(i)} className="text-red-400 hover:text-red-600 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button onClick={submit} disabled={loading}
          className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm cursor-pointer hover:bg-primary-hover transition-colors disabled:opacity-60">
          {loading ? 'Saving…' : 'Log delivery'}
        </button>
      </div>
    </div>
  );
}
