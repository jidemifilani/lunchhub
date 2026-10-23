'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CalendarDays, Flame, Save } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'];
const MEAL_LABELS: Record<string, string> = { BREAKFAST: 'Breakfast', LUNCH: 'Lunch', SNACK: 'Snack', DINNER: 'Dinner' };

function getMonday(d: Date) {
  const dt = new Date(d);
  const day = dt.getDay();
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
  dt.setDate(diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function addDays(d: Date, n: number) {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt;
}

export default function PlannerPage() {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [items, setItems] = useState<any[]>([]);
  const [plan, setPlan] = useState<Record<string, Record<string, string>>>({});
  const [nutrition, setNutrition] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.menu.items().then(setItems); }, []);

  useEffect(() => {
    const ws = weekStart.toISOString().split('T')[0];
    api.planner.get(ws).then((p: any) => {
      if (!p) return;
      const m: Record<string, Record<string, string>> = {};
      p.items?.forEach((pi: any) => {
        const day = new Date(pi.date).toISOString().split('T')[0];
        if (!m[day]) m[day] = {};
        m[day][pi.mealType] = pi.itemId;
      });
      setPlan(m);
      setNutrition(p.nutrition);
    }).catch(() => {});
  }, [weekStart]);

  function setCellItem(day: string, mealType: string, itemId: string) {
    setPlan(p => ({ ...p, [day]: { ...p[day], [mealType]: itemId } }));
  }

  async function save() {
    setSaving(true);
    const ws = weekStart.toISOString().split('T')[0];
    const planItems: any[] = [];
    Object.entries(plan).forEach(([date, meals]) => {
      Object.entries(meals).forEach(([mealType, itemId]) => {
        if (itemId) planItems.push({ date, mealType, itemId });
      });
    });
    try {
      const result = await api.planner.upsert({ weekStart: ws, items: planItems });
      setNutrition(result.nutrition);
    } finally { setSaving(false); }
  }

  const weekDays = DAYS.map((_, i) => addDays(weekStart, i));
  const totalCal = nutrition?.totalCalories;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-in">
        <div>
          <h1 className="text-3xl font-heading text-foreground">Meal Planner</h1>
          <p className="text-muted-fg text-sm mt-1">Plan your week, track nutrition</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekStart(d => addDays(d, -7))} className="px-3 py-2 bg-card border border-border rounded-xl text-sm cursor-pointer hover:bg-muted transition-colors">←</button>
          <span className="text-sm font-medium text-foreground px-2">
            {weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – {addDays(weekStart, 4).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <button onClick={() => setWeekStart(d => addDays(d, 7))} className="px-3 py-2 bg-card border border-border rounded-xl text-sm cursor-pointer hover:bg-muted transition-colors">→</button>
        </div>
      </div>

      {totalCal && (
        <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border animate-in stagger-1">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-xl font-semibold text-foreground">{totalCal.toLocaleString()} kcal</p>
            <p className="text-xs text-muted-fg">Estimated weekly total</p>
          </div>
        </div>
      )}

      <div className="animate-in stagger-2 overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-2">
          <thead>
            <tr>
              <th className="w-24 text-left text-xs font-semibold text-muted-fg px-2 pb-2">Meal</th>
              {weekDays.map((d, i) => (
                <th key={i} className="text-center text-xs font-semibold text-foreground pb-2">
                  <div>{DAYS[i]}</div>
                  <div className="text-muted-fg font-normal">{d.getDate()}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEAL_TYPES.map(mt => (
              <tr key={mt}>
                <td className="text-xs font-medium text-muted-fg px-2 align-top pt-2">{MEAL_LABELS[mt]}</td>
                {weekDays.map((d, i) => {
                  const dateKey = d.toISOString().split('T')[0];
                  const val = plan[dateKey]?.[mt] || '';
                  return (
                    <td key={i} className="align-top">
                      <select value={val} onChange={e => setCellItem(dateKey, mt, e.target.value)}
                        className="w-full text-xs px-2 py-1.5 rounded-lg border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer">
                        <option value="">—</option>
                        {items.map(item => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end animate-in stagger-3">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium text-sm cursor-pointer hover:bg-primary-hover transition-colors disabled:opacity-60">
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save plan'}
        </button>
      </div>
    </div>
  );
}
