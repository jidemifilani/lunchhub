'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Trash2, CheckCircle, UtensilsCrossed } from 'lucide-react';

export default function MenuManagePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [daily, setDaily] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // New item form
  const [form, setForm] = useState({ name: '', categoryId: '', price: '', calories: '', prepMins: '', description: '' });
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState('');

  function load() {
    api.menu.categories().then(c => { setCategories(c); if (!form.categoryId && c[0]) setForm(f => ({ ...f, categoryId: c[0].id })); });
    api.menu.items().then(setItems);
    const today = new Date().toISOString().split('T')[0];
    api.menu.daily(today).then((d: any) => {
      setDaily(d);
      if (d?.items) setSelectedIds(new Set(d.items.map((di: any) => di.itemId)));
    }).catch(() => {});
  }

  useEffect(load, []);

  function toggleItem(id: string) {
    setSelectedIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  async function publishMenu() {
    setSaving(true); setSaved(false);
    const today = new Date().toISOString().split('T')[0];
    try {
      await api.menu.setDaily({ date: today, itemIds: Array.from(selectedIds) });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  }

  async function addItem() {
    if (!form.name || !form.categoryId || !form.price) { setFormError('Name, category and price are required.'); return; }
    setAdding(true); setFormError('');
    try {
      await api.menu.createItem({
        name: form.name,
        categoryId: form.categoryId,
        price: parseFloat(form.price),
        calories: form.calories ? parseInt(form.calories) : undefined,
        prepMins: form.prepMins ? parseInt(form.prepMins) : undefined,
        description: form.description || undefined,
      });
      setForm(f => ({ ...f, name: '', price: '', calories: '', prepMins: '', description: '' }));
      load();
    } catch (e: any) { setFormError(e.message || 'Failed to add item.'); }
    finally { setAdding(false); }
  }

  return (
    <div className="space-y-8">
      <div className="animate-in">
        <h1 className="text-3xl font-heading text-foreground">Manage Menu</h1>
        <p className="text-muted-fg text-sm mt-1">Add items and publish today's menu</p>
      </div>

      {/* Add new item */}
      <div className="bg-card rounded-2xl border border-border p-5 animate-in stagger-1">
        <h2 className="font-heading text-foreground mb-4">Add menu item</h2>
        {formError && <p className="text-sm text-red-600 mb-3">{formError}</p>}
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Item name *"
            className="px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-fg" />
          <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
            className="px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer">
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            placeholder="Price (₦) *"
            className="px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-fg" />
          <input type="number" value={form.calories} onChange={e => setForm(f => ({ ...f, calories: e.target.value }))}
            placeholder="Calories (optional)"
            className="px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-fg" />
          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description (optional)"
            className="sm:col-span-2 px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-fg" />
        </div>
        <button onClick={addItem} disabled={adding}
          className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-primary-hover transition-colors disabled:opacity-60">
          <Plus className="w-4 h-4" /> {adding ? 'Adding…' : 'Add item'}
        </button>
      </div>

      {/* Daily menu builder */}
      <div className="bg-card rounded-2xl border border-border p-5 animate-in stagger-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-foreground">Today's menu</h2>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1 text-sm text-emerald-600">
                <CheckCircle className="w-4 h-4" /> Published
              </span>
            )}
            <button onClick={publishMenu} disabled={saving}
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-primary-hover transition-colors disabled:opacity-60">
              {saving ? 'Saving…' : 'Publish menu'}
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-fg mb-4">Check the items to include in today's menu. Uncheck to remove.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {items.map(item => {
            const on = selectedIds.has(item.id);
            return (
              <button key={item.id} onClick={() => toggleItem(item.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  on ? 'bg-primary/5 border-primary/30' : 'bg-white border-border hover:bg-muted'
                }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${on ? 'bg-primary' : 'bg-muted'}`}>
                  <UtensilsCrossed className={`w-4 h-4 ${on ? 'text-white' : 'text-muted-fg'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                  <p className={`text-xs ${on ? 'text-primary font-semibold' : 'text-muted-fg'}`}>₦{Number(item.price).toLocaleString()}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
