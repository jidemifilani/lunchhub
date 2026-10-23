'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { ShoppingBag, Flame, Zap } from 'lucide-react';
import clsx from 'clsx';

export default function MenuPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [active, setActive] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});

  useEffect(() => {
    api.menu.categories().then(c => { setCategories(c); if (c[0]) setActive(c[0].id); });
    api.menu.items().then(setItems);
  }, []);

  const filtered = active ? items.filter(i => i.categoryId === active) : items;
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  function add(id: string) { setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 })); }
  function remove(id: string) { setCart(c => { const n = { ...c }; if (n[id] > 1) n[id]--; else delete n[id]; return n; }); }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-in">
        <div>
          <h1 className="text-3xl font-heading text-foreground">Menu</h1>
          <p className="text-muted-fg text-sm mt-1">Today's available dishes</p>
        </div>
        {cartCount > 0 && (
          <Link href={{ pathname: '/orders/new', query: { cart: JSON.stringify(cart) } }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-hover transition-colors cursor-pointer">
            <ShoppingBag className="w-4 h-4" />
            Order {cartCount} item{cartCount > 1 ? 's' : ''}
          </Link>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 animate-in stagger-1">
        <button onClick={() => setActive('')}
          className={clsx('px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer',
            active === '' ? 'bg-primary text-white' : 'bg-card border border-border text-muted-fg hover:text-foreground')}>
          All
        </button>
        {categories.map(c => (
          <button key={c.id} onClick={() => setActive(c.id)}
            className={clsx('px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer',
              active === c.id ? 'bg-primary text-white' : 'bg-card border border-border text-muted-fg hover:text-foreground')}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Item grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in stagger-2">
        {filtered.map(item => (
          <div key={item.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-36 bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-primary/40" strokeWidth={1} />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-foreground leading-tight">{item.name}</h3>
                <span className="text-primary font-bold text-sm shrink-0">₦{Number(item.price).toLocaleString()}</span>
              </div>
              {item.description && <p className="text-xs text-muted-fg mb-3 line-clamp-2">{item.description}</p>}
              <div className="flex items-center gap-3 mb-3">
                {item.calories && (
                  <span className="flex items-center gap-1 text-xs text-muted-fg">
                    <Flame className="w-3 h-3" /> {item.calories} cal
                  </span>
                )}
                {item.prepMins && (
                  <span className="flex items-center gap-1 text-xs text-muted-fg">
                    <Zap className="w-3 h-3" /> {item.prepMins} min
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {cart[item.id] ? (
                  <>
                    <button onClick={() => remove(item.id)}
                      className="w-8 h-8 rounded-lg bg-muted hover:bg-border text-foreground font-semibold transition-colors cursor-pointer">−</button>
                    <span className="text-sm font-semibold text-foreground w-4 text-center">{cart[item.id]}</span>
                    <button onClick={() => add(item.id)}
                      className="w-8 h-8 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover transition-colors cursor-pointer">+</button>
                  </>
                ) : (
                  <button onClick={() => add(item.id)}
                    className="w-full py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer">
                    Add to order
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
