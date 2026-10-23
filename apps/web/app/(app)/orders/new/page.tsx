'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ShoppingBag, Trash2, CheckCircle } from 'lucide-react';

export default function NewOrderPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [cart, setCart] = useState<{ itemId: string; qty: number; item: any }[]>([]);
  const [notes, setNotes] = useState('');
  const [type, setType] = useState<'CANTEEN' | 'WALK_IN' | 'DESK'>('CANTEEN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => { api.menu.items().then(setItems); }, []);

  function add(item: any) {
    setCart(c => {
      const ex = c.find(x => x.itemId === item.id);
      if (ex) return c.map(x => x.itemId === item.id ? { ...x, qty: x.qty + 1 } : x);
      return [...c, { itemId: item.id, qty: 1, item }];
    });
  }

  function remove(itemId: string) {
    setCart(c => c.filter(x => x.itemId !== itemId));
  }

  function changeQty(itemId: string, delta: number) {
    setCart(c => c.map(x => x.itemId === itemId ? { ...x, qty: Math.max(1, x.qty + delta) } : x));
  }

  const subtotal = cart.reduce((s, x) => s + Number(x.item.price) * x.qty, 0);

  async function place() {
    if (!cart.length) { setError('Add at least one item.'); return; }
    setLoading(true); setError('');
    try {
      await api.orders.create({ type, notes, items: cart.map(x => ({ itemId: x.itemId, qty: x.qty })) });
      setDone(true);
    } catch (e: any) { setError(e.message || 'Order failed.'); }
    finally { setLoading(false); }
  }

  if (done) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 animate-in">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-emerald-600" />
      </div>
      <h2 className="text-2xl font-heading text-foreground">Order placed!</h2>
      <p className="text-muted-fg">Your order is in the kitchen queue.</p>
      <div className="flex gap-3 mt-2">
        <button onClick={() => { setCart([]); setDone(false); }} className="px-5 py-2.5 bg-card border border-border rounded-xl text-sm font-medium cursor-pointer hover:bg-muted transition-colors">Order more</button>
        <button onClick={() => router.push('/orders')} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-primary-hover transition-colors">My orders</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div className="animate-in">
        <h1 className="text-3xl font-heading text-foreground">Order Lunch</h1>
        <p className="text-muted-fg text-sm mt-1">Pick from today's menu</p>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      <div className="grid md:grid-cols-5 gap-6">
        {/* Menu picker */}
        <div className="md:col-span-3 animate-in stagger-1">
          <h2 className="font-semibold text-foreground mb-3">Available items</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-primary font-semibold">₦{Number(item.price).toLocaleString()}</p>
                </div>
                <button onClick={() => add(item)}
                  className="w-7 h-7 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary-hover transition-colors cursor-pointer text-lg font-bold shrink-0">+</button>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="md:col-span-2 animate-in stagger-2">
          <h2 className="font-semibold text-foreground mb-3">Your order</h2>
          <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="py-8 flex flex-col items-center gap-2 text-muted-fg">
                <ShoppingBag className="w-8 h-8 opacity-30" />
                <p className="text-sm">Nothing added yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map(x => (
                  <div key={x.itemId} className="flex items-center gap-2 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground truncate">{x.item.name}</p>
                      <p className="text-xs text-muted-fg">₦{(Number(x.item.price) * x.qty).toLocaleString()}</p>
                    </div>
                    <button onClick={() => changeQty(x.itemId, -1)} className="w-6 h-6 rounded bg-muted hover:bg-border cursor-pointer text-center font-bold">−</button>
                    <span className="w-4 text-center font-semibold">{x.qty}</span>
                    <button onClick={() => changeQty(x.itemId, 1)} className="w-6 h-6 rounded bg-muted hover:bg-border cursor-pointer text-center font-bold">+</button>
                    <button onClick={() => remove(x.itemId)} className="text-red-400 hover:text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-border pt-3 space-y-3">
              <div className="flex justify-between text-sm font-semibold">
                <span>Total</span>
                <span className="text-primary">₦{subtotal.toLocaleString()}</span>
              </div>

              <select value={type} onChange={e => setType(e.target.value as any)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer">
                <option value="CANTEEN">Collect at canteen</option>
                <option value="WALK_IN">Walk-in / dine-in</option>
                <option value="DESK">Deliver to desk</option>
              </select>

              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                placeholder="Any notes for the kitchen?"
                className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-white text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-fg" />

              <button onClick={place} disabled={loading || !cart.length}
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-60">
                {loading ? 'Placing…' : 'Place order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
