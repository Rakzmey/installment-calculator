

import React, { useState, useMemo } from 'react';
import CalculatorCard from './CalculatorCard';
import { useLanguage } from '../contexts/LanguageContext';

interface InflationCalculatorProps {
  onNavigateToGlossary: (targetId: string) => void;
}

const InflationCalculator: React.FC<InflationCalculatorProps> = ({ onNavigateToGlossary }) => {
  const [initialAmount, setInitialAmount] = useState('1000');
  const [inflationRate, setInflationRate] = useState('3');
  const [years, setYears] = useState('10');
  const { t } = useLanguage();
  const pageT = t.inflationCalculator;
  const helperT = t.calculatorHelpers;

  const { futureCost, futurePurchasingPower } = useMemo(() => {
    const P = parseFloat(initialAmount);
    const i = parseFloat(inflationRate) / 100;
    const numYears = parseInt(years, 10);

    if (P > 0 && i > -1 && numYears > 0) {
      const fc = P * Math.pow(1 + i, numYears);
      const fpp = P / Math.pow(1 + i, numYears);
      return { futureCost: fc, futurePurchasingPower: fpp };
    }
    return { futureCost: P, futurePurchasingPower: P };
  }, [initialAmount, inflationRate, years]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  const numYears = parseInt(years, 10) || 0;
  const iAmount = parseFloat(initialAmount) || 0;

  return (
    <CalculatorCard title={pageT.title} icon="🌬️" description={pageT.description}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.initialAmount}</label>
            <input type="number" value={initialAmount} onChange={e => setInitialAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.annualInflationRate}</label>
            <input type="number" value={inflationRate} onChange={e => setInflationRate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.numberOfYears}</label>
            <input type="number" value={years} onChange={e => setYears(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
        </div>

        <div className="bg-teal-50 dark:bg-slate-700/50 p-6 rounded-lg space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200">{pageT.futurePurchasingPower}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {pageT.purchasingPowerDescription.replace('{years}', numYears.toString()).replace('{amount}', formatCurrency(iAmount))}
              </p>
              <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{formatCurrency(futurePurchasingPower)}</p>
            </div>
             <hr className="dark:border-slate-600"/>
            <div>
                <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200">{pageT.futureCostOfGoods}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    {pageT.costOfGoodsDescription.replace('{years}', numYears.toString()).replace('{amount}', formatCurrency(iAmount))}
                </p>
                <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{formatCurrency(futureCost)}</p>
            </div>
        </div>
      </div>
       <div className="mt-8 pt-4 border-t border-gray-200 dark:border-slate-600 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
            {helperT.prompt}{' '}
            <button 
                onClick={() => onNavigateToGlossary('inflation')}
                className="text-teal-600 dark:text-teal-400 font-semibold underline hover:text-teal-800 dark:hover:text-teal-300 focus:outline-none"
            >
                {helperT.linkText}
            </button>
        </p>
      </div>
    </CalculatorCard>
  );
};

export default InflationCalculator;