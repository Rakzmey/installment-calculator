

import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CalculatorCard from './CalculatorCard';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface BudgetItem {
  id: number;
  name: string;
  amount: number;
}

const COLORS = ['#0D9488', '#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'];

const MonthlyBudgetPlanner: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const pageT = t.budgetPlanner;

  const [incomes, setIncomes] = useState<BudgetItem[]>([{ id: 1, name: pageT.salary, amount: 2000 }]);
  const [expenses, setExpenses] = useState<BudgetItem[]>([
    { id: 1, name: pageT.rent, amount: 800 },
    { id: 2, name: pageT.food, amount: 400 },
    { id: 3, name: pageT.transport, amount: 150 },
  ]);

  const { totalIncome, totalExpenses, netSavings } = useMemo(() => {
    const incomeSum = incomes.reduce((sum, item) => sum + item.amount, 0);
    const expenseSum = expenses.reduce((sum, item) => sum + item.amount, 0);
    return {
      totalIncome: incomeSum,
      totalExpenses: expenseSum,
      netSavings: incomeSum - expenseSum,
    };
  }, [incomes, expenses]);

  // Fix: Create a derived data structure for the chart to avoid type compatibility issues with recharts.
  const expenseChartData = useMemo(() => expenses.map(e => ({ name: e.name, amount: e.amount })), [expenses]);
  
  const handleItemChange = <T extends BudgetItem>(items: T[], setItems: React.Dispatch<React.SetStateAction<T[]>>, id: number, field: 'name' | 'amount', value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: field === 'amount' ? parseFloat(value) || 0 : value } : item));
  };
  
  const addItem = <T extends BudgetItem>(items: T[], setItems: React.Dispatch<React.SetStateAction<T[]>>, defaultName: string) => {
    setItems([...items, { id: Date.now(), name: defaultName, amount: 0 } as T]);
  };
  
  const removeItem = <T extends BudgetItem>(items: T[], setItems: React.Dispatch<React.SetStateAction<T[]>>, id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  
  const handleDownload = () => {
    // Function to properly escape CSV cells
    const escapeCsvCell = (cell: string | number) => `"${String(cell).replace(/"/g, '""')}"`;
    
    // Create CSV rows
    const csvRows: string[] = [];
    
    // Add UTF-8 BOM
    const BOM = '\uFEFF';
    
    // Incomes
    csvRows.push(`${escapeCsvCell(pageT.income)}`);
    csvRows.push(`${escapeCsvCell(pageT.name)},${escapeCsvCell(pageT.amount)}`);
    incomes.forEach(item => {
        csvRows.push(`${escapeCsvCell(item.name)},${escapeCsvCell(item.amount)}`);
    });

    // Expenses
    csvRows.push('');  // Empty row
    csvRows.push(`${escapeCsvCell(pageT.expenses)}`);
    csvRows.push(`${escapeCsvCell(pageT.name)},${escapeCsvCell(pageT.amount)}`);
    expenses.forEach(item => {
        csvRows.push(`${escapeCsvCell(item.name)},${escapeCsvCell(item.amount)}`);
    });

    // Summary
    csvRows.push('');  // Empty row
    csvRows.push(`${escapeCsvCell(pageT.summary)}`);
    csvRows.push(`${escapeCsvCell(pageT.totalIncome)},${escapeCsvCell(totalIncome)}`);
    csvRows.push(`${escapeCsvCell(pageT.totalExpenses)},${escapeCsvCell(totalExpenses)}`);
    csvRows.push(`${escapeCsvCell(pageT.netSavings)},${escapeCsvCell(netSavings)}`);

    // Join rows with newlines and add BOM
    const csvContent = BOM + csvRows.join('\n');
    
    // Create Blob with proper encoding
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    
    // Create download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'monthly_budget.csv';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };


  const budgetItemsUI = (title: string, items: BudgetItem[], setItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>, type: 'income' | 'expense') => (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg dark:text-gray-200">{title}</h3>
      {items.map(item => (
        <div key={item.id} className="flex items-center space-x-2">
          <input type="text" value={item.name} onChange={e => handleItemChange(items, setItems, item.id, 'name', e.target.value)} className="flex-grow px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" placeholder={pageT.name} />
          <input type="number" value={item.amount} onChange={e => handleItemChange(items, setItems, item.id, 'amount', e.target.value)} className="w-28 px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" placeholder={pageT.amount} />
          <button onClick={() => removeItem(items, setItems, item.id)} className="p-1 text-red-500 hover:text-red-700">&times;</button>
        </div>
      ))}
      <button onClick={() => addItem(items, setItems, type === 'income' ? pageT.newIncome : pageT.newExpense)} className="text-sm text-teal-600 dark:text-teal-400 font-semibold">{pageT.addItem}</button>
    </div>
  );

  return (
    <CalculatorCard title={pageT.title} icon="📊" description={pageT.description}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {budgetItemsUI(pageT.income, incomes, setIncomes, 'income')}
          {budgetItemsUI(pageT.expenses, expenses, setExpenses, 'expense')}
        </div>
        <div className="bg-teal-50 dark:bg-slate-700/50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-teal-800 dark:text-teal-200 mb-4">{pageT.summary}</h3>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-lg"><span className="text-gray-600 dark:text-gray-300">{pageT.totalIncome}:</span> <span className="font-semibold text-green-600">{formatCurrency(totalIncome)}</span></div>
            <div className="flex justify-between text-lg"><span className="text-gray-600 dark:text-gray-300">{pageT.totalExpenses}:</span> <span className="font-semibold text-red-600">{formatCurrency(totalExpenses)}</span></div>
            <hr className="dark:border-slate-600" />
            <div className="flex justify-between text-xl"><span className="font-bold text-gray-700 dark:text-gray-200">{pageT.netSavings}:</span> <span className={`font-bold ${netSavings >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-700 dark:text-red-500'}`}>{formatCurrency(netSavings)}</span></div>
          </div>
          <h4 className="font-semibold text-teal-800 dark:text-teal-200 mb-2">{pageT.expenseBreakdown}</h4>
           <div style={{ width: '100%', height: 350 }}>
             <ResponsiveContainer>
               <PieChart>
                 {/* Fix: Use derived chart data to satisfy recharts' expected data type. */}
                 <Pie data={expenseChartData} dataKey="amount" nameKey="name" cx="50%" cy="35%" innerRadius={60} outerRadius={90} paddingAngle={2} cornerRadius="20%" label>
                   {expenseChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                 </Pie>
                 <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#d1d5db' }}/>
                 <Legend layout="horizontal" verticalAlign="bottom" align="center" formatter={(value) => <span className="text-gray-700 dark:text-gray-300">{value}</span>}/>
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

export default MonthlyBudgetPlanner;