

import React, { useState, useMemo } from 'react';
import CalculatorCard from './CalculatorCard';
import { useLanguage } from '../contexts/LanguageContext';

interface FixedDepositCalculatorProps {
  onNavigateToGlossary: (targetId: string) => void;
}

const FixedDepositCalculator: React.FC<FixedDepositCalculatorProps> = ({ onNavigateToGlossary }) => {
  const [depositAmount, setDepositAmount] = useState('5000');
  const [interestRate, setInterestRate] = useState('6.5');
  const [duration, setDuration] = useState('3');
  const [isForeigner, setIsForeigner] = useState(false);
  const [whtRate, setWhtRate] = useState('6'); // Default to 6% for resident fixed term deposit
  const { t } = useLanguage();
  const pageT = t.fixedDeposit;
  const helperT = t.calculatorHelpers;

  const { totalInterest, maturityAmount } = useMemo(() => {
    const P = parseFloat(depositAmount);
    const r = parseFloat(interestRate) / 100;
    const t = parseFloat(duration);

    if (P > 0 && r > 0 && t > 0) {
      const taxRate = parseFloat(whtRate) / 100;
      // Simple Interest Calculation
      const interestBeforeTax = P * r * t;
      const taxAmount = interestBeforeTax * taxRate;
      const totalInterest = interestBeforeTax - taxAmount;
      const maturity = P + totalInterest;
      return { totalInterest: totalInterest, maturityAmount: maturity };
    }
    return { totalInterest: 0, maturityAmount: 0 };
  }, [depositAmount, interestRate, duration, whtRate]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <CalculatorCard title={pageT.title} icon="🔒" description={pageT.description}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.depositAmount}</label>
            <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.interestRate}</label>
            <input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.duration}</label>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="isForeignerFD"
              checked={isForeigner}
              onChange={(e) => {
                setIsForeigner(e.target.checked);
                setWhtRate(e.target.checked ? '14' : '6'); // Set default WHT based on residency
              }}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded dark:bg-slate-700 dark:border-slate-600"
            />
            <label htmlFor="isForeignerFD" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              {t.savingsCalculator.isForeigner}
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.savingsCalculator.whtRate}</label>
            <input
              type="number"
              value={whtRate}
              onChange={e => setWhtRate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t.savingsCalculator.whtHint}</p>
          </div>
        </div>

        {/* Results */}
        <div className="bg-teal-50 dark:bg-slate-700/50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200 border-b dark:border-slate-600 pb-2 mb-4">{pageT.returns}</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="font-medium text-gray-600 dark:text-gray-300">{pageT.totalInterest}:</span>
              <span className="font-bold text-gray-700 dark:text-gray-200">{formatCurrency(totalInterest)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="font-medium text-gray-600 dark:text-gray-300">{pageT.maturityAmount}:</span>
              <span className="font-bold text-teal-600 dark:text-teal-400 text-xl">{formatCurrency(maturityAmount)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-4 border-t border-gray-200 dark:border-slate-600 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
            {helperT.prompt}{' '}
            <button 
                onClick={() => onNavigateToGlossary('fixed-deposit')}
                className="text-teal-600 dark:text-teal-400 font-semibold underline hover:text-teal-800 dark:hover:text-teal-300 focus:outline-none"
            >
                {helperT.linkText}
            </button>
        </p>
      </div>
    </CalculatorCard>
  );
};

export default FixedDepositCalculator;