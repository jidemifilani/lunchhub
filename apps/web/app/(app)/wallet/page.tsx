'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Plus } from 'lucide-react';
import clsx from 'clsx';

export default function WalletPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [txns, setTxns] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [topping, setTopping] = useState(false);
  const [error, setError] = useState('');

  function load() {
    api.wallet.balance().then((b: any) => setBalance(Number(b.balance))).catch(() => {});
    api.wallet.history().then(setTxns).catch(() => {});
  }

  useEffect(load, []);

  async function topUp() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError('Enter a valid amount.'); return; }
    setTopping(true); setError('');
    try {
      await api.wallet.topUp(amt);
      setAmount('');
      load();
    } catch (e: any) { setError(e.message || 'Top-up failed.'); }
    finally { setTopping(false); }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="animate-in">
        <h1 className="text-3xl font-heading text-foreground">My Wallet</h1>
        <p className="text-muted-fg text-sm mt-1">Balance and transaction history</p>
      </div>

      {/* Balance card */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white animate-in stagger-1">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/70 mb-1">Available balance</p>
            <p className="text-4xl font-heading">
              {balance !== null ? `₦${balance.toLocaleString()}` : '—'}
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Top-up form */}
      <div className="bg-card rounded-2xl border border-border p-5 animate-in stagger-2">
        <h2 className="font-heading text-foreground mb-4">Top up wallet</h2>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-fg text-sm">₦</span>
            <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-border bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-fg" />
          </div>
          {[500, 1000, 2000, 5000].map(a => (
            <button key={a} onClick={() => setAmount(String(a))}
              className="px-3 py-2.5 bg-muted border border-border rounded-xl text-sm font-medium cursor-pointer hover:bg-border transition-colors shrink-0">
              ₦{a.toLocaleString()}
            </button>
          ))}
          <button onClick={topUp} disabled={topping}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-primary-hover transition-colors disabled:opacity-60 shrink-0">
            <Plus className="w-4 h-4" /> {topping ? '…' : 'Add'}
          </button>
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-card rounded-2xl border border-border p-5 animate-in stagger-3">
        <h2 className="font-heading text-foreground mb-4">Recent transactions</h2>
        {txns.length === 0 && <p className="text-sm text-muted-fg text-center py-6">No transactions yet.</p>}
        <div className="space-y-2">
          {txns.map(tx => {
            const isCredit = ['TOP_UP', 'REFUND', 'ADJUSTMENT'].includes(tx.type);
            return (
              <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                  isCredit ? 'bg-emerald-50' : 'bg-red-50')}>
                  {isCredit
                    ? <ArrowUpCircle className="w-4.5 h-4.5 text-emerald-600" />
                    : <ArrowDownCircle className="w-4.5 h-4.5 text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground capitalize">{tx.type.toLowerCase().replace('_', ' ')}</p>
                  {tx.note && <p className="text-xs text-muted-fg truncate">{tx.note}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className={clsx('text-sm font-semibold', isCredit ? 'text-emerald-600' : 'text-red-500')}>
                    {isCredit ? '+' : '−'}₦{Number(tx.amount).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-fg">{new Date(tx.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
