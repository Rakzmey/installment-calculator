

import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CalculatorCard from './CalculatorCard';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface IncomeItem {
  id: number;
  name: string;
  value: string;
}

type Timeframe = 'monthly' | 'weekly' | 'daily';

const COLORS = [
  '#14b8a6', // teal-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#64748b', // slate-500
  '#ef4444', // red-500
  '#0ea5e9', // sky-500
  '#d946ef', // fuchsia-500
  '#84cc16', // lime-500
];

const IncomeVisualizer: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const pageT = t.incomeVisualizer;
  
  const [timeframe, setTimeframe] = useState<Timeframe>('monthly');
  const [incomes, setIncomes] = useState<IncomeItem[]>([
    { id: 1, name: pageT.salary, value: '3000' },
    { id: 2, name: pageT.freelance, value: '500' },
    { id: 3, name: pageT.other, value: '150' },
  ]);

  const totalIncome = useMemo(() => {
    return incomes.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
  }, [incomes]);

  const chartData = useMemo(() => incomes.map(item => ({ name: item.name, value: parseFloat(item.value) || 0 })), [incomes]);

  const handleItemChange = (id: number, field: 'name' | 'value', fieldValue: string) => {
    setIncomes(incomes.map(item => item.id === id ? { ...item, [field]: fieldValue } : item));
  };

  const addItem = () => {
    setIncomes([...incomes, { id: Date.now(), name: pageT.newIncome, value: '' }]);
  };

  const removeItem = (id: number) => {
    setIncomes(incomes.filter(item => item.id !== id));
  };
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const handleDownload = () => {
    // Add BOM (Byte Order Mark) for proper Unicode support
    const BOM = '\uFEFF';
    let csvContent = BOM + "data:text/csv;charset=utf-8,";
    const escapeCsvCell = (cell: string | number) => `"${String(cell).replace(/"/g, '""')}"`;

    csvContent += `${escapeCsvCell(`${pageT.title} (${pageT[timeframe]})`)}\n`;
    csvContent += `${escapeCsvCell(pageT.incomeName)},${escapeCsvCell(pageT.amount)}\n`;

    incomes.forEach(item => {
        const name = escapeCsvCell(item.name);
        const value = item.value;
        csvContent += `${name},${value}\n`;
    });

    csvContent += `\n${escapeCsvCell(pageT.total)},${escapeCsvCell(totalIncome)}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `income_breakdown_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <CalculatorCard title={pageT.title} icon="💰" description={pageT.description}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-baseline">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{pageT.enterIncomes}</h3>
            <div className="flex items-center space-x-1 bg-gray-200 dark:bg-slate-700 rounded-lg p-1 mt-2 sm:mt-0">
                {(['monthly', 'weekly', 'daily'] as Timeframe[]).map(tf => (
                    <button 
                        key={tf} 
                        onClick={() => setTimeframe(tf)}
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${timeframe === tf ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                        {pageT[tf]}
                    </button>
                ))}
            </div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {incomes.map(item => (
              <div key={item.id} className="flex items-center space-x-2">
                <input type="text" value={item.name} onChange={e => handleItemChange(item.id, 'name', e.target.value)} className="flex-grow px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" placeholder={pageT.incomeName} />
                <input type="number" value={item.value} onChange={e => handleItemChange(item.id, 'value', e.target.value)} className="w-28 px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" step="any" />
                <button onClick={() => removeItem(item.id)} className="p-1 text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>
              </div>
            ))}
          </div>
          <button onClick={addItem} className="text-sm text-teal-600 dark:text-teal-400 font-semibold">{pageT.addIncome}</button>
        </div>
        <div className="bg-teal-50 dark:bg-slate-700/50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-teal-800 dark:text-teal-200 mb-4 text-center">{pageT.incomeBreakdown}</h3>
          <p className="text-center font-semibold text-lg mb-4 dark:text-gray-200">{pageT.total} ({pageT[timeframe]}): {formatCurrency(totalIncome)}</p>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} cornerRadius="20%">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [`${formatCurrency(value)} (${(value / totalIncome * 100).toFixed(1)}%)`, name]} contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#d1d5db' }}/>
                <Legend formatter={(value) => <span className="text-gray-700 dark:text-gray-300">{value}</span>}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <button onClick={handleDownload} className="mt-4 w-full px-4 py-2 text-sm font-semibold text-teal-600 dark:text-teal-300 bg-teal-100 dark:bg-slate-700 rounded-md hover:bg-teal-200 dark:hover:bg-slate-600 transition-colors">
                {pageT.downloadExcel}
          </button>
        </div>
      </div>
    </CalculatorCard>
  );
};

export default IncomeVisualizer;