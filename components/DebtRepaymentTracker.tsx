

import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CalculatorCard from './CalculatorCard';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface AmortizationEntry {
  month: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  extraPayment: number;
  totalPayment: number;
}

const DebtRepaymentTracker: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState('20000');
  const [monthsPaid, setMonthsPaid] = useState('0');
  const [interestRate, setInterestRate] = useState('8');
  const [loanTerm, setLoanTerm] = useState('5');
  const [extraPayment, setExtraPayment] = useState('100');
  
  const [showAmortization, setShowAmortization] = useState(false);

  const { t } = useLanguage();
  const { theme } = useTheme();
  const pageT = t.debtRepaymentTracker;
  const loanPageT = t.loanCalculator;
  
  const { 
    monthlyPayment, 
    originalTotalInterest, 
    earlyPayoffData
  } = useMemo(() => {
    const P = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate);
    const years = parseFloat(loanTerm);
    const extra = parseFloat(extraPayment) || 0;
    const p = parseInt(monthsPaid, 10) || 0;

    const initialReturn = { 
        monthlyPayment: 0, 
        originalTotalInterest: 0, 
        earlyPayoffData: { months: 0, totalInterest: 0, interestSaved: 0, termReducedMonths: 0, schedule: [] }
    };

    if (P > 0 && annualRate >= 0 && years > 0) {
      const i = annualRate / 100 / 12;
      const n = years * 12;
      const M = i > 0 ? P * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1) : P / n;

      if (!isFinite(M)) return initialReturn;

      const originalInterest = (M*n) - P;

      // Calculate current state after 'p' months
      let currentBalance = P;
      let interestPaidSoFar = 0;
      if (p > 0 && p < n) {
          if (i > 0) {
              currentBalance = P * (Math.pow(1+i, n) - Math.pow(1+i, p)) / (Math.pow(1+i, n) - 1);
              interestPaidSoFar = (M * p) - (P - currentBalance);
          } else { // 0 interest case
              currentBalance = P - (M * p);
              interestPaidSoFar = 0;
          }
      }

      // Early payoff calculation from current balance
      let futureMonths = 0;
      let futureInterest = 0;
      let balance = currentBalance;
      const earlySchedule: AmortizationEntry[] = [];
      const totalMonthlyPayment = M + extra;

      if (totalMonthlyPayment > 0 && balance > 0) {
        while (balance > 0) {
          futureMonths++;
          const interestForMonth = balance * i;
          let paymentThisMonth = totalMonthlyPayment;
          
          if (balance + interestForMonth <= paymentThisMonth) {
              paymentThisMonth = balance + interestForMonth;
          }
          
          const principalForMonth = paymentThisMonth - interestForMonth;
          
          balance -= principalForMonth;
          futureInterest += interestForMonth;
          
          const extraPaidThisMonth = Math.max(0, paymentThisMonth - M);
          
          earlySchedule.push({
            month: p + futureMonths,
            principal: principalForMonth,
            interest: interestForMonth,
            remainingBalance: balance < 0 ? 0 : balance,
            extraPayment: extraPaidThisMonth,
            totalPayment: paymentThisMonth
          });

          if(futureMonths > n * 2) break; // Safety break
        }
      }
      
      return {
        monthlyPayment: M,
        originalTotalInterest: originalInterest,
        earlyPayoffData: {
          months: futureMonths,
          totalInterest: futureInterest,
          interestSaved: originalInterest - (interestPaidSoFar + futureInterest),
          termReducedMonths: n - (p + futureMonths),
          schedule: earlySchedule,
        }
      };
    }
    return initialReturn;
  }, [loanAmount, interestRate, loanTerm, extraPayment, monthsPaid]);

  const projectedPayoffDate = useMemo(() => {
    if (earlyPayoffData.months <= 0) return pageT.na;
    
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + earlyPayoffData.months);
    
    return payoffDate.toLocaleDateString();
  }, [earlyPayoffData.months, pageT.na]);
  
  const chartData = useMemo(() => {
    const data: any[] = [];
    const schedule = earlyPayoffData.schedule;
    if (schedule.length === 0) return [];
    
    // Calculate total principal paid up to the start of the simulation
    const principalAlreadyPaid = parseFloat(loanAmount) - schedule[0].remainingBalance - schedule[0].principal;

    for (let i = 0; i < schedule.length; i++) {
        // Show a data point for every year, plus the final point
        if ((schedule[i].month) % 12 === 0 || i === schedule.length - 1) {
            const principalPaidUpToThisPoint = parseFloat(loanAmount) - schedule[i].remainingBalance;
            data.push({
                year: Math.round(schedule[i].month / 12),
                balance: schedule[i].remainingBalance,
                principal: principalPaidUpToThisPoint,
            });
        }
    }
    return data;
  }, [earlyPayoffData.schedule, loanAmount]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded shadow-lg">
          <p className="font-bold text-gray-800 dark:text-gray-100">{`${pageT.year} ${label}`}</p>
          <p style={{ color: payload[0].color }}>{`${payload[0].name}: ${formatCurrency(payload[0].value)}`}</p>
          <p style={{ color: payload[1].color }}>{`${payload[1].name}: ${formatCurrency(payload[1].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const renderAmortizationTable = () => {
    return (
      <div className="overflow-y-auto max-h-96 border dark:border-slate-600 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
          <thead className="bg-gray-50 dark:bg-slate-700 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{loanPageT.month}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{pageT.totalPayment}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{loanPageT.principal}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{loanPageT.interest}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{pageT.extraPayment}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{loanPageT.balance}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {earlyPayoffData.schedule.map(row => (
              <tr key={row.month}>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-500 dark:text-gray-400">{row.month}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(row.totalPayment)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-teal-600 dark:text-teal-400">{formatCurrency(row.principal)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-red-500 dark:text-red-400">{formatCurrency(row.interest)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-500 dark:text-blue-400">{formatCurrency(row.extraPayment)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{formatCurrency(row.remainingBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  return (
    <CalculatorCard title={pageT.title} icon="🏁" description={pageT.description}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.totalLoanAmount}</label>
            <input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.loanTerm}</label>
            <input type="number" value={loanTerm} onChange={e => setLoanTerm(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.interestRate}</label>
            <input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.monthsPaid}</label>
            <input 
              type="number" 
              value={monthsPaid} 
              onChange={e => setMonthsPaid(e.target.value)} 
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{pageT.extraPayment}</label>
            <input type="number" value={extraPayment} onChange={e => setExtraPayment(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-gray-100" />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
            <div className="bg-teal-50 dark:bg-slate-700/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200 border-b dark:border-slate-600 pb-2 mb-4">{pageT.summary}</h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                    <span className="font-medium text-gray-600 dark:text-gray-300">{pageT.monthlyPayment}:</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400 text-xl">{formatCurrency(monthlyPayment)}</span>
                    </div>
                    <div className="flex justify-between">
                    <span className="font-medium text-gray-600 dark:text-gray-300">{pageT.totalInterest}:</span>
                    <span className="font-bold text-gray-700 dark:text-gray-400 line-through">{formatCurrency(originalTotalInterest)}</span>
                    </div>
                    <div className="flex justify-between">
                    <span className="font-medium text-gray-600 dark:text-gray-300">{pageT.payoffDate}:</span>
                    <span className="font-bold text-gray-700 dark:text-gray-200">{projectedPayoffDate}</span>
                    </div>
                </div>
            </div>

            {parseFloat(extraPayment) > 0 || parseInt(monthsPaid, 10) > 0 ? (
                 <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 border-b border-green-200 dark:border-green-800 pb-2 mb-4">{pageT.earlyRepayment.title}</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600 dark:text-gray-300">{pageT.earlyRepayment.interestSaved}:</span>
                            <span className="font-bold text-green-600 text-xl">{formatCurrency(earlyPayoffData.interestSaved)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="font-medium text-gray-600 dark:text-gray-300">{pageT.earlyRepayment.termReduced}:</span>
                            <span className="font-bold text-green-600 text-xl">
                               {Math.floor(earlyPayoffData.termReducedMonths / 12)} {pageT.years} {earlyPayoffData.termReducedMonths % 12} {pageT.months}
                            </span>
                        </div>
                    </div>
                 </div>
            ) : null}
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200 mb-4">{pageT.progressChart}</h3>
         <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4b5563' : '#d1d5db'}/>
                    <XAxis dataKey="year" unit={` ${pageT.years}`} tickFormatter={(tick) => Math.round(tick).toString()} tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }}/>
                    <YAxis tickFormatter={(tick) => `$${tick/1000}k`} tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }}/>
                    <Tooltip cursor={{ fill: theme === 'dark' ? 'rgba(100, 116, 139, 0.3)' : 'rgba(203, 213, 225, 0.5)' }} content={<CustomTooltip />} contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#d1d5db' }}/>
                    <Legend formatter={(value) => <span className="text-gray-700 dark:text-gray-300">{value}</span>}/>
                    <Area type="monotone" dataKey="balance" stackId="1" stroke="#ef4444" fill="#fecaca" name={pageT.remainingBalance} />
                    <Area type="monotone" dataKey="principal" stackId="1" stroke="#10b981" fill="#a7f3d0" name={pageT.principalPaid} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>


      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200">{loanPageT.amortizationSchedule}</h3>
            <button 
                onClick={() => setShowAmortization(!showAmortization)}
                className="text-teal-600 dark:text-teal-400 font-semibold hover:underline focus:outline-none"
            >
                {showAmortization ? loanPageT.hideSchedule : loanPageT.showSchedule}
            </button>
        </div>
        {showAmortization && renderAmortizationTable()}
      </div>
    </CalculatorCard>
  );
};

export default DebtRepaymentTracker;