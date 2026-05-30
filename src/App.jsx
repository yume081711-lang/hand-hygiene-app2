import React, { useMemo, useState } from 'react';
import { Settings, Trash2 } from 'lucide-react';

export default function HandHygieneApp() {
  const defaultWards = ['外来', '3階病棟', '4階病棟', '5階病棟', '6階病棟'];
  const defaultProfessions = ['看護師', 'ナースアシスタント', 'リハビリテーション科', '医師', 'コメディカル'];
  const moments = ['① 患者に触れる前', '② 清潔・無菌操作前', '③ 体液曝露リスク後', '④ 患者に触れた後', '⑤ 患者周辺に触れた後'];

  const [wards, setWards] = useState(() => {
    const saved = localStorage.getItem('handHygieneWards');
    return saved ? JSON.parse(saved) : defaultWards;
  });
  const [professions, setProfessions] = useState(() => {
    const saved = localStorage.getItem('handHygieneProfessions');
    return saved ? JSON.parse(saved) : defaultProfessions;
  });
  const [ward, setWard] = useState(wards[0]);
  const [profession, setProfession] = useState(professions[0]);
  const [observationDate, setObservationDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('handHygieneRecords');
    return saved ? JSON.parse(saved) : [];
  });
  const [newWard, setNewWard] = useState('');
  const [newProfession, setNewProfession] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const saveRecords = (updated) => {
    setRecords(updated);
    localStorage.setItem('handHygieneRecords', JSON.stringify(updated));
  };

  const saveRecord = (moment, action) => {
    saveRecords([
      {
        id: Date.now() + Math.random(),
        ward,
        profession,
        observationDate,
        moment,
        action,
        performed: action !== 'none',
      },
      ...records,
    ]);
  };

  const resetRecords = () => saveRecords([]);

  const deleteRecord = (id) => {
    saveRecords(records.filter((r) => r.id !== id));
  };

  const addWard = () => {
    const value = newWard.trim();
    if (!value) return;
    const updated = [...wards, value];
    setWards(updated);
    setWard(value);
    localStorage.setItem('handHygieneWards', JSON.stringify(updated));
    setNewWard('');
  };

  const addProfession = () => {
    const value = newProfession.trim();
    if (!value) return;
    const updated = [...professions, value];
    setProfessions(updated);
    setProfession(value);
    localStorage.setItem('handHygieneProfessions', JSON.stringify(updated));
    setNewProfession('');
  };

  const total = records.length;
  const compliant = records.filter((r) => r.performed).length;
  const complianceRate = total ? ((compliant / total) * 100).toFixed(1) : '0.0';

  const makeStats = (items, key) =>
    items.map((item) => {
      const target = records.filter((r) => r[key] === item);
      const ok = target.filter((r) => r.performed).length;
      return {
        name: item,
        total: target.length,
        rate: target.length ? ((ok / target.length) * 100).toFixed(1) : '0.0',
      };
    });

  const momentStats = useMemo(() => makeStats(moments, 'moment'), [records]);
  const wardStats = useMemo(() => makeStats(wards, 'ward'), [records, wards]);
  const professionStats = useMemo(() => makeStats(professions, 'profession'), [records, professions]);

  const MomentButton = ({ label }) => {
    const [open, setOpen] = useState(false);

    return (
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="bg-pink-400 hover:bg-pink-500 text-white rounded-2xl px-4 py-4 shadow-md text-base font-semibold w-full min-h-[72px] text-center transition-all"
        >
          {label}
        </button>

        {open && (
          <div className="mt-2 bg-white rounded-2xl shadow-xl border p-2 space-y-2 w-full z-20 relative">
            <button type="button" className="w-full border rounded-xl p-2 hover:bg-pink-50" onClick={() => { saveRecord(label, 'alcohol'); setOpen(false); }}>
              アルコール使用
            </button>
            <button type="button" className="w-full border rounded-xl p-2 hover:bg-pink-50" onClick={() => { saveRecord(label, 'soap'); setOpen(false); }}>
              流水石けん使用
            </button>
            <button type="button" className="w-full border rounded-xl p-2 hover:bg-pink-50" onClick={() => { saveRecord(label, 'none'); setOpen(false); }}>
              しない
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">手指衛生直接観察アプリ</h1>
              <p className="text-gray-500">WHO 5つのタイミング直接観察法</p>
            </div>
            <button type="button" onClick={() => setShowSettings(!showSettings)} className="bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-2xl p-3 transition-all" aria-label="設定">
              <Settings size={24} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow p-6 space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">病棟名</label>
              <select value={ward} onChange={(e) => setWard(e.target.value)} className="w-full border rounded-2xl p-3">
                {wards.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">観察日</label>
              <input type="date" value={observationDate} onChange={(e) => setObservationDate(e.target.value)} className="w-full border rounded-2xl p-3" />
            </div>
            <div>
              <label className="block text-sm mb-1">職種</label>
              <select value={profession} onChange={(e) => setProfession(e.target.value)} className="w-full border rounded-2xl p-3">
                {professions.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {showSettings && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-2xl p-4 bg-pink-50">
                <div className="font-semibold mb-2 text-pink-700">部署追加</div>
                <div className="flex gap-2">
                  <input type="text" value={newWard} onChange={(e) => setNewWard(e.target.value)} placeholder="部署名を入力" className="flex-1 border rounded-xl p-2" />
                  <button type="button" onClick={addWard} className="bg-pink-400 hover:bg-pink-500 text-white px-4 rounded-xl">追加</button>
                </div>
              </div>
              <div className="border rounded-2xl p-4 bg-pink-50">
                <div className="font-semibold mb-2 text-pink-700">職種追加</div>
                <div className="flex gap-2">
                  <input type="text" value={newProfession} onChange={(e) => setNewProfession(e.target.value)} placeholder="職種名を入力" className="flex-1 border rounded-xl p-2" />
                  <button type="button" onClick={addProfession} className="bg-pink-400 hover:bg-pink-500 text-white px-4 rounded-xl">追加</button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-orange-50 rounded-3xl p-6 border">
            <div className="grid grid-cols-2 gap-4">
              {moments.slice(0, 4).map((m) => <MomentButton key={m} label={m} />)}
            </div>
            <div className="mt-4">
              <MomentButton label={moments[4]} />
            </div>
          </div>
        </div>

        <div className="sticky top-4 z-50 flex justify-end">
          <button type="button" onClick={resetRecords} className="bg-red-500 text-white px-5 py-3 rounded-2xl shadow-lg active:scale-95">
            リセット
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4">全体遵守率</h2>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="border rounded-2xl p-4"><div className="text-sm text-gray-500">観察総数</div><div className="text-4xl font-bold mt-2">{total}</div></div>
            <div className="border rounded-2xl p-4"><div className="text-sm text-gray-500">遵守数</div><div className="text-4xl font-bold mt-2">{compliant}</div></div>
            <div className="border rounded-2xl p-4"><div className="text-sm text-gray-500">遵守率</div><div className="text-4xl font-bold mt-2">{complianceRate}%</div></div>
          </div>

          <h2 className="text-xl font-bold mb-3">タイミング別遵守率</h2>
          <div className="space-y-3 mb-8">
            {momentStats.map((m) => (
              <div key={m.name} className="flex justify-between border rounded-2xl p-3">
                <div>{m.name}</div>
                <div>{m.rate}%（{m.total}件）</div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold mb-3">部署別遵守率</h2>
          <div className="space-y-3 mb-8">
            {wardStats.map((w) => (
              <div key={w.name} className="flex justify-between border rounded-2xl p-3">
                <div>{w.name}</div>
                <div>{w.rate}%（{w.total}件）</div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold mb-3">職種別遵守率</h2>
          <div className="space-y-3 mb-8">
            {professionStats.map((p) => (
              <div key={p.name} className="flex justify-between border rounded-2xl p-3">
                <div>{p.name}</div>
                <div>{p.rate}%（{p.total}件）</div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold mb-3">最新記録</h2>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="text-left p-2">病棟</th>
                  <th className="text-left p-2">職種</th>
                  <th className="text-left p-2">タイミング</th>
                  <th className="text-left p-2">方法</th>
                  <th className="text-left p-2">削除</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="p-2">{r.ward}</td>
                    <td className="p-2">{r.profession}</td>
                    <td className="p-2">{r.moment}</td>
                    <td className="p-2">{r.action === 'alcohol' ? 'アルコール使用' : r.action === 'soap' ? '流水石けん使用' : 'しない'}</td>
                    <td className="p-2">
                      <button type="button" onClick={() => deleteRecord(r.id)} className="text-red-500 hover:text-red-700" aria-label="記録を削除">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
