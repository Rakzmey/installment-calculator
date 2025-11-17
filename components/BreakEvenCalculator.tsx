import React, { useState, useMemo } from 'react';
import CalculatorCard from './CalculatorCard';
import { useLanguage } from '../contexts/LanguageContext';

interface BreakEvenCalculatorProps {
  onNavigateToGlossary: (targetId: string) => void;
}

const BreakEvenCalculator: React.FC<BreakEvenCalculatorProps> = ({ onNavigateToGlossary }) => {
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
  const [fixedCosts, setFixedCosts] = useState('10000');
  const [variableCost, setVariableCost] = useState('15');
  const [salePrice, setSalePrice] = useState('40');
  // Advanced field
  const [targetProfit, setTargetProfit] = useState('5000');
  
  const { t } = useLanguage();
  const pageT = t.breakEvenCalculator;
  const helperT = t.calculatorHelpers;

  const { breakEvenUnits, breakEvenRevenue, unitsForProfit, revenueForProfit } = useMemo(() => {
    const fc = parseFloat(fixedCosts);
    const vc = parseFloat(variableCost);
    const sp = parseFloat(salePrice);
    const profit = parseFloat(targetProfit);
    const contributionMargin = sp - vc;

    let beUnits = 0;
    let beRevenue = 0;
    let profitUnits = 0;
    let profitRevenue = 0;

    if (contributionMargin > 0) {
      beUnits = fc / contributionMargin;
      beRevenue = beUnits * sp;

      if(mode === 'advanced') {
        profitUnits = (fc + profit) / contributionMargin;
        profitRevenue = profitUnits * sp;
      }
    }

    return { 
        breakEvenUnits: beUnits, 
        breakEvenRevenue: beRevenue,
        unitsForProfit: profitUnits,
        revenueForProfit: profitRevenue
    };
  }, [fixedCosts, variableCost, salePrice, targetProfit, mode]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const renderSimpleMode = () => (
      <div className="bg-teal-50 dark:bg-slate-700/50 p-6 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200 pb-2 mb-4">{pageT.breakEvenPoint}</h3>
        <p className="text-4xl font-bold text-teal-600 dark:text-teal-400">{Math.ceil(breakEvenUnits).toLocaleString()} {pageT.units}</p>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          {pageT.resultDescription.replace('{units}', Math.ceil(breakEvenUnits).toLocaleString())}
        </p>
      </div>
  );

  const renderAdvancedMode = () => (
    <div className="bg-teal-50 dark:bg-slate-700/50 p-6 rounded-lg space-y-6">
        <div className="text-center">
            <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200">{pageT.advanced.breakEvenAnalysis}</h3>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{Math.ceil(breakEvenUnits).toLocaleString()} {pageT.units}</p>
            <p className="text-md text-gray-600 dark:text-gray-300">{pageT.advanced.orRevenue} <span className="font-semibold">{formatCurrency(breakEvenRevenue)}</span></p>
        </div>
        <hr className="dark:border-slate-600" />
         <div className="text-center">
            <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200">{pageT.advanced.targetProfitAnalysis}</h3>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{Math.ceil(unitsForProfit).toLocaleString()} {pageT.units}</p>
             <p className="text-md text-gray-600 dark:text-gray-300">{pageT.advanced.orRevenue} <span className="font-semibold">{formatCurrency(revenueForProfit)}</span></p>
        </div>
    </div>
  );


  return (
    <CalculatorCard title={pageT.title} icon="⚖️" description={pageT.description}>
       <div className="flex justify-end mb-4">
        <div className="flex items-center space-x-1 bg-gray-200 dark:bg-slate-700 rounded-lg p-1">
          <button onClick={() => setMode('simple')} className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${mode === 'simple' ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}>
            {t.roiCalculator.simple}
          </button>
          <button onClick={() => setMode('advanced')} className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${mode === 'advanced' ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}>
            {t.roiCalculator.advanced}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.fixedCosts}</label>
            <input type="number" value={fixedCosts} onChange={e => setFixedCosts(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.variableCostPerUnit}</label>
            <input type="number" value={variableCost} onChange={e => setVariableCost(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.salePricePerUnit}</label>
            <input type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
          {mode === 'advanced' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.advanced.targetProfit}</label>
                <input type="number" value={targetProfit} onChange={e => setTargetProfit(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
              </div>
          )}
        </div>

        {mode === 'simple' ? renderSimpleMode() : renderAdvancedMode()}

      </div>
       <div className="mt-8 pt-4 border-t border-gray-200 dark:border-slate-600 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
            {helperT.prompt}{' '}
            <button 
                onClick={() => onNavigateToGlossary('break-even-point')}
                className="text-teal-600 dark:text-teal-400 font-semibold underline hover:text-teal-800 dark:hover:text-teal-300 focus:outline-none"
            >
                {helperT.linkText}
            </button>
        </p>
      </div>
    </CalculatorCard>
  );
};

export default BreakEvenCalculator;