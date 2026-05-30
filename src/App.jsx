import React, { useMemo, useRef, useState } from 'react';
import { Download, Edit3, Save, Settings, Trash2, Upload, X } from 'lucide-react';

export default function HandHygieneApp() {
  const defaultWards = ['外来', '3階病棟', '4階病棟', '5階病棟', '6階病棟'];
  const defaultProfessions = ['看護師', 'ナースアシスタント', 'リハビリテーション科', '医師', 'コメディカル'];
  const moments = ['① 患者に触れる前', '② 清潔・無菌操作前', '③ 体液曝露リスク後', '④ 患者に触れた後', '⑤ 患者周辺に触れた後'];

  const [wards, setWards] = useState(() => JSON.parse(localStorage.getItem('handHygieneWards') || 'null') || defaultWards);
  const [professions, setProfessions] = useState(() => JSON.parse(localStorage.getItem('handHygieneProfessions') || 'null') || defaultProfessions);
  const [ward, setWard] = useState(wards[0]);
  const [profession, setProfession] = useState(professions[0]);
  const [observationDate, setObservationDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState(() => JSON.parse(localStorage.getItem('handHygieneRecords') || '[]'));
  const [newWard, setNewWard] = useState('');
  const [newProfession, setNewProfession] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const fileInputRef = useRef(null);

  const saveRecords = (updated) => {
    setRecords(updated);
    localStorage.setItem('handHygieneRecords', JSON.stringify(updated));
  };

  const saveRecord = (moment, action) => {
    saveRecords([{
      id: Date.now() + Math.random(),
      ward,
      profession,
      observationDate,
      moment,
      action,
      performed: action !== 'none',
      createdAt: new Date().toLocaleString('ja-JP'),
    }, ...records]);
  };

  const resetRecords = () => saveRecords([]);
  const deleteRecord = (id) => saveRecords(records.filter((r) => r.id !== id));

  const addWard = () => {
    const value = newWard.trim();
    if (!value || wards.includes(value)) return;
    const updated = [...wards, value];
    setWards(updated);
    setWard(value);
    localStorage.setItem('handHygieneWards', JSON.stringify(updated));
    setNewWard('');
  };

  const addProfession = () => {
    const value = newProfession.trim();
    if (!value || professions.includes(value)) return;
    const updated = [...professions, value];
    setProfessions(updated);
    setProfession(value);
    localStorage.setItem('handHygieneProfessions', JSON.stringify(updated));
    setNewProfession('');
  };

  const startEdit = (record) => {
    setEditingId(record.id);
    setEditForm({ ...record });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (!editForm) return;
    const updatedRecord = { ...editForm, performed: editForm.action !== 'none' };
    saveRecords(records.map((r) => (r.id === editingId ? updatedRecord : r)));
    cancelEdit();
  };

  const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

  const exportCsv = () => {
    const headers = ['id', '観察日', '病棟', '職種', 'タイミング', '方法', '実施', '作成日時'];
    const rows = records.map((r) => [
      r.id,
      r.observationDate,
      r.ward,
      r.profession,
      r.moment,
      r.action === 'alcohol' ? 'アルコール使用' : r.action === 'soap' ? '流水石けん使用' : 'しない',
      r.performed ? '○' : '×',
      r.createdAt || '',
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hand_hygiene_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const parseCsvLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      const next = line[i + 1];
      if (char === '"' && inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const importCsv = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target?.result || '').replace(/^\ufeff/, '');
      const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
      const imported = lines.slice(1).map((line) => {
        const cols = parseCsvLine(line);
        const actionText = cols[5] || '';
        const action = actionText.includes('アルコール') ? 'alcohol' : actionText.includes('流水') ? 'soap' : 'none';
        return {
          id: Number(cols[0]) || Date.now() + Math.random(),
          observationDate: cols[1] || new Date().toISOString().split('T')[0],
          ward: cols[2] || wards[0],
          profession: cols[3] || professions[0],
          moment: cols[4] || moments[0],
          action,
          performed: action !== 'none',
          createdAt: cols[7] || '',
        };
      });
      const merged = [...imported, ...records];
      const unique = Array.from(new Map(merged.map((r) => [String(r.id), r])).values());
      saveRecords(unique);

      const updatedWards = Array.from(new Set([...wards, ...imported.map((r) => r.ward).filter(Boolean)]));
      const updatedProfessions = Array.from(new Set([...professions, ...imported.map((r) => r.profession).filter(Boolean)]));
      setWards(updatedWards);
      setProfessions(updatedProfessions);
      localStorage.setItem('handHygieneWards', JSON.stringify(updatedWards));
      localStorage.setItem('handHygieneProfessions', JSON.stringify(updatedProfessions));
    };
    reader.readAsText(file, 'UTF-8');
    event.target.value = '';
  };

  const total = records.length;
  const compliant = records.filter((r) => r.performed).length;
  const complianceRate = total ? ((compliant / total) * 100).toFixed(1) : '0.0';

  const makeStats = (items, key) => items.map((item) => {
    const target = records.filter((r) => r[key] === item);
    const ok = target.filter((r) => r.performed).length;
    return { name: item, total: target.length, rate: target.length ? ((ok / target.length) * 100).toFixed(1) : '0.0' };
  });

  const momentStats = useMemo(() => makeStats(moments, 'moment'), [records]);
  const wardStats = useMemo(() => makeStats(wards, 'ward'), [records, wards]);
  const professionStats = useMemo(() => makeStats(professions, 'profession'), [records, professions]);

  const MomentButton = ({ label }) => {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative w-full">
        <button type="button" onClick={() => setOpen(!open)} className="bg-pink-400 hover:bg-pink-500 text-white rounded-2xl px-4 py-4 shadow-md text-base font-semibold w-full min-h-[72px] text-center transition-all">
          {label}
        </button>
        {open && (
          <div className="mt-2 bg-white rounded-2xl shadow-xl border p-2 space-y-2 w-full z-20 relative">
            <button type="button" className="w-full border rounded-xl p-2 hover:bg-pink-50" onClick={() => { saveRecord(label, 'alcohol'); setOpen(false); }}>アルコール使用</button>
            <button type="button" className="w-full border rounded-xl p-2 hover:bg-pink-50" onClick={() => { saveRecord(label, 'soap'); setOpen(false); }}>流水石けん使用</button>
            <button type="button" className="w-full border rounded-xl p-2 hover:bg-pink-50" onClick={() => { saveRecord(label, 'none'); setOpen(false); }}>しない</button>
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
            <div className="mt-4"><MomentButton label={moments[4]} /></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow p-6">
          <h2 className="text-xl font-bold mb-3">データ連携</h2>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={exportCsv} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-2xl shadow flex items-center gap-2"><Download size={18} /> CSVエクスポート</button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-2xl shadow flex items-center gap-2"><Upload size={18} /> CSVインポート</button>
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={importCsv} className="hidden" />
            <button type="button" onClick={resetRecords} className="bg-red-500 text-white px-4 py-3 rounded-2xl shadow">リセット</button>
          </div>
          <p className="text-sm text-gray-500 mt-3">iPhoneでエクスポートしたCSVをパソコンでインポートすると、手動でデータを同期できます。</p>
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
            {momentStats.map((m) => <div key={m.name} className="flex justify-between border rounded-2xl p-3"><div>{m.name}</div><div>{m.rate}%（{m.total}件）</div></div>)}
          </div>

          <h2 className="text-xl font-bold mb-3">部署別遵守率</h2>
          <div className="space-y-3 mb-8">
            {wardStats.map((w) => <div key={w.name} className="flex justify-between border rounded-2xl p-3"><div>{w.name}</div><div>{w.rate}%（{w.total}件）</div></div>)}
          </div>

          <h2 className="text-xl font-bold mb-3">職種別遵守率</h2>
          <div className="space-y-3 mb-8">
            {professionStats.map((p) => <div key={p.name} className="flex justify-between border rounded-2xl p-3"><div>{p.name}</div><div>{p.rate}%（{p.total}件）</div></div>)}
          </div>

          <h2 className="text-xl font-bold mb-3">履歴一覧</h2>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="text-left p-2">観察日</th>
                  <th className="text-left p-2">病棟</th>
                  <th className="text-left p-2">職種</th>
                  <th className="text-left p-2">タイミング</th>
                  <th className="text-left p-2">方法</th>
                  <th className="text-left p-2">修正</th>
                  <th className="text-left p-2">削除</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b">
                    {editingId === r.id ? (
                      <>
                        <td className="p-2"><input type="date" value={editForm.observationDate} onChange={(e) => setEditForm({ ...editForm, observationDate: e.target.value })} className="border rounded p-1" /></td>
                        <td className="p-2"><select value={editForm.ward} onChange={(e) => setEditForm({ ...editForm, ward: e.target.value })} className="border rounded p-1">{wards.map((w) => <option key={w} value={w}>{w}</option>)}</select></td>
                        <td className="p-2"><select value={editForm.profession} onChange={(e) => setEditForm({ ...editForm, profession: e.target.value })} className="border rounded p-1">{professions.map((p) => <option key={p} value={p}>{p}</option>)}</select></td>
                        <td className="p-2"><select value={editForm.moment} onChange={(e) => setEditForm({ ...editForm, moment: e.target.value })} className="border rounded p-1">{moments.map((m) => <option key={m} value={m}>{m}</option>)}</select></td>
                        <td className="p-2"><select value={editForm.action} onChange={(e) => setEditForm({ ...editForm, action: e.target.value })} className="border rounded p-1"><option value="alcohol">アルコール使用</option><option value="soap">流水石けん使用</option><option value="none">しない</option></select></td>
                        <td className="p-2"><button type="button" onClick={saveEdit} className="text-green-600"><Save size={18} /></button></td>
                        <td className="p-2"><button type="button" onClick={cancelEdit} className="text-gray-500"><X size={18} /></button></td>
                      </>
                    ) : (
                      <>
                        <td className="p-2">{r.observationDate}</td>
                        <td className="p-2">{r.ward}</td>
                        <td className="p-2">{r.profession}</td>
                        <td className="p-2">{r.moment}</td>
                        <td className="p-2">{r.action === 'alcohol' ? 'アルコール使用' : r.action === 'soap' ? '流水石けん使用' : 'しない'}</td>
                        <td className="p-2"><button type="button" onClick={() => startEdit(r)} className="text-blue-500"><Edit3 size={18} /></button></td>
                        <td className="p-2"><button type="button" onClick={() => deleteRecord(r.id)} className="text-red-500 hover:text-red-700" aria-label="記録を削除"><Trash2 size={18} /></button></td>
                      </>
                    )}
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

