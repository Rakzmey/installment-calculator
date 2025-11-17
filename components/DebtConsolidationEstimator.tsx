import React, { useState, useMemo } from 'react';
import CalculatorCard from './CalculatorCard';
import { useLanguage } from '../contexts/LanguageContext';

interface Debt {
  id: number;
  amount: string;
  rate: string;
  remaining: string;
}

interface DebtConsolidationEstimatorProps {
  onNavigateToGlossary: (targetId: string) => void;
}

const DebtConsolidationEstimator: React.FC<DebtConsolidationEstimatorProps> = ({ onNavigateToGlossary }) => {
  const [debts, setDebts] = useState<Debt[]>([
    { id: 1, amount: '5000', rate: '18', remaining: '24' },
    { id: 2, amount: '10000', rate: '9', remaining: '36' },
  ]);
  const [newRate, setNewRate] = useState('7');
  const [newTerm, setNewTerm] = useState('7');
  const [fees, setFees] = useState('');
  const extraPaymentForAnalysis = 50;

  const { t } = useLanguage();
  const pageT = t.debtConsolidation;
  const helperT = t.calculatorHelpers;

  const handleDebtChange = (id: number, field: keyof Omit<Debt, 'id'>, value: string) => {
    setDebts(debts.map(d => d.id === id ? { ...d, [field]: value } : d));
  };
  const addDebt = () => setDebts([...debts, { id: Date.now(), amount: '', rate: '', remaining: '' }]);
  const removeDebt = (id: number) => setDebts(debts.filter(d => d.id !== id));
  
  const {
    current,
    consolidated,
    difference,
    analysis
  } = useMemo(() => {
    // 1. Calculate stats for CURRENT debts
    let totalDebt = 0;
    let currentMonthlyPayment = 0;
    let currentTotalInterest = 0;
    let maxPayoffTime = 0;

    for (const debt of debts) {
        const P = parseFloat(debt.amount) || 0;
        const annualRate = parseFloat(debt.rate) || 0;
        const n = parseInt(debt.remaining, 10) || 0;

        if (P > 0 && n > 0) {
            totalDebt += P;
            maxPayoffTime = Math.max(maxPayoffTime, n);
            
            const i = annualRate / 100 / 12;
            const M = i > 0 ? P * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1) : P / n;
            
            if (isFinite(M)) {
                currentMonthlyPayment += M;
                currentTotalInterest += (M * n) - P;
            }
        }
    }
    const currentTotalCost = totalDebt + currentTotalInterest;

    // 2. Calculate stats for CONSOLIDATED loan
    const loanFees = parseFloat(fees) || 0;
    const P_new = totalDebt + loanFees;
    const annualRate_new = parseFloat(newRate) || 0;
    const years_new = parseFloat(newTerm) || 0;
    const n_new = years_new * 12;

    let newMonthlyPayment = 0;
    let newTotalInterest = 0;
    let newTotalCost = 0;

    if (P_new > 0 && n_new > 0) {
        const i_new = annualRate_new / 100 / 12;
        const M_new = i_new > 0 ? P_new * (i_new * Math.pow(1 + i_new, n_new)) / (Math.pow(1 + i_new, n_new) - 1) : P_new / n_new;
        
        if (isFinite(M_new)) {
            newMonthlyPayment = M_new;
            newTotalInterest = (M_new * n_new) - P_new;
            newTotalCost = P_new + newTotalInterest;
        }
    }

    // 3. Early payoff analysis for consolidated loan
    let analysisData = null;
    if (newMonthlyPayment > 0) {
        const totalMonthlyWithExtra = newMonthlyPayment + extraPaymentForAnalysis;
        let months = 0;
        let totalInterestPaid = 0;
        const i_new = annualRate_new / 100 / 12;
        
        if (i_new > 0 && (P_new * i_new / totalMonthlyWithExtra) < 1) {
            months = - (Math.log(1 - (P_new * i_new / totalMonthlyWithExtra)) / Math.log(1 + i_new));
            months = Math.ceil(months);
            totalInterestPaid = (totalMonthlyWithExtra * months) - P_new;
        } else if (P_new > 0 && i_new <=0) {
            months = P_new / totalMonthlyWithExtra;
            months = Math.ceil(months);
            totalInterestPaid = 0;
        }

        if (months > 0 && months < n_new) {
             analysisData = {
                extraPayment: extraPaymentForAnalysis,
                newTerm: months,
                interestSavings: newTotalInterest - totalInterestPaid,
             };
        }
    }


    return {
        current: {
            totalDebt,
            monthlyPayment: currentMonthlyPayment,
            totalInterest: currentTotalInterest,
            totalCost: currentTotalCost,
            payoffTime: maxPayoffTime,
        },
        consolidated: {
            totalDebt: P_new,
            monthlyPayment: newMonthlyPayment,
            totalInterest: newTotalInterest,
            totalCost: newTotalCost,
            payoffTime: n_new,
        },
        difference: {
            monthlyPayment: currentMonthlyPayment - newMonthlyPayment,
            totalInterest: currentTotalInterest - newTotalInterest,
            totalCost: currentTotalCost - newTotalCost,
            payoffTime: maxPayoffTime - n_new,
        },
        analysis: analysisData,
    };

  }, [debts, newRate, newTerm, fees, pageT]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const formatYearsMonths = (totalMonths: number) => {
    if (totalMonths <= 0 || !isFinite(totalMonths)) return `0 ${pageT.monthsUnit}`;
    const years = Math.floor(totalMonths / 12);
    const months = Math.round(totalMonths % 12);
    let result = '';
    if (years > 0) result += `${years} ${pageT.yearsUnit} `;
    if (months > 0) result += `${months} ${pageT.monthsUnit}`;
    return result.trim() || `0 ${pageT.monthsUnit}`;
  };

  const renderAnalysis = () => {
    if (!analysis) return null;
    
    const monthlySavings = formatCurrency(difference.monthlyPayment);
    const monthlyIncrease = formatCurrency(-difference.monthlyPayment);
    const termDifference = formatYearsMonths(Math.abs(difference.payoffTime));
    const interestDifference = formatCurrency(Math.abs(difference.totalInterest));

    let part1 = '';
    if (difference.monthlyPayment > 0) {
        part1 = pageT.analysis1_decrease.replace('{monthlySavings}', monthlySavings);
    } else {
        part1 = pageT.analysis1_increase.replace('{monthlyIncrease}', monthlyIncrease);
    }

    if (difference.payoffTime > 0) {
        part1 += `, ${pageT.analysis1_shorten.replace('{termDifference}', termDifference)}`;
    } else {
        part1 += `, ${pageT.analysis1_extend.replace('{termDifference}', termDifference)}`;
    }

    if (difference.totalInterest > 0) {
        part1 += `, ${pageT.analysis1_saveMore.replace('{interestDifference}', interestDifference)}.`;
    } else {
        part1 += `, ${pageT.analysis1_payMore.replace('{interestDifference}', interestDifference)}.`;
    }
    
    const part2 = pageT.analysis2
      .replace('{extraPayment}', formatCurrency(analysis.extraPayment))
      .replace('{newTerm}', formatYearsMonths(analysis.newTerm))
      .replace('{interestSavings}', formatCurrency(analysis.interestSavings));

    return (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-slate-700/50 rounded-lg">
            <h4 className="font-bold text-lg text-blue-800 dark:text-blue-300 mb-2">{pageT.analysis}</h4>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>{part1}</li>
                <li>{part2}</li>
            </ul>
        </div>
    );
  }
  
  return (
    <CalculatorCard title={pageT.title} icon="🔗" description={pageT.description}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Side: Inputs */}
        <div className="space-y-6">
          {/* Current Debts */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{pageT.currentDebts}</h3>
            <div className="space-y-3">
              {debts.map((debt) => (
                <div key={debt.id} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-md border dark:border-slate-700 relative">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">{pageT.amount}</label>
                        <input type="number" value={debt.amount} onChange={e => handleDebtChange(debt.id, 'amount', e.target.value)} className="mt-1 block w-full px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md text-sm" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">{pageT.rate}</label>
                        <input type="number" value={debt.rate} onChange={e => handleDebtChange(debt.id, 'rate', e.target.value)} className="mt-1 block w-full px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md text-sm" />
                    </div>
                     <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">{pageT.remaining}</label>
                        <input type="number" value={debt.remaining} onChange={e => handleDebtChange(debt.id, 'remaining', e.target.value)} className="mt-1 block w-full px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md text-sm" />
                    </div>
                  </div>
                   {debts.length > 1 && (
                    <button onClick={() => removeDebt(debt.id)} className="absolute top-1 right-1 p-1 text-red-500 hover:text-red-700 text-lg font-bold leading-none">&times;</button>
                  )}
                </div>
              ))}
              <button onClick={addDebt} className="w-full py-2 text-sm text-teal-600 dark:text-teal-400 font-semibold border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                {pageT.addDebt}
              </button>
            </div>
          </div>
          {/* New Loan */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{pageT.newLoan}</h3>
            <div className="space-y-4">
               <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.interestRate}</label><input type="number" value={newRate} onChange={e => setNewRate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" /></div>
               <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.term}</label><input type="number" value={newTerm} onChange={e => setNewTerm(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" /></div>
               <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.fees}</label><input type="number" value={fees} onChange={e => setFees(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" /></div>
            </div>
          </div>
        </div>
        
        {/* Right Side: Results */}
        <div className="bg-teal-50 dark:bg-slate-800/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-teal-800 dark:text-teal-200 mb-4">{pageT.comparison}</h3>
            <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                     <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-100 dark:bg-slate-700">
                        <tr>
                            <th scope="col" className="px-4 py-3 rounded-l-lg">{pageT.metric}</th>
                            <th scope="col" className="px-4 py-3">{pageT.tableHeaderCurrent}</th>
                            <th scope="col" className="px-4 py-3">{pageT.tableHeaderNew}</th>
                            <th scope="col" className="px-4 py-3 rounded-r-lg">{pageT.tableHeaderDifference}</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y dark:divide-slate-600">
                        <tr className="bg-white dark:bg-slate-800"><td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{pageT.totalDebt}</td><td className="px-4 py-3 text-gray-800 dark:text-gray-200">{formatCurrency(current.totalDebt)}</td><td className="px-4 py-3 text-gray-800 dark:text-gray-200">{formatCurrency(consolidated.totalDebt)}</td><td className="px-4 py-3 text-gray-800 dark:text-gray-200">-</td></tr>
                        <tr className="bg-white dark:bg-slate-800"><td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{pageT.monthlyPayment}</td><td className="px-4 py-3 text-gray-800 dark:text-gray-200">{formatCurrency(current.monthlyPayment)}</td><td className="px-4 py-3 text-gray-800 dark:text-gray-200">{formatCurrency(consolidated.monthlyPayment)}</td><td className={`px-4 py-3 font-bold ${difference.monthlyPayment > 0 ? 'text-green-600' : 'text-red-500'}`}>{formatCurrency(difference.monthlyPayment)}</td></tr>
                        <tr className="bg-white dark:bg-slate-800"><td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{pageT.totalInterestPaid}</td><td className="px-4 py-3 text-gray-800 dark:text-gray-200">{formatCurrency(current.totalInterest)}</td><td className="px-4 py-3 text-gray-800 dark:text-gray-200">{formatCurrency(consolidated.totalInterest)}</td><td className={`px-4 py-3 font-bold ${difference.totalInterest > 0 ? 'text-green-600' : 'text-red-500'}`}>{formatCurrency(difference.totalInterest)}</td></tr>
                        <tr className="bg-white dark:bg-slate-800"><td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{pageT.totalCost}</td><td className="px-4 py-3 text-gray-800 dark:text-gray-200">{formatCurrency(current.totalCost)}</td><td className="px-4 py-3 text-gray-800 dark:text-gray-200">{formatCurrency(consolidated.totalCost)}</td><td className={`px-4 py-3 font-bold ${difference.totalCost > 0 ? 'text-green-600' : 'text-red-500'}`}>{formatCurrency(difference.totalCost)}</td></tr>
                        <tr className="bg-white dark:bg-slate-800"><td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{pageT.payoffTime}</td><td className="px-4 py-3 text-gray-800 dark:text-gray-200">{formatYearsMonths(current.payoffTime)}</td><td className="px-4 py-3 text-gray-800 dark:text-gray-200">{formatYearsMonths(consolidated.payoffTime)}</td><td className={`px-4 py-3 font-bold ${difference.payoffTime > 0 ? 'text-green-600' : 'text-red-500'}`}>{formatYearsMonths(difference.payoffTime)}</td></tr>
                     </tbody>
                 </table>
            </div>
            {renderAnalysis()}
        </div>
      </div>

       <div className="mt-8 pt-4 border-t border-gray-200 dark:border-slate-600 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
            {helperT.prompt}{' '}
            <button 
                onClick={() => onNavigateToGlossary('debt-consolidation')}
                className="text-teal-600 dark:text-teal-400 font-semibold underline hover:text-teal-800 dark:hover:text-teal-300 focus:outline-none"
            >
                {helperT.linkText}
            </button>
        </p>
      </div>
    </CalculatorCard>
  );
};

export default DebtConsolidationEstimator;