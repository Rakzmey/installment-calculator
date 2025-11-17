

import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CalculatorCard from './CalculatorCard';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface ExpenseItem {
  id: number;
  category: string;
  name: string;
  // FIX: Changed value from string to number for type safety in calculations.
  value: number;
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

const ExpenseBreakdownVisualizer: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const pageT = t.expenseVisualizer;
  
  const [timeframe, setTimeframe] = useState<Timeframe>('monthly');
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    // FIX: Updated values to be numbers instead of strings to prevent type errors in calculations.
    { id: 1, category: pageT.categories.housing, name: pageT.rent, value: 950 },
    { id: 2, category: pageT.categories.food, name: pageT.groceries, value: 450 },
    { id: 3, category: pageT.categories.transportation, name: pageT.gas, value: 200 },
    { id: 4, category: pageT.categories.entertainment, name: pageT.movies, value: 150 },
    { id: 5, category: pageT.categories.utilities, name: pageT.electricity, value: 180 },
    { id: 6, category: pageT.categories.other, name: pageT.misc, value: 120 },
  ]);

  const { totalExpenses, categoryTotals } = useMemo(() => {
    // FIX: With item.value as a number, direct addition is safe and correct.
    const total = expenses.reduce((sum, item) => sum + (item.value || 0), 0);

    const totalsByCategory = expenses.reduce((acc, expense) => {
        // FIX: With expense.value as a number, this correctly performs numeric addition instead of string concatenation.
        acc[expense.category] = (acc[expense.category] || 0) + (expense.value || 0);
        return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(totalsByCategory)
      .map(([name, value]) => ({ name, value }))
      // FIX: This sort operation now correctly operates on numbers, resolving the error on this line.
      .sort((a, b) => b.value - a.value);

    return { totalExpenses: total, categoryTotals: chartData };
  }, [expenses]);

  const handleItemChange = (id: number, field: 'name' | 'value', fieldValue: string) => {
    // FIX: When updating the 'value', parse the string from the input field into a number.
    setExpenses(prev => prev.map(item => {
      if (item.id !== id) return item;
      
      if (field === 'value') {
        return { ...item, value: parseFloat(fieldValue) || 0 };
      }
      return { ...item, [field]: fieldValue };
    }));
  };

  const addItem = (category: string) => {
    const newItem: ExpenseItem = { 
        id: Date.now(), 
        category, 
        name: pageT.newExpense,
        // FIX: Changed initial value to 0 to match the number type.
        value: 0 
    };
    setExpenses(prev => [...prev, newItem]);
  };

  const removeItem = (id: number) => {
    setExpenses(prev => prev.filter(item => item.id !== id));
  };
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const handleDownload = () => {
    // Add BOM (Byte Order Mark) for proper Unicode support
    const BOM = '\uFEFF';
    let csvContent = BOM + "data:text/csv;charset=utf-8,";
    const escapeCsvCell = (cell: string | number) => `"${String(cell).replace(/"/g, '""')}"`;

    csvContent += `${escapeCsvCell(`${pageT.title} (${pageT[timeframe]})`)}\n`;
    csvContent += `"Category",${escapeCsvCell(pageT.expenseName)},${escapeCsvCell(pageT.amount)}\n`;

    expenses.forEach(item => {
        const category = escapeCsvCell(item.category);
        const name = escapeCsvCell(item.name);
        const value = item.value;
        csvContent += `${category},${name},${value}\n`;
    });
    
    csvContent += `\n${escapeCsvCell(pageT.total)},${escapeCsvCell(totalExpenses)}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "expense_breakdown.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories = Object.values(pageT.categories);

  return (
    <CalculatorCard title={pageT.title} icon="🍰" description={pageT.description}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-baseline">
                 <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{pageT.enterExpenses}</h3>
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
          
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {categories.map(category => (
                <div key={category}>
                    <h4 className="font-bold text-teal-700 dark:text-teal-300 text-md mb-2">{category}</h4>
                    <div className="space-y-2 pl-2 border-l-2 border-teal-100 dark:border-slate-600">
                        {expenses.filter(e => e.category === category).map(item => (
                            <div key={item.id} className="flex items-center space-x-2">
                                <input type="text" value={item.name} onChange={e => handleItemChange(item.id, 'name', e.target.value)} className="flex-grow px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" placeholder={pageT.expenseName} />
                                <input type="number" value={item.value} onChange={e => handleItemChange(item.id, 'value', e.target.value)} className="w-28 px-2 py-1 bg-white dark:bg-slate-700 border border-gray-30 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" step="any" />
                                <button onClick={() => removeItem(item.id)} className="p-1 text-red-500 hover:text-red-70 font-bold text-xl">&times;</button>
                            </div>
                        ))}
                         <button onClick={() => addItem(category)} className="text-sm text-teal-600 dark:text-teal-400 font-semibold pt-1">{pageT.addExpense}</button>
                    </div>
                </div>
            ))}
          </div>
        </div>
        <div className="bg-teal-50 dark:bg-slate-700/50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-teal-800 dark:text-teal-200 mb-4 text-center">{pageT.spendingBreakdown}</h3>
          <p className="text-center font-semibold text-lg mb-4 dark:text-gray-200">{pageT.total} ({pageT[timeframe]}): {formatCurrency(totalExpenses)}</p>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={categoryTotals} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} cornerRadius="20%">
                  {categoryTotals.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [`${formatCurrency(value)} (${(value / totalExpenses * 100).toFixed(1)}%)`, name]} contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#d1d5db' }}/>
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

export default ExpenseBreakdownVisualizer;