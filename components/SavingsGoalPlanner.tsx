

import React, { useState, useMemo } from 'react';
import CalculatorCard from './CalculatorCard';
import { useLanguage } from '../contexts/LanguageContext';

interface SavingsGoalPlannerProps {
  onNavigateToGlossary: (targetId: string) => void;
}

const SavingsGoalPlanner: React.FC<SavingsGoalPlannerProps> = ({ onNavigateToGlossary }) => {
  const [savingsGoal, setSavingsGoal] = useState('20000');
  const [initialAmount, setInitialAmount] = useState('1000');
  const [timePeriod, setTimePeriod] = useState('5');
  const [interestRate, setInterestRate] = useState('4');
  const { t } = useLanguage();
  const pageT = t.savingsGoalPlanner;
  const helperT = t.calculatorHelpers;

  const monthlyContribution = useMemo(() => {
    const FV = parseFloat(savingsGoal);
    const PV = parseFloat(initialAmount);
    const years = parseFloat(timePeriod);
    const r = parseFloat(interestRate) / 100;

    if (FV > PV && years > 0 && r >= 0) {
      const n = 12;
      const nt = n * years;
      const ratePerPeriod = r / n;
      
      const futureValueOfPV = PV * Math.pow(1 + ratePerPeriod, nt);
      const shortfall = FV - futureValueOfPV;

      if(shortfall <= 0) return 0; // Initial amount is enough

      const compoundFactor = (Math.pow(1 + ratePerPeriod, nt) - 1) / ratePerPeriod;

      if (compoundFactor > 0) {
        const pmt = shortfall / compoundFactor;
        return pmt;
      }
    }
    return 0;
  }, [savingsGoal, initialAmount, timePeriod, interestRate]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <CalculatorCard title={pageT.title} icon="🎯" description={pageT.description}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.savingsGoal}</label>
            <input type="number" value={savingsGoal} onChange={e => setSavingsGoal(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.initialAmount}</label>
            <input type="number" value={initialAmount} onChange={e => setInitialAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.timePeriod}</label>
            <input type="number" value={timePeriod} onChange={e => setTimePeriod(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.annualReturn}</label>
            <input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
        </div>

        <div className="bg-teal-50 dark:bg-slate-700/50 p-6 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200 pb-2 mb-4">{pageT.requiredSavings}</h3>
            <p className="text-4xl font-bold text-teal-600 dark:text-teal-400">{formatCurrency(monthlyContribution)}</p>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {/* FIX: Changed `description` to `resultDescription` to resolve duplicate key error in translations.ts */}
              {pageT.resultDescription.replace('{amount}', formatCurrency(parseFloat(savingsGoal))).replace('{years}', timePeriod)}
            </p>
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

export default SavingsGoalPlanner;