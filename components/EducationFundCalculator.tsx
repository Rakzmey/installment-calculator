
import React, { useState, useMemo } from 'react';
import CalculatorCard from './CalculatorCard';
import { useLanguage } from '../contexts/LanguageContext';

interface EducationFundCalculatorProps {
  onNavigateToGlossary: (targetId: string) => void;
}

const EducationFundCalculator: React.FC<EducationFundCalculatorProps> = ({ onNavigateToGlossary }) => {
  const [childsAge, setChildsAge] = useState('5');
  const [collegeAge, setCollegeAge] = useState('18');
  const [currentCost, setCurrentCost] = useState('25000');
  const [inflationRate, setInflationRate] = useState('4');
  const [investmentReturn, setInvestmentReturn] = useState('6');
  const { t } = useLanguage();
  const pageT = t.educationFund;
  const helperT = t.calculatorHelpers;

  const { futureCost, monthlySavings } = useMemo(() => {
    const age = parseInt(childsAge, 10);
    const colAge = parseInt(collegeAge, 10);
    const cost = parseFloat(currentCost);
    const inflation = parseFloat(inflationRate) / 100;
    const investReturn = parseFloat(investmentReturn) / 100;

    const yearsToCollege = colAge - age;

    if (yearsToCollege > 0 && cost > 0) {
      const fCost = cost * Math.pow(1 + inflation, yearsToCollege);
      
      let mSavings = 0;
      const r = investReturn / 12;
      const n = yearsToCollege * 12;

      if(investReturn > 0) {
        const factor = (Math.pow(1 + r, n) - 1) / r;
        mSavings = fCost / factor;
      } else if (n > 0) {
        mSavings = fCost / n;
      }
      
      return { futureCost: fCost, monthlySavings: mSavings };
    }
    return { futureCost: 0, monthlySavings: 0 };
  }, [childsAge, collegeAge, currentCost, inflationRate, investmentReturn]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <CalculatorCard title={pageT.title} icon="🎓" description={pageT.description}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* FIX: Added dark mode classes for consistent styling */}
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.childsAge}</label><input type="number" value={childsAge} onChange={e => setChildsAge(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.collegeAge}</label><input type="number" value={collegeAge} onChange={e => setCollegeAge(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.currentCost}</label><input type="number" value={currentCost} onChange={e => setCurrentCost(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.inflationRate}</label><input type="number" value={inflationRate} onChange={e => setInflationRate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.investmentReturn}</label><input type="number" value={investmentReturn} onChange={e => setInvestmentReturn(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" /></div>
        </div>
        {/* FIX: Added dark mode classes for consistent styling */}
        <div className="bg-teal-50 dark:bg-slate-700/50 p-6 rounded-lg space-y-4 text-center">
            <div>
              <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200">{pageT.futureCost}</h3>
              <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{formatCurrency(futureCost)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{pageT.futureCostNote}</p>
            </div>
             <hr className="dark:border-slate-600"/>
            <div>
                <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200">{pageT.monthlySavings}</h3>
                <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{formatCurrency(monthlySavings)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{pageT.monthlySavingsNote}</p>
            </div>
        </div>
      </div>
      {/* FIX: Added dark mode classes for consistent styling */}
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

export default EducationFundCalculator;
