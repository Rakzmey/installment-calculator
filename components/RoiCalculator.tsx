

import React, { useState, useMemo } from 'react';
import CalculatorCard from './CalculatorCard';
import { useLanguage } from '../contexts/LanguageContext';

interface RoiCalculatorProps {
  onNavigateToGlossary: (targetId: string) => void;
}

const RoiCalculator: React.FC<RoiCalculatorProps> = ({ onNavigateToGlossary }) => {
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');

  // Simple mode states
  const [amountInvested, setAmountInvested] = useState('10000');
  const [amountReturned, setAmountReturned] = useState('12500');

  // Advanced mode states
  const [initialInvestment, setInitialInvestment] = useState('100000');
  const [investmentPeriod, setInvestmentPeriod] = useState('5');
  const [annualGains, setAnnualGains] = useState('30000');
  const [annualCosts, setAnnualCosts] = useState('15000');
  const [salvageValue, setSalvageValue] = useState('10000');
  const [discountRate, setDiscountRate] = useState('15');

  const { t } = useLanguage();
  const pageT = t.roiCalculator;
  const helperT = t.calculatorHelpers;

  const { simpleRoi, netProfit } = useMemo(() => {
    const invested = parseFloat(amountInvested);
    const returned = parseFloat(amountReturned);
    if (invested > 0 && returned >= 0) {
      const profit = returned - invested;
      const returnOnInvestment = (profit / invested) * 100;
      return { simpleRoi: returnOnInvestment, netProfit: profit };
    }
    return { simpleRoi: 0, netProfit: 0 };
  }, [amountInvested, amountReturned]);

  const { advNetProfit, advSimpleRoi, npv, discountedRoi } = useMemo(() => {
    const I0 = parseFloat(initialInvestment);
    const n = parseInt(investmentPeriod, 10);
    const Gt = parseFloat(annualGains);
    const Ct = parseFloat(annualCosts); // Combined operating and maintenance costs
    const Ve = parseFloat(salvageValue);
    const r = parseFloat(discountRate) / 100;

    if (I0 > 0 && n > 0 && Gt >= 0 && Ct >= 0 && Ve >= 0) {
      const totalGains = (Gt * n) + Ve;
      const totalOperatingCosts = Ct * n;
      const netProfit = totalGains - (I0 + totalOperatingCosts);
      const simpleRoi = I0 > 0 ? (netProfit / I0) * 100 : 0;
      
      let currentNpv = -I0;
      if (r > -1) {
        const annualNetCashFlow = Gt - Ct;
        for (let t = 1; t <= n; t++) {
          currentNpv += annualNetCashFlow / Math.pow(1 + r, t);
        }
        currentNpv += Ve / Math.pow(1 + r, n);
      }
      
      const discRoi = I0 > 0 ? (currentNpv / I0) * 100 : 0;

      return { 
        advNetProfit: netProfit,
        advSimpleRoi: simpleRoi,
        npv: currentNpv,
        discountedRoi: discRoi
      };
    }

    return { advNetProfit: 0, advSimpleRoi: 0, npv: 0, discountedRoi: 0 };
  }, [initialInvestment, investmentPeriod, annualGains, annualCosts, salvageValue, discountRate]);


  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const renderSimpleCalculator = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.amountInvested}</label>
          <input type="number" value={amountInvested} onChange={e => setAmountInvested(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.amountReturned}</label>
          <input type="number" value={amountReturned} onChange={e => setAmountReturned(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
        </div>
      </div>

      <div className="bg-teal-50 dark:bg-slate-700/50 p-6 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200 pb-2 mb-4">{pageT.investmentReturn}</h3>
        <p className="text-gray-600 dark:text-gray-300">{pageT.roi}</p>
        <p className={`text-4xl font-bold ${simpleRoi >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-600 dark:text-red-500'}`}>{simpleRoi.toFixed(2)}%</p>
        <hr className="my-4 dark:border-slate-600"/>
        <p className="text-gray-600 dark:text-gray-300">{pageT.netProfit}</p>
        <p className={`text-2xl font-semibold ${netProfit >= 0 ? 'text-gray-700 dark:text-gray-200' : 'text-red-600 dark:text-red-500'}`}>{formatCurrency(netProfit)}</p>
      </div>
    </div>
  );

  const renderAdvancedCalculator = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.initialInvestment}</label>
                <input type="number" value={initialInvestment} onChange={e => setInitialInvestment(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.investmentPeriod}</label>
                <input type="number" value={investmentPeriod} onChange={e => setInvestmentPeriod(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.annualGains}</label>
                <input type="number" value={annualGains} onChange={e => setAnnualGains(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.annualCosts}</label>
                <input type="number" value={annualCosts} onChange={e => setAnnualCosts(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.salvageValue}</label>
                <input type="number" value={salvageValue} onChange={e => setSalvageValue(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.discountRate}</label>
                <input type="number" value={discountRate} onChange={e => setDiscountRate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
            </div>
        </div>

        <div className="bg-teal-50 dark:bg-slate-700/50 p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200 pb-2 mb-2 border-b dark:border-slate-600">{pageT.investmentReturn}</h3>
            <div>
                <div className="flex justify-between items-baseline">
                    <span className="font-medium text-gray-600 dark:text-gray-300">{pageT.netProfit}:</span>
                    <span className={`font-semibold text-lg ${advNetProfit >= 0 ? 'text-gray-800 dark:text-gray-100' : 'text-red-600 dark:text-red-500'}`}>{formatCurrency(advNetProfit)}</span>
                </div>
                 <div className="flex justify-between items-baseline">
                    <span className="font-medium text-gray-600 dark:text-gray-300">{pageT.simpleRoi}:</span>
                    <span className={`font-semibold text-lg ${advSimpleRoi >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-600 dark:text-red-500'}`}>{advSimpleRoi.toFixed(2)}%</span>
                </div>
            </div>
            <hr className="dark:border-slate-600" />
            <div>
                 <h4 className="font-semibold text-teal-800 dark:text-teal-200">{pageT.timeValueAdjusted}</h4>
                 <div className="flex justify-between items-baseline mt-2">
                    <span className="font-medium text-gray-600 dark:text-gray-300">{pageT.npv}:</span>
                    <span className={`font-semibold text-lg ${npv >= 0 ? 'text-gray-800 dark:text-gray-100' : 'text-red-600 dark:text-red-500'}`}>{formatCurrency(npv)}</span>
                </div>
                 <div className="flex justify-between items-baseline">
                    <span className="font-medium text-gray-600 dark:text-gray-300">{pageT.discountedRoi}:</span>
                    <span className={`font-semibold text-lg ${discountedRoi >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-600 dark:text-red-500'}`}>{discountedRoi.toFixed(2)}%</span>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <CalculatorCard title={pageT.title} icon="📈" description={pageT.description}>
      <div className="flex justify-end mb-4">
        <div className="flex items-center space-x-1 bg-gray-200 dark:bg-slate-700 rounded-lg p-1">
          <button
            onClick={() => setMode('simple')}
            className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${mode === 'simple' ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}
          >
            {pageT.simple}
          </button>
          <button
            onClick={() => setMode('advanced')}
            className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${mode === 'advanced' ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}
          >
            {pageT.advanced}
          </button>
        </div>
      </div>
      
      {mode === 'simple' ? renderSimpleCalculator() : renderAdvancedCalculator()}
      
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

export default RoiCalculator;