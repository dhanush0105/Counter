import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { Trash2 } from 'lucide-react';

const getToday = () => new Date().toISOString().split('T')[0];
const getPast7Days = () =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

const Counter = ({ id, onDelete }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(`counter-${id}`)) || {};
    setName(data.name || '');
    setValue(data.value || 0);
    setHistory(JSON.parse(localStorage.getItem(`history-${id}`)) || []);
  }, [id]);

  const saveCounter = () => {
    const today = getToday();
    const newHistory = history.filter(h => h.date !== today);
    newHistory.push({ date: today, value });
    localStorage.setItem(`counter-${id}`, JSON.stringify({ name, value: 0 }));
    localStorage.setItem(`history-${id}`, JSON.stringify(newHistory));
    setHistory(newHistory);
    setValue(0);
  };

  const past7 = getPast7Days();
  const weekly = history.filter(h => past7.includes(h.date));
  const weeklyTotal = weekly.reduce((sum, h) => sum + h.value, 0);
  const overallTotal = history.reduce((sum, h) => sum + h.value, 0);

  const exportCSV = () => {
    const csv = ['Date,Value'];
    history.forEach(h => csv.push(`${h.date},${h.value}`));
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${name || 'counter'}-history.csv`);
  };

  return (
    <div className="bg-gray-700 p-4 rounded-xl shadow-lg space-y-4 relative">
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full px-4 py-2 rounded-lg border text-black"
        placeholder="Enter counter name"
      />

      <div className="flex justify-between items-center">
        <button onClick={() => setValue(v => v - 1)} className="bg-red-600 px-4 py-2 rounded-full font-bold text-white">-1</button>
        <div className="text-center">
          <div className="text-4xl font-bold text-indigo-300">{value}</div>
          <div className="text-sm text-gray-300">Today's Count</div>
        </div>
        <button onClick={() => setValue(v => v + 1)} className="bg-green-600 px-4 py-2 rounded-full font-bold text-white">+1</button>
      </div>

      <div className="flex gap-2">
        <button onClick={saveCounter} className="flex-1 bg-blue-600 py-2 rounded-lg font-bold text-white">Save</button>
        <button onClick={exportCSV} className="bg-yellow-500 py-2 px-4 rounded-lg font-bold text-white">Export</button>
      </div>

      <div className="flex justify-end">
        <button onClick={() => onDelete(id)} className="mt-2 text-red-400 hover:text-red-600">
          <Trash2 size={20} />
        </button>
      </div>

      <div className="text-green-400">7-Day Total: {weeklyTotal}</div>
      <div className="text-yellow-300">Overall Total: {overallTotal}</div>

      <div className="mt-4">
        <h4 className="text-white font-semibold mb-2">Past 7 Days</h4>
        {past7.reverse().map((day, idx) => {
          const entry = history.find(h => h.date === day);
          const value = entry ? entry.value : 0;
          return (
            <div key={idx} className="bg-gray-600 p-2 rounded-md flex justify-between">
              <span className="text-sm">{new Date(day).toDateString()}</span>
              <span className={`text-lg font-bold ${value >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {value > 0 ? '+' : ''}{value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function App() {
  const [counters, setCounters] = useState([]);

  useEffect(() => {
    const savedIds = JSON.parse(localStorage.getItem('counter-ids')) || [];
    setCounters(savedIds);
  }, []);

  const addCounter = () => {
    const newId = Date.now();
    const updated = [...counters, newId];
    localStorage.setItem('counter-ids', JSON.stringify(updated));
    setCounters(updated);
  };

  const deleteCounter = id => {
    const updated = counters.filter(cid => cid !== id);
    localStorage.setItem('counter-ids', JSON.stringify(updated));
    localStorage.removeItem(`counter-${id}`);
    localStorage.removeItem(`history-${id}`);
    setCounters(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-10 px-5 text-white">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-blue-400">Daily Counter Tracker</h1>
          <button onClick={addCounter} className="bg-green-600 px-6 py-2 rounded-lg font-bold text-white">+ Add Counter</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {counters.map(id => (
            <Counter key={id} id={id} onDelete={deleteCounter} />
          ))}
        </div>
      </div>
    </div>
  );
}