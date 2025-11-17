
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CalculatorCard from './CalculatorCard';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface SavingsCalculatorProps {
  onNavigateToGlossary: (targetId: string) => void;
}

const SavingsCalculator: React.FC<SavingsCalculatorProps> = ({ onNavigateToGlossary }) => {
  const [initialAmount, setInitialAmount] = useState('1000');
  const [monthlyContribution, setMonthlyContribution] = useState('100');
  const [interestRate, setInterestRate] = useState('5');
  const [timePeriod, setTimePeriod] = useState('10');
  const [isForeigner, setIsForeigner] = useState(false);
  const [whtRate, setWhtRate] = useState('4'); // Default to 4% for resident non-fixed term deposit
  const { t } = useLanguage();
  const { theme } = useTheme();
  const pageT = t.savingsCalculator;
  const helperT = t.calculatorHelpers;

  const { futureValue, totalInterest, totalContribution, chartData } = useMemo(() => {
    const P = parseFloat(initialAmount);
    const PMT = parseFloat(monthlyContribution);
    const r = parseFloat(interestRate) / 100;
    const years = parseFloat(timePeriod);

    if (P >= 0 && PMT >= 0 && r >= 0 && years > 0) {
      const n = 12; // Compounded monthly
      const nt = n * years;
      const taxRate = parseFloat(whtRate) / 100;

      let fvBeforeTax = P * Math.pow(1 + r / n, nt) + PMT * ((Math.pow(1 + r / n, nt) - 1) / (r / n));
      let totalContributed = P + (PMT * years * 12);
      let interestEarnedBeforeTax = fvBeforeTax - totalContributed;
      let taxAmount = interestEarnedBeforeTax * taxRate;
      let fv = fvBeforeTax - taxAmount;
      let totalInterest = interestEarnedBeforeTax - taxAmount;

      // Chart data
      const data = [];
      let currentBalance = P;
      for (let year = 1; year <= years; year++) {
        let yearEndBalance = currentBalance;
        let yearInterestBeforeTax = 0;
        for (let month = 1; month <= 12; month++) {
            const monthlyInterest = (yearEndBalance + PMT) * (r / n);
            yearEndBalance = (yearEndBalance + PMT) * (1 + r / n);
            yearInterestBeforeTax += monthlyInterest;
        }
        const yearTax = yearInterestBeforeTax * taxRate;
        currentBalance = yearEndBalance - yearTax;
        data.push({
          year: `${pageT.year} ${year}`,
          value: Math.round(currentBalance),
          contributions: Math.round(P + (PMT * year * 12)),
          interest: Math.round(currentBalance - (P + (PMT * year * 12))),
        });
      }

      return {
        futureValue: fv,
        totalInterest: totalInterest,
        totalContribution: totalContributed,
        chartData: data,
      };
    }
    return { futureValue: 0, totalInterest: 0, totalContribution: 0, chartData: [] };
  }, [initialAmount, monthlyContribution, interestRate, timePeriod, whtRate, pageT.year]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded shadow-lg">
          <p className="font-bold text-gray-800 dark:text-gray-100">{label}</p>
          <p className="text-gray-800 dark:text-gray-200">{`${pageT.total}: ${formatCurrency(payload[0].value + payload[1].value)}`}</p>
          <p style={{ color: payload[0].color }}>{`${payload[0].name}: ${formatCurrency(payload[0].value)}`}</p>
          <p style={{ color: payload[1].color }}>{`${payload[1].name}: ${formatCurrency(payload[1].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <CalculatorCard title={pageT.title} icon="🌱" description={pageT.description}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.initialAmount}</label>
            <input type="number" value={initialAmount} onChange={e => setInitialAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.monthlyContribution}</label>
            <input type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.interestRate}</label>
            <input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.timePeriod}</label>
            <input type="number" value={timePeriod} onChange={e => setTimePeriod(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="isForeigner"
              checked={isForeigner}
              onChange={(e) => {
                setIsForeigner(e.target.checked);
                setWhtRate(e.target.checked ? '14' : '4'); // Set default WHT based on residency
              }}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded dark:bg-slate-700 dark:border-slate-600"
            />
            <label htmlFor="isForeigner" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              {pageT.isForeigner}
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.whtRate}</label>
            <input
              type="number"
              value={whtRate}
              onChange={e => setWhtRate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{pageT.whtHint}</p>
          </div>
        </div>
        <div className="bg-teal-50 dark:bg-slate-700/50 p-6 rounded-lg flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200 border-b dark:border-slate-600 pb-2 mb-4">{pageT.futureValue}</h3>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-teal-600 dark:text-teal-400">{formatCurrency(futureValue)}</p>
            </div>
            <div className="space-y-2 text-sm">
                 <div className="flex justify-between">
                    <span className="font-medium text-gray-600 dark:text-gray-300">{pageT.totalContributions}:</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(totalContribution)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium text-gray-600 dark:text-gray-300">{pageT.totalInterest}:</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(totalInterest)}</span>
                </div>
            </div>
        </div>
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200 mb-4">{pageT.growthOverTime}</h3>
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4b5563' : '#d1d5db'} />
                    <XAxis dataKey="year" tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                    <YAxis tickFormatter={(tick) => `$${tick/1000}k`} tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: theme === 'dark' ? 'rgba(100, 116, 139, 0.3)' : 'rgba(203, 213, 225, 0.5)' }}/>
                    <Legend formatter={(value) => <span className="text-gray-700 dark:text-gray-300">{value}</span>} />
                    <Bar dataKey="contributions" stackId="a" fill="#3B82F6" name={pageT.contributions} />
                    <Bar dataKey="interest" stackId="a" fill="#10B981" name={pageT.interest} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-8 pt-4 border-t border-gray-200 dark:border-slate-600 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
            {helperT.prompt}{' '}
            <button 
                onClick={() => onNavigateToGlossary('compound-interest')}
                className="text-teal-600 dark:text-teal-400 font-semibold underline hover:text-teal-800 dark:hover:text-teal-300 focus:outline-none"
            >
                {helperT.linkText}
            </button>
        </p>
      </div>
    </CalculatorCard>
  );
};

export default SavingsCalculator;