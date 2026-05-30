import React, { useMemo, useState } from 'react';
import { Settings, Trash2 } from 'lucide-react';
export default function HandHygieneApp() {
  const defaultWards = ['外来', '3階病棟', '4階病棟', '5階病棟', '6階病棟'];

  const [wards, setWards] = useState(() => {
    const saved = localStorage.getItem('handHygieneWards');
    return saved ? JSON.parse(saved) : defaultWards;
  });

  const defaultProfessions = [
    '看護師',
    'ナースアシスタント',
    'リハビリテーション科',
    '医師',
    'コメディカル',
  ];

  const [professions, setProfessions] = useState(() => {
    const saved = localStorage.getItem('handHygieneProfessions');
    return saved ? JSON.parse(saved) : defaultProfessions;
  });

   const moments = [
    '① 患者に触れる前',
    '② 清潔・無菌操作前',
    '③ 体液曝露リスク後',
    '④ 患者に触れた後',
    '⑤ 患者周辺に触れた後',
  ];

  const [ward, setWard] = useState('外来');
  const [profession, setProfession] = useState('看護師');
  const [newWard, setNewWard] = useState('');
  const [newProfession, setNewProfession] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const addWard = () => {
    if (!newWard.trim()) return;

    const updated = [...wards, newWard.trim()];
    setWards(updated);
    localStorage.setItem('handHygieneWards', JSON.stringify(updated));
    setNewWard('');
  };

  const addProfession = () => {
    if (!newProfession.trim()) return;

    const updated = [...professions, newProfession.trim()];
    setProfessions(updated);
    localStorage.setItem('handHygieneProfessions', JSON.stringify(updated));
    setNewProfession('');
  };

  const resetRecords = () => {
    const deleteRecord = (id) => {
  const updated = records.filter((r) => r.id !== id);
  setRecords(updated);
  localStorage.setItem('handHygieneRecords', JSON.stringify(updated));
};
   const deleteRecord = (id) => {
  const updated = records.filter((r) => r.id !== id);
  setRecords(updated);
  localStorage.setItem('handHygieneRecords', JSON.stringify(updated));
}; const confirmed = window.confirm('すべての観察記録を削除しますか？');

    if (!confirmed) return;

    setRecords([]);
    localStorage.removeItem('handHygieneRecords');
  };

  const [observationDate, setObservationDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('handHygieneRecords');
    return saved ? JSON.parse(saved) : [];
  });

  const saveRecord = (moment, action) => {
    const newRecord = {
      id: Date.now() + Math.random(),
      ward,
      profession,
      observationDate,
      moment,
      action,
      performed: action !== 'none',
    };

    const updated = [newRecord, ...records];
    setRecords(updated);
    localStorage.setItem('handHygieneRecords', JSON.stringify(updated));
  };

  const total = records.length;
  const compliant = records.filter((r) => r.performed).length;
  const complianceRate = total
    ? ((compliant / total) * 100).toFixed(1)
    : '0.0';

  const wardStats = useMemo(() => {
    return wards.map((w) => {
      const filtered = records.filter((r) => r.ward === w);
      const ok = filtered.filter((r) => r.performed).length;

      return {
        ward: w,
        rate: filtered.length
          ? ((ok / filtered.length) * 100).toFixed(1)
          : '0.0',
      };
    });
  }, [records]);

  const professionStats = useMemo(() => {
    return professions.map((p) => {
      const filtered = records.filter((r) => r.profession === p);
      const ok = filtered.filter((r) => r.performed).length;

      return {
        profession: p,
        rate: filtered.length
          ? ((ok / filtered.length) * 100).toFixed(1)
          : '0.0',
      };
    });
  }, [records]);

  const momentStats = useMemo(() => {
    return moments.map((m) => {
      const filtered = records.filter((r) => r.moment === m);
      const ok = filtered.filter((r) => r.performed).length;

      return {
        moment: m,
        rate: filtered.length
          ? ((ok / filtered.length) * 100).toFixed(1)
          : '0.0',
      };
    });
  }, [records]);

  const MomentButton = ({ label, position }) => {
    const [open, setOpen] = useState(false);

    return (
      <div className={position === 'relative' ? 'relative w-full' : `absolute ${position}`}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="bg-pink-400 hover:bg-pink-500 text-white rounded-2xl px-4 py-4 shadow-md text-base font-semibold w-full min-h-[72px] text-center transition-all max-w-none relative z-10"
        >
          {label}
        </button>

        {open && (
          <div className="mt-2 bg-white rounded-2xl shadow-xl border p-2 space-y-2 w-full z-20 relative">
            <button
              className="w-full border rounded-xl p-2 hover:bg-gray-100"
              onClick={() => {
                saveRecord(label, 'alcohol');
                setOpen(false);
              }}
            >
              アルコール使用
            </button>

            <button
              className="w-full border rounded-xl p-2 hover:bg-gray-100"
              onClick={() => {
                saveRecord(label, 'soap');
                setOpen(false);
              }}
            >
              流水石けん使用
            </button>

            <button
              className="w-full border rounded-xl p-2 hover:bg-gray-100"
              onClick={() => {
                saveRecord(label, 'none');
                setOpen(false);
              }}
            >
              しない
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
            手指衛生直接観察アプリ
          </h1>
          <p className="text-gray-500">
            WHO 5つのタイミング直接観察法
          </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-2xl p-3 transition-all"
            >
              <Settings size={24} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow p-6 space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">病棟名</label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full border rounded-2xl p-3"
              >
                {wards.map((w) => (
                  <option key={w}>{w}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">観察日</label>
              <input
                type="date"
                value={observationDate}
                onChange={(e) => setObservationDate(e.target.value)}
                className="w-full border rounded-2xl p-3"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">職種</label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full border rounded-2xl p-3"
              >
                {professions.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {showSettings && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-2xl p-4 bg-pink-50">
                <div className="font-semibold mb-2 text-pink-700">部署追加</div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newWard}
                    onChange={(e) => setNewWard(e.target.value)}
                    placeholder="部署名を入力"
                    className="flex-1 border rounded-xl p-2"
                  />

                  <button
                    type="button"
                    onClick={addWard}
                    className="bg-pink-400 hover:bg-pink-500 text-white px-4 rounded-xl"
                  >
                    追加
                  </button>
                </div>
              </div>

              <div className="border rounded-2xl p-4 bg-pink-50">
                <div className="font-semibold mb-2 text-pink-700">職種追加</div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newProfession}
                    onChange={(e) => setNewProfession(e.target.value)}
                    placeholder="職種名を入力"
                    className="flex-1 border rounded-xl p-2"
                  />

                  <button
                    type="button"
                    onClick={addProfession}
                    className="bg-pink-400 hover:bg-pink-500 text-white px-4 rounded-xl"
                  >
                    追加
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-orange-50 rounded-3xl p-6 border">
            <div className="grid grid-cols-2 gap-4">
              <MomentButton
                label="① 患者に触れる前"
                position="relative"
              />

              <MomentButton
                label="② 清潔・無菌操作前"
                position="relative"
              />

              <MomentButton
                label="③ 体液曝露リスク後"
                position="relative"
              />

              <MomentButton
                label="④ 患者に触れた後"
                position="relative"
              />
            </div>

            <div className="mt-4">
              <MomentButton
                label="⑤ 患者周辺に触れた後"
                position="relative"
              />
            </div>
          </div>
        </div>

        <div className="sticky top-4 z-[9999] flex justify-end mb-4">
          <button
            type="button"
            onClick={() => {
              setRecords([]);
              localStorage.setItem('handHygieneRecords', JSON.stringify([]));
            }}
            className="bg-red-500 text-white px-5 py-3 rounded-2xl shadow-lg active:scale-95"
          >
            リセット
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow p-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold">全体遵守率</h2>

            <div className="text-sm text-gray-400">右上のリセットボタンから削除できます</div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="border rounded-2xl p-4">
              <div className="text-sm text-gray-500">観察総数</div>
              <div className="text-4xl font-bold mt-2">{total}</div>
            </div>

            <div className="border rounded-2xl p-4">
              <div className="text-sm text-gray-500">遵守数</div>
              <div className="text-4xl font-bold mt-2">{compliant}</div>
            </div>

            <div className="border rounded-2xl p-4">
              <div className="text-sm text-gray-500">遵守率</div>
              <div className="text-4xl font-bold mt-2">{complianceRate}%</div>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-3">タイミング別遵守率</h2>
          <div className="space-y-3 mb-8">
            {momentStats.map((m) => (
              <div
                key={m.moment}
                className="flex justify-between border rounded-2xl p-3"
              >
                <div>{m.moment}</div>
                <div>{m.rate}%</div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold mb-3">部署別遵守率</h2>
          <div className="space-y-3 mb-8">
            {wardStats.map((w) => (
              <div
                key={w.ward}
                className="flex justify-between border rounded-2xl p-3"
              >
                <div>{w.ward}</div>
                <div>{w.rate}%</div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold mb-3">職種別遵守率</h2>
          <div className="space-y-3 mb-8">
            {professionStats.map((p) => (
              <div
                key={p.profession}
                className="flex justify-between border rounded-2xl p-3"
              >
                <div>{p.profession}</div>
                <div>{p.rate}%</div>
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
                    <td className="p-2">
                      {r.action === 'alcohol'
                        ? 'アルコール使用'
                        : r.action === 'soap'
                        ? '流水石けん使用'
                        : 'しない'}
                    </td>
  <td className="p-2">
  <button
    onClick={() => deleteRecord(r.id)}
    className="text-red-500 hover:text-red-700"
  >
    <Trash2 size={18} />
  </button>
</td>
</tr>
))}
