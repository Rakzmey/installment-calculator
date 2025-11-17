

import React, { useState, useMemo } from 'react';
import CalculatorCard from './CalculatorCard';
import { useLanguage } from '../contexts/LanguageContext';

interface ProfitMarginCalculatorProps {
  onNavigateToGlossary: (targetId: string) => void;
}

const ProfitMarginCalculator: React.FC<ProfitMarginCalculatorProps> = ({ onNavigateToGlossary }) => {
  const [revenue, setRevenue] = useState('50000');
  const [cogs, setCogs] = useState('20000');
  const [expenses, setExpenses] = useState('15000');
  const { t } = useLanguage();
  const pageT = t.profitMarginCalculator;
  const helperT = t.calculatorHelpers;

  const { grossProfit, grossMargin, netProfit, netMargin } = useMemo(() => {
    const rev = parseFloat(revenue);
    const cost = parseFloat(cogs);
    const exp = parseFloat(expenses);
    if (rev > 0) {
      const gp = rev - cost;
      const gm = (gp / rev) * 100;
      const np = gp - exp;
      const nm = (np / rev) * 100;
      return { grossProfit: gp, grossMargin: gm, netProfit: np, netMargin: nm };
    }
    return { grossProfit: 0, grossMargin: 0, netProfit: 0, netMargin: 0 };
  }, [revenue, cogs, expenses]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <CalculatorCard title={pageT.title} icon="🧾" description={pageT.description}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.revenue}</label>
            <input type="number" value={revenue} onChange={e => setRevenue(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.cogs}</label>
            <input type="number" value={cogs} onChange={e => setCogs(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.operatingExpenses}</label>
            <input type="number" value={expenses} onChange={e => setExpenses(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
        </div>

        <div className="bg-teal-50 dark:bg-slate-700/50 p-6 rounded-lg space-y-4">
          <div>
            <h3 className="font-semibold text-teal-800 dark:text-teal-200">{pageT.grossProfit}</h3>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{formatCurrency(grossProfit)}</p>
            <p className="text-lg text-gray-600 dark:text-gray-300">{pageT.margin}: {grossMargin.toFixed(2)}%</p>
          </div>
          <hr className="dark:border-slate-600" />
          <div>
            <h3 className="font-semibold text-teal-800 dark:text-teal-200">{pageT.netProfit}</h3>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{formatCurrency(netProfit)}</p>
            <p className="text-lg text-gray-600 dark:text-gray-300">{pageT.margin}: {netMargin.toFixed(2)}%</p>
          </div>
        </div>
      </div>
       <div className="mt-8 pt-4 border-t border-gray-200 dark:border-slate-600 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
            {helperT.prompt}{' '}
            <button 
                onClick={() => onNavigateToGlossary('profit-margin')}
                className="text-teal-600 dark:text-teal-400 font-semibold underline hover:text-teal-800 dark:hover:text-teal-300 focus:outline-none"
            >
                {helperT.linkText}
            </button>
        </p>
      </div>
    </CalculatorCard>
  );
};

export default ProfitMarginCalculator;