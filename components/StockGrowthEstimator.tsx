

import React, { useState, useMemo } from 'react';
import CalculatorCard from './CalculatorCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface StockGrowthEstimatorProps {
  onNavigateToGlossary: (targetId: string) => void;
}

const StockGrowthEstimator: React.FC<StockGrowthEstimatorProps> = ({ onNavigateToGlossary }) => {
  const [initialInvestment, setInitialInvestment] = useState('5000');
  const [annualGrowthRate, setAnnualGrowthRate] = useState('8');
  const [years, setYears] = useState('10');
  const { t } = useLanguage();
  const { theme } = useTheme();
  const pageT = t.stockGrowthEstimator;
  const helperT = t.calculatorHelpers;

  const { futureValue, chartData } = useMemo(() => {
    const P = parseFloat(initialInvestment);
    const r = parseFloat(annualGrowthRate) / 100;
    const numYears = parseInt(years, 10);

    if (P > 0 && r >= 0 && numYears > 0) {
      const fv = P * Math.pow(1 + r, numYears);

      const data = [];
      for (let year = 0; year <= numYears; year++) {
        data.push({
          year: `${pageT.year} ${year}`,
          value: P * Math.pow(1 + r, year),
        });
      }

      return { futureValue: fv, chartData: data };
    }
    return { futureValue: 0, chartData: [] };
  }, [initialInvestment, annualGrowthRate, years, pageT.year]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <CalculatorCard title={pageT.title} icon="💹" description={pageT.description}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.initialInvestment}</label>
            <input type="number" value={initialInvestment} onChange={e => setInitialInvestment(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.annualGrowthRate}</label>
            <input type="number" value={annualGrowthRate} onChange={e => setAnnualGrowthRate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.numberOfYears}</label>
            <input type="number" value={years} onChange={e => setYears(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
           <div className="bg-teal-50 dark:bg-slate-700/50 p-6 rounded-lg text-center mt-4">
              <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200 pb-2 mb-2">{pageT.estimatedFutureValue}</h3>
              <p className="text-4xl font-bold text-teal-600 dark:text-teal-400">{formatCurrency(futureValue)}</p>
          </div>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200 mb-4">{pageT.projectedGrowth}</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4b5563' : '#d1d5db'} />
                        <XAxis dataKey="year" tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }}/>
                        <YAxis tickFormatter={(tick) => `$${tick/1000}k`} tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }}/>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#d1d5db' }}/>
                        <Legend formatter={(value) => <span className="text-gray-700 dark:text-gray-300">{value}</span>}/>
                        <Line type="monotone" dataKey="value" stroke="#14B8A6" strokeWidth={2} name={pageT.investmentValue}/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
      <div className="mt-8 pt-4 border-t border-gray-200 dark:border-slate-600 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
            {helperT.prompt}{' '}
            <button 
                onClick={() => onNavigateToGlossary('roi')}
                className="text-teal-600 dark:text-teal-400 font-semibold underline hover:text-teal-800 dark:hover:text-teal-300 focus:outline-none"
            >
                {helperT.linkText}
            </button>
        </p>
      </div>
    </CalculatorCard>
  );
};

export default StockGrowthEstimator;