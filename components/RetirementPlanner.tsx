import React, { useState, useMemo } from 'react';
import CalculatorCard from './CalculatorCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
// FIX: Import useTheme for theme-aware chart styling
import { useTheme } from '../contexts/ThemeContext';

interface RetirementPlannerProps {
  onNavigateToGlossary: (targetId: string) => void;
}

const RetirementPlanner: React.FC<RetirementPlannerProps> = ({ onNavigateToGlossary }) => {
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
  const [currentAge, setCurrentAge] = useState('30');
  const [retirementAge, setRetirementAge] = useState('65');
  const [currentSavings, setCurrentSavings] = useState('50000');
  const [monthlyContribution, setMonthlyContribution] = useState('500');
  const [annualReturn, setAnnualReturn] = useState('7');
  // Advanced fields
  const [inflationRate, setInflationRate] = useState('3');
  const [postRetirementIncome, setPostRetirementIncome] = useState('40000');
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState('4');

  const { t } = useLanguage();
  // FIX: Get theme from context for chart styling
  const { theme } = useTheme();
  const pageT = t.retirementPlanner;
  const helperT = t.calculatorHelpers;

  const { estimatedSavings, chartData, purchasingPower, sustainableWithdrawal } = useMemo(() => {
    const age = parseInt(currentAge, 10);
    const retireAge = parseInt(retirementAge, 10);
    const P = parseFloat(currentSavings);
    const PMT = parseFloat(monthlyContribution);
    const r = parseFloat(annualReturn) / 100;
    const inflation = parseFloat(inflationRate) / 100;
    const withdrawalRate = parseFloat(safeWithdrawalRate) / 100;
    const yearsToRetire = retireAge - age;

    if (yearsToRetire > 0 && P >= 0 && PMT >= 0 && r >= 0) {
      const n = 12;
      const nt = n * yearsToRetire;
      const fv = P * Math.pow(1 + r / n, nt) + PMT * ((Math.pow(1 + r / n, nt) - 1) / (r / n));

      const data = [];
      let balance = P;
      for (let i = 1; i <= yearsToRetire; i++) {
        for(let j=0; j<12; j++){
            balance = balance * (1 + r/n) + PMT;
        }
        if(i % 5 === 0 || i === yearsToRetire || i === 1){ // chart data every 5 years
            data.push({ age: age + i, value: balance });
        }
      }

      // Advanced calculations
      const power = fv / Math.pow(1 + inflation, yearsToRetire);
      const withdrawal = fv * withdrawalRate;

      return { 
        estimatedSavings: fv, 
        chartData: data,
        purchasingPower: power,
        sustainableWithdrawal: withdrawal
      };
    }
    return { estimatedSavings: 0, chartData: [], purchasingPower: 0, sustainableWithdrawal: 0 };
  }, [currentAge, retirementAge, currentSavings, monthlyContribution, annualReturn, inflationRate, safeWithdrawalRate]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  
  const simpleInputs = (
      <>
        {/* FIX: Added dark mode classes for consistent styling */}
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.currentAge}</label><input type="number" value={currentAge} onChange={e => setCurrentAge(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.retirementAge}</label><input type="number" value={retirementAge} onChange={e => setRetirementAge(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.currentSavings}</label><input type="number" value={currentSavings} onChange={e => setCurrentSavings(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.monthlyContribution}</label><input type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.annualReturn}</label><input type="number" value={annualReturn} onChange={e => setAnnualReturn(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" /></div>
    </>
  );

  return (
    <CalculatorCard title={pageT.title} icon="🏖️" description={pageT.description}>
      <div className="flex justify-end mb-4">
        {/* FIX: Added dark mode classes for consistent styling */}
        <div className="flex items-center space-x-1 bg-gray-200 dark:bg-slate-700 rounded-lg p-1">
          <button onClick={() => setMode('simple')} className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${mode === 'simple' ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}>
            {t.roiCalculator.simple}
          </button>
          <button onClick={() => setMode('advanced')} className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${mode === 'advanced' ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}>
            {t.roiCalculator.advanced}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {simpleInputs}
           {mode === 'advanced' && (
             <>
                {/* FIX: Added dark mode classes for consistent styling */}
                <div className="pt-4 border-t dark:border-slate-700">
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{pageT.advanced.title}</h4>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.advanced.inflationRate}</label><input type="number" value={inflationRate} onChange={e => setInflationRate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.advanced.desiredAnnualIncome}</label><input type="number" value={postRetirementIncome} onChange={e => setPostRetirementIncome(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.advanced.safeWithdrawalRate}</label><input type="number" value={safeWithdrawalRate} onChange={e => setSafeWithdrawalRate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" /></div>
             </>
           )}
        </div>
        <div>
          {/* FIX: Added dark mode classes for consistent styling */}
          <div className="bg-teal-50 dark:bg-slate-700/50 p-6 rounded-lg text-center mb-6">
            <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200">{pageT.estimatedSavings}</h3>
            <p className="text-4xl font-bold text-teal-600 dark:text-teal-400">{formatCurrency(estimatedSavings)}</p>
          </div>
          {mode === 'advanced' && (
             <div className="bg-blue-50 dark:bg-slate-700/50 p-6 rounded-lg text-center mb-6">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">{pageT.advanced.postRetirementAnalysis}</h3>
                <div className="mt-4 space-y-4">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{pageT.advanced.purchasingPower}</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(purchasingPower)}</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{pageT.advanced.sustainableWithdrawal}</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(sustainableWithdrawal)}</p>
                    </div>
                </div>
             </div>
          )}
           <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200 mb-4">{pageT.projectedGrowth}</h3>
           <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                {/* FIX: Added theme-aware chart styling */}
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4b5563' : '#d1d5db'} />
                <XAxis dataKey="age" name={pageT.age} tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                <YAxis tickFormatter={(tick) => `$${tick/1000}k`} tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#d1d5db' }} cursor={{ fill: theme === 'dark' ? 'rgba(100, 116, 139, 0.3)' : 'rgba(203, 213, 225, 0.5)' }}/>
                <Legend formatter={(value) => <span className="text-gray-700 dark:text-gray-300">{value}</span>} />
                <Bar dataKey="value" fill="#14B8A6" name={pageT.savingsValue} />
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>
      </div>
       {/* FIX: Added dark mode classes for consistent styling */}
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

export default RetirementPlanner;
