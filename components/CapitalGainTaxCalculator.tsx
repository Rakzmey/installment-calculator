import React, { useState, useMemo } from 'react';
import CalculatorCard from './CalculatorCard';
import { useLanguage } from '../contexts/LanguageContext';

interface CapitalGainTaxCalculatorProps {
  onNavigateToGlossary: (targetId: string) => void;
}

const CapitalGainTaxCalculator: React.FC<CapitalGainTaxCalculatorProps> = ({ onNavigateToGlossary }) => {
  const { t } = useLanguage();
  const pageT = t.capitalGainTaxCalculator;

  const [salesPrice, setSalesPrice] = useState<string>('');
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [otherExpenses, setOtherExpenses] = useState<string>('');

  const actualCalculation = useMemo(() => {
    const sp = parseFloat(salesPrice);
    const pp = parseFloat(purchasePrice);
    const oe = parseFloat(otherExpenses) || 0;

    if (isNaN(sp) || sp <= 0 || isNaN(pp) || pp <= 0) return null;

    const totalActualExpense = pp + oe;
    const capitalGains = sp - totalActualExpense;
    if (capitalGains <= 0) return { tax: 0, capitalGains: capitalGains, totalActualExpense: totalActualExpense };
    
    const tax = capitalGains * 0.20;
    return { tax, capitalGains, totalActualExpense };
  }, [salesPrice, purchasePrice, otherExpenses]);

  const determinationCalculation = useMemo(() => {
    const sp = parseFloat(salesPrice);
    if (isNaN(sp) || sp <= 0) return null;

    const taxableAmount = sp * 0.20;
    const tax = taxableAmount * 0.20;
    return { tax, taxableAmount };
  }, [salesPrice]);

  return (
    <CalculatorCard title={pageT.title} icon="⚖️" description={pageT.description}>
      <div className="space-y-6">
        <div>
          <label htmlFor="salesPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.salesPrice}</label>
          <input
            id="salesPrice"
            type="number"
            value={salesPrice}
            onChange={(e) => setSalesPrice(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            placeholder="150000"
          />
        </div>

        <div>
          <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.purchasePrice}</label>
          <input
            id="purchasePrice"
            type="number"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            placeholder="100000"
          />
        </div>
        <div>
          <label htmlFor="otherExpenses" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.otherExpenses}</label>
          <input
            id="otherExpenses"
            type="number"
            value={otherExpenses}
            onChange={(e) => setOtherExpenses(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            placeholder="15000"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{pageT.deductibleExpensesHint}</p>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-600">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{pageT.results}</h3>
          
          {/* Actual Expenses Deduction Results */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-teal-700 dark:text-teal-300 mb-3">{pageT.actualMethod}</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-700/50 p-3 rounded-md">
                <span className="font-medium text-gray-600 dark:text-gray-300">{pageT.capitalGainTax}</span>
                <span className="text-xl font-bold text-teal-600 dark:text-teal-400">
                  ${actualCalculation?.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">{pageT.capitalGains}</span>
                <span className="text-sm font-medium">${actualCalculation?.capitalGains?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between items-center p-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">{pageT.totalActualExpense}</span>
                <span className="text-sm font-medium">${actualCalculation?.totalActualExpense?.toLocaleString() || '0'}</span>
              </div>
            </div>
          </div>

          {/* Determination-based Deduction Results */}
          <div>
            <h4 className="text-md font-semibold text-teal-700 dark:text-teal-300 mb-3">{pageT.determinationMethod}</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-700/50 p-3 rounded-md">
                <span className="font-medium text-gray-600 dark:text-gray-300">{pageT.capitalGainTax}</span>
                <span className="text-xl font-bold text-teal-600 dark:text-teal-400">
                  ${determinationCalculation?.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">{pageT.taxableAmount}</span>
                <span className="text-sm font-medium">${determinationCalculation?.taxableAmount?.toLocaleString() || '0'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CalculatorCard>
  );
};
export default CapitalGainTaxCalculator;
